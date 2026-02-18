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
  const [now] = useState(() => Date.now());

  useEffect(() => {
    fetch(`/api/course/${courseId}`).then((r) => r.json()).then((d) => setCourse(d.course));
  }, [courseId]);

  if (!course) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="min-h-screen bg-[#f8f9fb] has-bottom-nav">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Course Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-lg sm:text-xl font-bold">{course.title}</h1>
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-mono self-start">{course.inviteCode}</span>
          </div>
          {course.description && <p className="text-sm text-gray-500 mt-2">{course.description}</p>}
          <div className="mt-3 flex gap-4 text-xs text-gray-400">
            <span>{course._count.members} members</span>
            <span>{course._count.questions} questions</span>
          </div>
        </div>

        {/* Tab + Action */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-1">
            <button onClick={() => setTab("sessions")} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${tab === "sessions" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>Sessions</button>
            <button onClick={() => setTab("qa")} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${tab === "qa" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>Q&A</button>
          </div>
          <button onClick={() => router.push(`/courses/${courseId}/qa`)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all whitespace-nowrap">
            + Question
          </button>
        </div>

        {/* Sessions */}
        {tab === "sessions" && (
          <div className="space-y-2">
            {course.sessions.map((session) => {
              const start = new Date(session.startsAt).getTime();
              const end = new Date(session.endsAt).getTime();
              const isLive = start - 600000 <= now && end + 600000 >= now;
              const isPast = end + 600000 < now;
              return (
                <div key={session.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm">{session.weekLabel || new Date(session.startsAt).toLocaleDateString("ko-KR")}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {new Date(session.startsAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} ~ {new Date(session.endsAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    <div>
                      {isLive && (
                        <button onClick={() => router.push(`/courses/${courseId}/live?sessionId=${session.id}`)}
                          className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />Join LIVE
                        </button>
                      )}
                      {isPast && (
                        <button onClick={() => router.push(`/courses/${courseId}/live?sessionId=${session.id}&summary=1`)}
                          className="bg-gray-100 text-gray-600 px-4 py-2.5 rounded-xl text-xs font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all">
                          View Notes
                        </button>
                      )}
                      {!isLive && !isPast && (
                        <span className="text-xs text-gray-300 bg-gray-50 px-3 py-2 rounded-xl">Upcoming</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {course.sessions.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No sessions yet</div>}
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
    <div className="space-y-2">
      {questions.map((q) => (
        <div key={q.id} onClick={() => router.push(`/courses/${courseId}/qa?questionId=${q.id}`)}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${q.status === "solved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {q.status === "solved" ? "Solved" : "Open"}
            </span>
            <span className="text-[10px] text-gray-400">{q.session?.weekLabel || new Date(q.session?.startsAt).toLocaleDateString("ko-KR")}</span>
          </div>
          <h3 className="font-semibold text-sm">{q.title}</h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{q.author.nickname}</span>
            <span>{q._count.answers} answers</span>
          </div>
        </div>
      ))}
      {questions.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No questions yet. Be the first to ask!</div>}
    </div>
  );
}

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  return <AuthGuard><CourseContent courseId={courseId} /></AuthGuard>;
}
