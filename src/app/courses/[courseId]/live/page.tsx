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
      if (ms <= 0) { setRemaining("session ended"); return; }
      const min = Math.floor(ms / 60000);
      const sec = Math.floor((ms % 60000) / 1000);
      setRemaining(`${min}m ${sec}s`);
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
    } catch (err) { setError(err instanceof Error ? err.message : "Summary generation failed"); }
    finally { setGenLoading(false); }
  }

  const isOpen = gate?.status === "LIVE_OPEN";

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <Link href={`/courses/${courseId}`} className="text-sm text-blue-600 hover:underline">&larr; Course Home</Link>

        <div className={`rounded-xl p-4 text-center font-semibold ${isOpen ? "bg-gradient-to-r from-red-500 to-pink-500 text-white" : "bg-gray-200 text-gray-600"}`}>
          {isOpen ? (
            <div className="flex items-center justify-center gap-3">
              <span className="inline-block w-3 h-3 bg-white rounded-full animate-pulse" />
              LIVE NOW - {remaining} remaining
              <span className="text-sm font-normal opacity-80">{notes.length} notes</span>
            </div>
          ) : "LIVE CLOSED - Class is not in session"}
        </div>

        {isOpen && (
          <>
            <form onSubmit={postNote} className="bg-white rounded-xl shadow p-4">
              <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share your notes with classmates..." className="w-full border rounded-lg px-4 py-3 resize-none h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm" />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">+1P for each note</span>
                <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Post Note</button>
              </div>
            </form>

            <div className="space-y-2">
              {notes.map((note) => {
                const r = reactions[note.id];
                return (
                  <div key={note.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center text-sm">
                        {note.author.avatar || (note.author.nickname || "?")[0]}
                      </div>
                      <span className="text-sm font-medium text-blue-600">{note.author.nickname}</span>
                      {note.author.school && <span className="text-xs text-gray-400">{note.author.school.name}</span>}
                      <span className="text-xs text-gray-300 ml-auto">{new Date(note.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      {Object.entries(EMOJI_MAP).map(([key, emoji]) => {
                        const count = r?.emojis?.[key] || 0;
                        const reacted = r?.userIds?.includes(user?.id || "");
                        return (
                          <button key={key} onClick={() => toggleReaction(note.id, key)}
                            className={`text-xs px-2 py-1 rounded-full border transition ${reacted ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-100 hover:bg-gray-100"}`}>
                            {emoji} {count > 0 && <span className="ml-0.5">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {notes.length === 0 && <div className="text-center py-8 text-gray-400">Be the first to post a note!</div>}
            </div>
          </>
        )}

        {!isOpen && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <p className="text-center text-gray-500">Class ended. Time to review and summarize!</p>
            <div className="flex gap-3 justify-center">
              <button onClick={generateSummary} disabled={genLoading} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {genLoading ? "Generating..." : "Generate Summary (+5P)"}
              </button>
              <Link href={`/courses/${courseId}/qa?sessionId=${sessionId}`} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700">Ask Question (+2P)</Link>
            </div>
          </div>
        )}

        {summary && (
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-lg font-bold">Session Summary</h2>
            <div><h3 className="font-semibold text-sm text-gray-600 mb-2">Key Points</h3><p className="text-sm text-gray-700 whitespace-pre-wrap">{summary.keyPoints}</p></div>
            <div><h3 className="font-semibold text-sm text-gray-600 mb-2">Key Terms</h3><div className="flex gap-2 flex-wrap">{summary.terms.map((t, i) => <span key={i} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs">{t}</span>)}</div></div>
            <div><h3 className="font-semibold text-sm text-gray-600 mb-2">Expected Questions</h3>{summary.expectedQuestions.map((q, i) => <p key={i} className="text-sm text-gray-600">Q{i + 1}. {q}</p>)}</div>
          </div>
        )}

        {!isOpen && notes.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold text-gray-600">Session Notes ({notes.length})</h3>
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg shadow-sm p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center text-xs">{note.author.avatar || (note.author.nickname || "?")[0]}</div>
                  <span className="text-xs font-medium text-blue-600">{note.author.nickname}</span>
                  <span className="text-xs text-gray-300">{new Date(note.createdAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="text-sm text-gray-600">{note.content}</p>
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
