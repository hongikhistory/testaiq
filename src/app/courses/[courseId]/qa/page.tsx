"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import Link from "next/link";

interface Answer { id: string; body: string; isAccepted: boolean; createdAt: string; author: { id: string; nickname: string } }
interface QuestionDetail { id: string; title: string; body: string; tags: string; status: string; authorId: string; acceptedAnswerId: string | null; createdAt: string; author: { nickname: string }; session: { weekLabel: string | null; startsAt: string } }

function QAContent({ courseId }: { courseId: string }) {
  const { user } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionId = searchParams.get("questionId");
  const sessionId = searchParams.get("sessionId");

  const [mode, setMode] = useState<"list" | "detail" | "create">(questionId ? "detail" : "list");
  const [questions, setQuestions] = useState<QuestionDetail[]>([]);
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [answerBody, setAnswerBody] = useState("");
  const [sessions, setSessions] = useState<{ id: string; startsAt: string; weekLabel: string | null }[]>([]);
  const [selectedSession, setSelectedSession] = useState(sessionId || "");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/question?courseId=${courseId}`).then((r) => r.json()).then((d) => setQuestions(d.questions || []));
    fetch(`/api/course/${courseId}`).then((r) => r.json()).then((d) => {
      if (d.course?.sessions) {
        setSessions(d.course.sessions);
        if (!selectedSession && d.course.sessions.length > 0) setSelectedSession(d.course.sessions[0].id);
      }
    });
  }, [courseId]);

  useEffect(() => {
    if (questionId && mode === "detail") {
      fetch(`/api/question?courseId=${courseId}`).then((r) => r.json()).then((d) => {
        const q = (d.questions || []).find((q: QuestionDetail) => q.id === questionId);
        if (q) setQuestion(q);
      });
      fetch(`/api/question?courseId=${courseId}`).then(() => {
        // load answers via question API (simple approach)
      });
    }
  }, [questionId, courseId, mode]);

  async function createQuestion(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, sessionId: selectedSession, title, body }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setMode("list");
    setTitle("");
    setBody("");
    fetch(`/api/question?courseId=${courseId}`).then((r) => r.json()).then((d) => setQuestions(d.questions || []));
  }

  async function postAnswer() {
    if (!answerBody.trim() || !questionId) return;
    setError("");
    const res = await fetch("/api/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, body: answerBody }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setAnswerBody("");
    setAnswers([...answers, { ...data.answer, author: { id: user?.id || "", nickname: user?.nickname || "" } }]);
  }

  async function acceptAnswer(answerId: string) {
    await fetch("/api/answer/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answerId }),
    });
    setAnswers(answers.map((a) => ({ ...a, isAccepted: a.id === answerId })));
    if (question) setQuestion({ ...question, status: "solved", acceptedAnswerId: answerId });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <Link href={`/courses/${courseId}`} className="text-sm text-blue-600 hover:underline">&larr; 수업 홈</Link>
          {mode !== "create" && (
            <button onClick={() => setMode("create")} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium">질문 작성</button>
          )}
        </div>

        {mode === "create" && (
          <form onSubmit={createQuestion} className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-lg font-bold">질문 작성</h2>
            <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)} className="w-full border rounded-lg px-4 py-3">
              {sessions.map((s) => <option key={s.id} value={s.id}>{s.weekLabel || new Date(s.startsAt).toLocaleDateString("ko-KR")}</option>)}
            </select>
            <input type="text" placeholder="질문 제목" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border rounded-lg px-4 py-3" />
            <textarea placeholder="질문 내용" value={body} onChange={(e) => setBody(e.target.value)} required className="w-full border rounded-lg px-4 py-3 h-32 resize-none" />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg">작성</button>
              <button type="button" onClick={() => setMode("list")} className="bg-gray-100 px-6 py-2 rounded-lg">취소</button>
            </div>
          </form>
        )}

        {mode === "list" && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Q&A</h2>
            {questions.map((q) => (
              <div key={q.id} onClick={() => { setQuestion(q); setMode("detail"); router.push(`/courses/${courseId}/qa?questionId=${q.id}`); }} className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-md transition">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${q.status === "solved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {q.status === "solved" ? "해결" : "미해결"}
                  </span>
                </div>
                <h3 className="font-semibold">{q.title}</h3>
                <div className="text-xs text-gray-400 mt-2">{q.author.nickname} &middot; {new Date(q.createdAt).toLocaleDateString("ko-KR")}</div>
              </div>
            ))}
            {questions.length === 0 && <div className="text-center py-8 text-gray-400">아직 질문이 없습니다</div>}
          </div>
        )}

        {mode === "detail" && question && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${question.status === "solved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {question.status === "solved" ? "해결" : "미해결"}
                </span>
                <span className="text-xs text-gray-400">{question.session?.weekLabel || new Date(question.session?.startsAt).toLocaleDateString("ko-KR")}</span>
              </div>
              <h2 className="text-xl font-bold mb-2">{question.title}</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{question.body}</p>
              <div className="text-xs text-gray-400 mt-3">{question.author.nickname} &middot; {new Date(question.createdAt).toLocaleDateString("ko-KR")}</div>
            </div>

            <h3 className="font-bold">답변 ({answers.length})</h3>
            {answers.map((a) => (
              <div key={a.id} className={`bg-white rounded-xl shadow p-5 ${a.isAccepted ? "ring-2 ring-green-400" : ""}`}>
                {a.isAccepted && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full mb-2 inline-block">채택됨</span>}
                <p className="text-gray-700 whitespace-pre-wrap">{a.body}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">{a.author.nickname}</span>
                  {question.authorId === user?.id && !question.acceptedAnswerId && (
                    <button onClick={() => acceptAnswer(a.id)} className="text-xs bg-green-600 text-white px-3 py-1 rounded-lg">채택</button>
                  )}
                </div>
              </div>
            ))}

            <div className="bg-white rounded-xl shadow p-4 space-y-3">
              <textarea placeholder="답변 작성..." value={answerBody} onChange={(e) => setAnswerBody(e.target.value)} className="w-full border rounded-lg px-4 py-3 h-24 resize-none" />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button onClick={postAnswer} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm">답변 작성</button>
            </div>

            <button onClick={() => { setMode("list"); router.push(`/courses/${courseId}/qa`); }} className="text-sm text-blue-600 hover:underline">&larr; 목록으로</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function QAPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  return <AuthGuard><Suspense><QAContent courseId={courseId} /></Suspense></AuthGuard>;
}
