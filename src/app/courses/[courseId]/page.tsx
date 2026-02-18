"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";

interface Session { id: string; startsAt: string; endsAt: string; weekLabel: string | null }
interface CourseDetail {
  id: string; title: string; description: string; inviteCode: string;
  sessions: Session[]; _count: { members: number; questions: number };
}

function CourseContent({ courseId }: { courseId: string }) {
  const { user } = useUser();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [tab, setTab] = useState<"sessions" | "qa">("sessions");

  useEffect(() => {
    fetch(`/api/course/${courseId}`).then((r) => r.json()).then((d) => setCourse(d.course));
  }, [courseId]);

  if (!course) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" /></div>;

  const now = Date.now();

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full font-mono">{course.inviteCode}</span>
          </div>
          {course.description && <p className="text-gray-500">{course.description}</p>}
          <div className="mt-3 flex gap-4 text-sm text-gray-400">
            <span>{course._count.members}명 참여</span>
            <span>{course._count.questions}개 질문</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setTab("sessions")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "sessions" ? "bg-blue-600 text-white" : "bg-white border"}`}>세션/요약</button>
          <button onClick={() => setTab("qa")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "qa" ? "bg-blue-600 text-white" : "bg-white border"}`}>Q&A</button>
          <button onClick={() => router.push(`/courses/${courseId}/qa`)} className="ml-auto bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">질문하기</button>
        </div>

        {tab === "sessions" && (
          <div className="space-y-3">
            {course.sessions.map((session) => {
              const start = new Date(session.startsAt).getTime();
              const end = new Date(session.endsAt).getTime();
              const isLive = start - 600000 <= now && end + 600000 >= now;
              const isPast = end + 600000 < now;
              return (
                <div key={session.id} className="bg-white rounded-xl shadow p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">{session.weekLabel || new Date(session.startsAt).toLocaleDateString("ko-KR")}</span>
                      <div className="text-sm text-gray-400">
                        {new Date(session.startsAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} ~{" "}
                        {new Date(session.endsAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isLive && (
                        <button onClick={() => router.push(`/courses/${courseId}/live?sessionId=${session.id}`)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium animate-pulse">
                          LIVE 참여
                        </button>
                      )}
                      {isPast && (
                        <button onClick={() => router.push(`/courses/${courseId}/live?sessionId=${session.id}&summary=1`)} className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                          요약 보기
                        </button>
                      )}
                      {!isLive && !isPast && (
                        <span className="text-xs text-gray-400 px-3 py-2">예정</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {course.sessions.length === 0 && <div className="text-center py-8 text-gray-400">아직 세션이 없습니다</div>}
          </div>
        )}

        {tab === "qa" && <QAList courseId={courseId} />}
      </div>
    </div>
  );
}

function QAList({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<{ id: string; title: string; status: string; tags: string; createdAt: string; author: { nickname: string }; _count: { answers: number }; session: { weekLabel: string | null; startsAt: string } }[]>([]);

  useEffect(() => {
    fetch(`/api/question?courseId=${courseId}`).then((r) => r.json()).then((d) => setQuestions(d.questions || []));
  }, [courseId]);

  return (
    <div className="space-y-3">
      {questions.map((q) => (
        <div key={q.id} onClick={() => router.push(`/courses/${courseId}/qa?questionId=${q.id}`)} className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-md transition">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${q.status === "solved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {q.status === "solved" ? "해결" : "미해결"}
            </span>
            <span className="text-xs text-gray-400">{q.session?.weekLabel || new Date(q.session?.startsAt).toLocaleDateString("ko-KR")}</span>
          </div>
          <h3 className="font-semibold">{q.title}</h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{q.author.nickname}</span>
            <span>{q._count.answers}개 답변</span>
          </div>
        </div>
      ))}
      {questions.length === 0 && <div className="text-center py-8 text-gray-400">아직 질문이 없습니다</div>}
    </div>
  );
}

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  return <AuthGuard><CourseContent courseId={courseId} /></AuthGuard>;
}
