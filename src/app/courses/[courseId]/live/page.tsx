"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import Link from "next/link";

interface Note { id: string; content: string; tags: string; createdAt: string; author: { id: string; nickname: string; schoolId: string } }
interface GateInfo { status: string; remainingMs: number }
interface SummaryData { keyPoints: string; terms: string[]; expectedQuestions: string[] }

function LiveContent({ courseId }: { courseId: string }) {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") || "";
  const showSummary = searchParams.get("summary") === "1";

  const [gate, setGate] = useState<GateInfo | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [error, setError] = useState("");
  const [remaining, setRemaining] = useState("");
  const [genLoading, setGenLoading] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    function doFetch() {
      fetch(`/api/live-note?sessionId=${sessionId}`).then((r) => r.json()).then((d) => {
        setGate(d.gate);
        setNotes(d.notes || []);
      });
    }
    doFetch();
    const interval = setInterval(doFetch, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  useEffect(() => {
    if (!gate?.remainingMs) return;
    const interval = setInterval(() => {
      if (!gate) return;
      const ms = gate.remainingMs - 1000;
      if (ms <= 0) { setRemaining("종료됨"); return; }
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
    try {
      const res = await fetch("/api/live-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setContent("");
      fetch(`/api/live-note?sessionId=${sessionId}`).then((r) => r.json()).then((d) => {
        setGate(d.gate);
        setNotes(d.notes || []);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류 발생");
    }
  }

  async function generateSummary() {
    setGenLoading(true);
    try {
      const res = await fetch("/api/summary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      try { setSummary(JSON.parse(data.summary.content)); } catch { setSummary(null); }
    } catch (err) {
      setError(err instanceof Error ? err.message : "요약 생성 실패");
    } finally {
      setGenLoading(false);
    }
  }

  const isOpen = gate?.status === "LIVE_OPEN";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Link href={`/courses/${courseId}`} className="text-sm text-blue-600 hover:underline">&larr; 수업 홈</Link>

        {/* Gate Status Banner */}
        <div className={`rounded-xl p-4 text-center font-semibold ${isOpen ? "bg-red-500 text-white" : "bg-gray-200 text-gray-600"}`}>
          {isOpen ? `LIVE OPEN - 남은 시간: ${remaining}` : "LIVE CLOSED - 수업 시간이 아닙니다"}
        </div>

        {isOpen && (
          <>
            <form onSubmit={postNote} className="bg-white rounded-xl shadow p-4">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="노트를 작성하세요..."
                className="w-full border rounded-lg px-4 py-3 resize-none h-24 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              <button type="submit" className="mt-2 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">작성</button>
            </form>

            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note.id} className="bg-white rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-blue-600">{note.author.nickname}</span>
                    <span className="text-xs text-gray-400">{new Date(note.createdAt).toLocaleTimeString("ko-KR")}</span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
              {notes.length === 0 && <div className="text-center py-8 text-gray-400">아직 노트가 없습니다</div>}
            </div>
          </>
        )}

        {!isOpen && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <p className="text-center text-gray-500">수업이 끝났어요. 요약/질문으로 정리해요!</p>
            <div className="flex gap-3 justify-center">
              <button onClick={generateSummary} disabled={genLoading} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {genLoading ? "생성 중..." : "요약 생성하기"}
              </button>
              <Link href={`/courses/${courseId}/qa?sessionId=${sessionId}`} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700">질문하기</Link>
            </div>
          </div>
        )}

        {(showSummary || summary) && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-lg font-bold">세션 요약</h2>
            {summary ? (
              <>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">핵심 요약</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{summary.keyPoints}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">주요 용어</h3>
                  <div className="flex gap-2 flex-wrap">{summary.terms.map((t, i) => <span key={i} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs">{t}</span>)}</div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 mb-2">예상 질문</h3>
                  {summary.expectedQuestions.map((q, i) => <p key={i} className="text-sm text-gray-600">Q{i + 1}. {q}</p>)}
                </div>
              </>
            ) : (
              <button onClick={generateSummary} disabled={genLoading} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm">
                {genLoading ? "생성 중..." : "요약 생성하기"}
              </button>
            )}
          </div>
        )}

        {error && !isOpen && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}

export default function LivePage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  return <AuthGuard><Suspense><LiveContent courseId={courseId} /></Suspense></AuthGuard>;
}
