"use client";

import { useState, useEffect, use, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";
import Link from "next/link";

interface Answer { id: string; body: string; isAccepted: boolean; createdAt: string; author: { id: string; nickname: string } }
interface QuestionDetail { id: string; title: string; body: string; tags: string; status: string; authorId: string; acceptedAnswerId: string | null; createdAt: string; author: { nickname: string }; session: { weekLabel: string | null; startsAt: string }; answers?: Answer[] }

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
        setSelectedSession((prev) => prev || (d.course.sessions.length > 0 ? d.course.sessions[0].id : ""));
      }
    });
  }, [courseId]);

  useEffect(() => {
    if (questionId && mode === "detail") {
      fetch(`/api/question?courseId=${courseId}`).then((r) => r.json()).then((d) => {
        const q = (d.questions || []).find((q: QuestionDetail) => q.id === questionId);
        if (q) {
          setQuestion(q);
          setAnswers(q.answers || []);
        }
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
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-white has-bottom-nav">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href={`/courses/${courseId}`} className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-500 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            수업 홈
          </Link>
          {mode !== "create" && (
            <button onClick={() => setMode("create")}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2.5 rounded-2xl text-xs font-bold active:scale-[0.98] transition-all shadow-sm shadow-emerald-200">
              + 질문 작성
            </button>
          )}
        </div>

        {/* Create form */}
        {mode === "create" && (
          <form onSubmit={createQuestion} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h2 className="text-base font-bold flex items-center gap-2">💬 질문 작성</h2>
            <div>
              <label className="text-xs font-medium text-gray-500 ml-1">수업 회차</label>
              <select value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1 text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent focus:outline-none transition bg-white">
                {sessions.map((s) => <option key={s.id} value={s.id}>{s.weekLabel || new Date(s.startsAt).toLocaleDateString("ko-KR")}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 ml-1">제목</label>
              <input type="text" placeholder="질문 제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} required
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1 text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent focus:outline-none transition" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 ml-1">내용</label>
              <textarea placeholder="궁금한 점을 자세히 적어주세요" value={body} onChange={(e) => setBody(e.target.value)} required
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1 h-32 resize-none text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent focus:outline-none transition" />
            </div>
            {error && <p className="text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 text-white py-3 rounded-2xl text-sm font-bold active:scale-[0.98] transition-all">
                작성 완료 (+2P)
              </button>
              <button type="button" onClick={() => setMode("list")} className="bg-gray-100 text-gray-600 px-5 py-3 rounded-2xl text-sm font-bold active:scale-[0.98] transition-all">
                취소
              </button>
            </div>
          </form>
        )}

        {/* Question list */}
        {mode === "list" && (
          <div className="space-y-2.5">
            <h2 className="text-lg font-bold">Q&A</h2>
            {questions.map((q) => (
              <div key={q.id} onClick={() => { setQuestion(q); setMode("detail"); router.push(`/courses/${courseId}/qa?questionId=${q.id}`); }}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 cursor-pointer card-hover">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${q.status === "solved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {q.status === "solved" ? "해결" : "미해결"}
                  </span>
                  <span className="text-[10px] text-gray-300">{q.session?.weekLabel || new Date(q.session?.startsAt).toLocaleDateString("ko-KR")}</span>
                </div>
                <h3 className="font-bold text-sm">{q.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{q.author.nickname}</span>
                  <span>{new Date(q.createdAt).toLocaleDateString("ko-KR")}</span>
                </div>
              </div>
            ))}
            {questions.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="text-3xl mb-2">💬</div>
                <p className="text-gray-400 text-sm">아직 질문이 없어요. 첫 질문을 올려보세요!</p>
              </div>
            )}
          </div>
        )}

        {/* Question detail */}
        {mode === "detail" && question && (
          <div className="space-y-3">
            {/* Question card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${question.status === "solved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {question.status === "solved" ? "해결" : "미해결"}
                </span>
                <span className="text-[10px] text-gray-400">{question.session?.weekLabel || new Date(question.session?.startsAt).toLocaleDateString("ko-KR")}</span>
              </div>
              <h2 className="text-base font-bold mb-2">{question.title}</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{question.body}</p>
              <div className="text-xs text-gray-400 mt-3 flex items-center gap-2">
                <span className="bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-medium">{question.author.nickname}</span>
                <span>{new Date(question.createdAt).toLocaleDateString("ko-KR")}</span>
              </div>
            </div>

            {/* Answers */}
            <h3 className="text-sm font-bold text-gray-600 flex items-center gap-1.5">💡 답변 ({answers.length})</h3>
            {answers.map((a) => (
              <div key={a.id} className={`bg-white rounded-3xl shadow-sm border p-4 ${a.isAccepted ? "border-emerald-300 bg-emerald-50/30" : "border-gray-100"}`}>
                {a.isAccepted && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold mb-2 inline-block">✅ 채택됨</span>
                )}
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{a.body}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400">{a.author.nickname}</span>
                  {question.authorId === user?.id && !question.acceptedAnswerId && (
                    <button onClick={() => acceptAnswer(a.id)}
                      className="text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3.5 py-1.5 rounded-full font-bold active:scale-95 transition-all">
                      채택하기 (+10P)
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Answer form */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 space-y-3">
              <textarea
                placeholder="답변을 작성해주세요... (+3P)"
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 h-24 resize-none text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent focus:outline-none transition"
              />
              {error && <p className="text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2">{error}</p>}
              <button onClick={postAnswer}
                className="w-full sm:w-auto bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-2xl text-xs font-bold active:scale-[0.98] transition-all">
                답변 작성
              </button>
            </div>

            {/* Back to list */}
            <button onClick={() => { setMode("list"); router.push(`/courses/${courseId}/qa`); }}
              className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-violet-500 transition">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              목록으로 돌아가기
            </button>
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
