"use client";

import { useState, useEffect, use, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import Link from "next/link";

interface Note { id: string; content: string; tags: string; createdAt: string; author: { id: string; nickname: string; avatar?: string; schoolId: string; school?: { name: string } } }
interface GateInfo { status: string; remainingMs: number }
interface SummaryData { keyPoints: string; terms: string[]; expectedQuestions: string[] }
interface ReactionData { count: number; emojis: Record<string, number>; userIds: string[] }

const EMOJI_MAP: Record<string, string> = { helpful: "\uD83D\uDC4D", great: "\uD83D\uDD25", insightful: "\uD83D\uDCA1", fire: "\u2B50" };

function LiveContent({ courseId }: { courseId: string }) {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") || "";

  const [gate, setGate] = useState<GateInfo | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [reactions, setReactions] = useState<Record<string, ReactionData>>({});

  const fetchReactions = useCallback((noteIds: string[]) => {
    if (noteIds.length === 0) return;
    fetch(`/api/reaction?targetType=note&targetIds=${noteIds.join(",")}`).then((r) => r.json()).then((d) => setReactions(d.reactions || {}));
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    function doFetch() {
      fetch(`/api/live-note?sessionId=${sessionId}`).then((r) => r.json()).then((d) => {
        setGate(d.gate);
        const n = d.notes || [];
        setNotes(n);
        fetchReactions(n.map((x: Note) => x.id));
      });
    }
    doFetch();
    const interval = setInterval(doFetch, 5000);
    return () => clearInterval(interval);
  }, [sessionId, fetchReactions]);

  useEffect(() => {
    if (!gate?.remainingMs) return;
    const interval = setInterval(() => {
      if (!gate) return;
      const ms = gate.remainingMs - 1000;
      if (ms <= 0) { setRemaining("수업 종료"); return; }
      const min = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      setRemaining(`${min}분 ${sec}초`);
      gate.remainingMs = ms;
    }, 1000);
    return () => clearInterval(interval);
  }, [gate]);

  async function postNote(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setError("");
    const res = await fetch("/api/live-note", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId, content }) });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setContent("");
    const d = await fetch(`/api/live-note?sessionId=${sessionId}`).then((r) => r.json());
    setNotes(d.notes || []);
    fetchReactions((d.notes || []).map((x: Note) => x.id));
  }

  async function toggleReaction(noteId: string, emoji: string) {
    await fetch("/api/reaction", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ targetType: "note", targetId: noteId, emoji }) });
    fetchReactions(notes.map((n) => n.id));
  }

  async function generateSummary() {
    setGenLoading(true);
    try {
      const res = await fetch("/api/summary/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionId }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      try { setSummary(JSON.parse(data.summary.content)); } catch { setSummary(null); }
    } catch (err) { setError(err instanceof Error ? err.message : "요약 생성 실패"); }
    finally { setGenLoading(false); }
  }

  const isOpen = gate?.status === "LIVE_OPEN";

  return (
    <div className="min-h-screen bg-[#f8f9fb] has-bottom-nav">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Back link */}
        <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          수업 홈
        </Link>

        {/* Live status banner */}
        <div className={`rounded-2xl p-4 text-center font-semibold shadow-sm ${isOpen ? "bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-red-100" : "bg-white border border-gray-100 text-gray-500"}`}>
          {isOpen ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-bold">LIVE NOW</span>
              </div>
              <span className="text-xs font-normal opacity-90">{remaining} 남음 &middot; {notes.length}개 노트</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm">수업이 종료되었습니다</span>
            </div>
          )}
        </div>

        {/* Note input form */}
        {isOpen && (
          <>
            <form onSubmit={postNote} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="수업 내용을 공유해보세요..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 resize-none h-20 focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none text-sm transition"
              />
              {error && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2 mt-2">{error}</p>}
              <div className="flex justify-between items-center mt-3">
                <span className="text-[10px] text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">노트 작성 +1P</span>
                <button type="submit" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all">
                  노트 작성
                </button>
              </div>
            </form>

            {/* Live notes */}
            <div className="space-y-2">
              {notes.map((note) => {
                const r = reactions[note.id];
                return (
                  <div key={note.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                        {note.author.avatar || (note.author.nickname || "?")[0]}
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{note.author.nickname}</span>
                      {note.author.school && <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{note.author.school.name}</span>}
                      <span className="text-[10px] text-gray-300 ml-auto">{new Date(note.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      {Object.entries(EMOJI_MAP).map(([key, emoji]) => {
                        const count = r?.emojis?.[key] || 0;
                        const reacted = r?.userIds?.includes(user?.id || "");
                        return (
                          <button key={key} onClick={() => toggleReaction(note.id, key)}
                            className={`text-xs px-2.5 py-1.5 rounded-full border transition-all active:scale-95 ${reacted ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-gray-50 border-gray-100 hover:bg-gray-100"}`}>
                            {emoji} {count > 0 && <span className="ml-0.5 font-medium">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {notes.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-3xl mb-2">📝</div>
                  <p className="text-gray-400 text-sm">첫 번째 노트를 작성해보세요!</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Closed session actions */}
        {!isOpen && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <p className="text-center text-sm text-gray-500">수업이 끝났어요. 복습하고 요약을 만들어볼까요?</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button onClick={generateSummary} disabled={genLoading}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-5 py-3 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all disabled:opacity-50">
                {genLoading ? "생성 중..." : "✨ AI 요약 생성 (+5P)"}
              </button>
              <Link href={`/courses/${courseId}/qa?sessionId=${sessionId}`}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-5 py-3 rounded-xl text-xs font-semibold text-center active:scale-[0.98] transition-all">
                💬 질문하기 (+2P)
              </Link>
            </div>
            {error && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2 text-center">{error}</p>}
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">✨ AI 수업 요약</h2>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2">핵심 내용</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{summary.keyPoints}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2">주요 용어</h3>
              <div className="flex gap-2 flex-wrap">
                {summary.terms.map((t, i) => <span key={i} className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 px-3 py-1.5 rounded-full text-xs font-medium">{t}</span>)}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 mb-2">예상 질문</h3>
              <div className="space-y-1.5">
                {summary.expectedQuestions.map((q, i) => (
                  <p key={i} className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">Q{i + 1}. {q}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Past session notes */}
        {!isOpen && notes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-600 flex items-center gap-2">📋 수업 노트 ({notes.length})</h3>
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600">
                    {note.author.avatar || (note.author.nickname || "?")[0]}
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{note.author.nickname}</span>
                  <span className="text-[10px] text-gray-300">{new Date(note.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LivePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  return <AuthGuard><Suspense><LiveContent courseId={courseId} /></Suspense></AuthGuard>;
}
