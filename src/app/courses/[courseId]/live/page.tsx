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
    <div className="min-h-screen bg-mesh has-bottom-nav">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Back link */}
        <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-indigo-500 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          수업 홈
        </Link>

        {/* Live status banner */}
        {isOpen ? (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 shadow-3d-lg p-5 text-white animate-slide-up">
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-xl" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2.5">
                <span className="live-dot" />
                <span className="text-sm font-black tracking-wide">LIVE NOW</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium opacity-90">
                <span className="glass-dark px-3 py-1 rounded-full">{remaining} 남음</span>
                <span className="glass-dark px-3 py-1 rounded-full">{notes.length}개 노트</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="card-3d p-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 bg-slate-300 rounded-full" />
              <span className="text-sm font-bold text-slate-500">수업이 종료되었습니다</span>
            </div>
          </div>
        )}

        {/* Note input form */}
        {isOpen && (
          <>
            <form onSubmit={postNote} className="card-3d p-5 space-y-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="수업 내용을 공유해보세요..."
                className="w-full glass rounded-2xl px-4 py-3 resize-none h-20 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-sm transition border-0"
              />
              {error && <p className="text-red-500 text-xs bg-red-50/80 backdrop-blur rounded-xl px-3 py-2">{error}</p>}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm">+1P</span>
                <button type="submit" className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold btn-3d animate-gradient">
                  노트 작성
                </button>
              </div>
            </form>

            {/* Live notes */}
            <div className="space-y-2.5 stagger-children">
              {notes.map((note) => {
                const r = reactions[note.id];
                return (
                  <div key={note.id} className="card-3d p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-xs font-bold text-indigo-600 shadow-sm">
                        {note.author.avatar || (note.author.nickname || "?")[0]}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{note.author.nickname}</span>
                      {note.author.school && <span className="text-[10px] text-slate-400 glass px-2 py-0.5 rounded-full">{note.author.school.name}</span>}
                      <span className="text-[10px] text-slate-300 ml-auto">{new Date(note.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      {Object.entries(EMOJI_MAP).map(([key, emoji]) => {
                        const count = r?.emojis?.[key] || 0;
                        const reacted = r?.userIds?.includes(user?.id || "");
                        return (
                          <button key={key} onClick={() => toggleReaction(note.id, key)}
                            className={`text-xs px-2.5 py-1.5 rounded-xl transition-all active:scale-95 ${reacted ? "glass border border-indigo-200 shadow-sm" : "glass border border-white/50 hover:border-indigo-200"}`}>
                            {emoji} {count > 0 && <span className="ml-0.5 font-bold">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {notes.length === 0 && (
                <div className="text-center py-12 card-3d" style={{ borderStyle: "dashed" }}>
                  <div className="text-3xl mb-2">📝</div>
                  <p className="text-slate-400 text-sm">첫 번째 노트를 작성해보세요!</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Closed session actions */}
        {!isOpen && (
          <div className="card-3d p-6 space-y-4">
            <p className="text-center text-sm text-slate-500 font-medium">수업이 끝났어요. 복습하고 요약을 만들어볼까요?</p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
              <button onClick={generateSummary} disabled={genLoading}
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-5 py-3 rounded-2xl text-xs font-bold btn-3d animate-gradient disabled:opacity-50">
                {genLoading ? "생성 중..." : "✨ AI 요약 생성 (+5P)"}
              </button>
              <Link href={`/courses/${courseId}/qa?sessionId=${sessionId}`}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-3 rounded-2xl text-xs font-bold text-center btn-3d">
                💬 질문하기 (+2P)
              </Link>
            </div>
            {error && <p className="text-red-500 text-xs bg-red-50/80 backdrop-blur rounded-xl px-3 py-2 text-center">{error}</p>}
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div className="card-3d p-5 space-y-4 animate-slide-up">
            <h2 className="text-base font-bold flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center text-sm">✨</span>
              AI 수업 요약
            </h2>
            <div>
              <h3 className="text-xs font-bold text-slate-500 mb-2">핵심 내용</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed glass rounded-2xl p-3">{summary.keyPoints}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-500 mb-2">주요 용어</h3>
              <div className="flex gap-2 flex-wrap">
                {summary.terms.map((t, i) => <span key={i} className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 px-3 py-1.5 rounded-xl text-xs font-bold border border-indigo-100">{t}</span>)}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-500 mb-2">예상 질문</h3>
              <div className="space-y-2 stagger-children">
                {summary.expectedQuestions.map((q, i) => (
                  <p key={i} className="text-sm text-slate-600 glass rounded-2xl px-4 py-2.5">Q{i + 1}. {q}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Past session notes */}
        {!isOpen && notes.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-sm font-bold text-slate-600 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-xs">📋</span>
              수업 노트 ({notes.length})
            </h3>
            <div className="stagger-children space-y-2.5">
              {notes.map((note) => (
                <div key={note.id} className="card-3d p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-[10px] font-bold text-indigo-600 shadow-sm">
                      {note.author.avatar || (note.author.nickname || "?")[0]}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{note.author.nickname}</span>
                    <span className="text-[10px] text-slate-300">{new Date(note.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{note.content}</p>
                </div>
              ))}
            </div>
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
