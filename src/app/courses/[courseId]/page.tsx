"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";

interface Session { id: string; startsAt: string; endsAt: string; weekLabel: string | null }
interface CourseDetail { id: string; title: string; description: string; inviteCode: string; sessions: Session[]; _count: { members: number; questions: number } }

// === DEMO DATA for MVP ===
const _now = Date.now();
const DAY = 86400000;
const HOUR = 3600000;
const DEMO_COURSES: Record<string, CourseDetail> = {
  "course-cs101": {
    id: "course-cs101", title: "컴퓨터과학 개론 (CS101)", description: "알고리즘과 자료구조의 기초를 함께 배웁니다", inviteCode: "CS101JOIN",
    sessions: [
      { id: "cs-s1", startsAt: new Date(_now - 10 * DAY - 2 * HOUR).toISOString(), endsAt: new Date(_now - 10 * DAY - 30 * 60000).toISOString(), weekLabel: "Week 1" },
      { id: "cs-s2", startsAt: new Date(_now - 7 * DAY - 2 * HOUR).toISOString(), endsAt: new Date(_now - 7 * DAY - 30 * 60000).toISOString(), weekLabel: "Week 2" },
      { id: "cs-s3", startsAt: new Date(_now - 3 * DAY - 2 * HOUR).toISOString(), endsAt: new Date(_now - 3 * DAY - 30 * 60000).toISOString(), weekLabel: "Week 3" },
      { id: "cs-s4", startsAt: new Date(_now - 2 * HOUR).toISOString(), endsAt: new Date(_now - 30 * 60000).toISOString(), weekLabel: "Week 4" },
      { id: "cs-live", startsAt: new Date(_now - 30 * 60000).toISOString(), endsAt: new Date(_now + HOUR).toISOString(), weekLabel: "Week 5 (LIVE)" },
      { id: "cs-future", startsAt: new Date(_now + 4 * DAY + 2 * HOUR).toISOString(), endsAt: new Date(_now + 4 * DAY + 3.5 * HOUR).toISOString(), weekLabel: "Week 6" },
    ], _count: { members: 8, questions: 4 },
  },
  "course-design": {
    id: "course-design", title: "UX/UI 디자인 워크숍", description: "사용자 경험 디자인의 핵심 원리", inviteCode: "UXJOIN26",
    sessions: [
      { id: "dx-s1", startsAt: new Date(_now - 8 * DAY - 3 * HOUR).toISOString(), endsAt: new Date(_now - 8 * DAY - 1.5 * HOUR).toISOString(), weekLabel: "Week 1" },
      { id: "dx-s2", startsAt: new Date(_now - DAY - 3 * HOUR).toISOString(), endsAt: new Date(_now - DAY - 1.5 * HOUR).toISOString(), weekLabel: "Week 2" },
      { id: "dx-future", startsAt: new Date(_now + 6 * DAY + 3 * HOUR).toISOString(), endsAt: new Date(_now + 6 * DAY + 4.5 * HOUR).toISOString(), weekLabel: "Week 3" },
    ], _count: { members: 6, questions: 1 },
  },
  "course-econ": {
    id: "course-econ", title: "글로벌 경제학 입문", description: "한국과 미국의 경제 비교 분석", inviteCode: "ECON2026",
    sessions: [
      { id: "ec-s1", startsAt: new Date(_now - 5 * DAY - 4 * HOUR).toISOString(), endsAt: new Date(_now - 5 * DAY - 2.5 * HOUR).toISOString(), weekLabel: "Week 1" },
      { id: "ec-future", startsAt: new Date(_now + 2 * DAY + 4 * HOUR).toISOString(), endsAt: new Date(_now + 2 * DAY + 5.5 * HOUR).toISOString(), weekLabel: "Week 2" },
    ], _count: { members: 5, questions: 1 },
  },
};

const DEMO_QUESTIONS: Record<string, { id: string; title: string; status: string; tags: string; createdAt: string; author: { nickname: string }; _count: { answers: number }; session: { weekLabel: string | null; startsAt: string } }[]> = {
  "course-cs101": [
    { id: "q1", title: "Big-O에서 상수를 무시하는 이유가 뭔가요?", status: "solved", tags: "[]", createdAt: new Date(_now - 9 * DAY).toISOString(), author: { nickname: "Alex" }, _count: { answers: 3 }, session: { weekLabel: "Week 1", startsAt: new Date(_now - 10 * DAY).toISOString() } },
    { id: "q2", title: "Merge Sort와 Quick Sort 중 어떤 걸 써야 하나요?", status: "solved", tags: "[]", createdAt: new Date(_now - 6 * DAY).toISOString(), author: { nickname: "지우" }, _count: { answers: 2 }, session: { weekLabel: "Week 2", startsAt: new Date(_now - 7 * DAY).toISOString() } },
    { id: "q3", title: "Stack으로 괄호 매칭하는 코드 예시 있나요?", status: "open", tags: "[]", createdAt: new Date(_now - 2 * DAY).toISOString(), author: { nickname: "Sophia" }, _count: { answers: 2 }, session: { weekLabel: "Week 3", startsAt: new Date(_now - 3 * DAY).toISOString() } },
    { id: "q4", title: "BST에서 노드 삭제할 때 3가지 경우가 헷갈려요", status: "open", tags: "[]", createdAt: new Date(_now - 5 * HOUR).toISOString(), author: { nickname: "현우" }, _count: { answers: 1 }, session: { weekLabel: "Week 4", startsAt: new Date(_now - 2 * HOUR).toISOString() } },
  ],
  "course-design": [
    { id: "q5", title: "UX 포트폴리오에 꼭 들어가야 할 요소가 뭔가요?", status: "open", tags: "[]", createdAt: new Date(_now - 7 * DAY).toISOString(), author: { nickname: "지우" }, _count: { answers: 2 }, session: { weekLabel: "Week 1", startsAt: new Date(_now - 8 * DAY).toISOString() } },
  ],
  "course-econ": [
    { id: "q6", title: "한미 금리 차이가 환율에 미치는 영향?", status: "solved", tags: "[]", createdAt: new Date(_now - 4 * DAY).toISOString(), author: { nickname: "도현" }, _count: { answers: 2 }, session: { weekLabel: "Week 1", startsAt: new Date(_now - 5 * DAY).toISOString() } },
  ],
};

function CourseContent({ courseId }: { courseId: string }) {
  const { user } = useUser();
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetail | null>(DEMO_COURSES[courseId] || null);
  const [tab, setTab] = useState<"sessions" | "qa">("sessions");
  const [now] = useState(() => Date.now());

  useEffect(() => {
    fetch(`/api/course/${courseId}`).then((r) => r.json()).then((d) => {
      if (d.course) setCourse(d.course);
    }).catch(() => {});
  }, [courseId]);

  if (!course) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50/50 to-white">
      <div className="animate-spin h-6 w-6 border-3 border-violet-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-white has-bottom-nav">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Course Header */}
        <div className="bg-white rounded-3xl shadow-sm border border-violet-100/50 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h1 className="text-lg sm:text-xl font-bold">{course.title}</h1>
            <span className="text-[10px] bg-violet-50 text-violet-500 px-2.5 py-1 rounded-full font-mono self-start">{course.inviteCode}</span>
          </div>
          {course.description && <p className="text-sm text-gray-400 mt-2">{course.description}</p>}
          <div className="mt-3 flex gap-4 text-xs text-gray-400">
            <span>👥 {course._count.members}명</span><span>💬 {course._count.questions}개 질문</span>
          </div>
        </div>

        {/* Tab + Action */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 flex-1">
            <button onClick={() => setTab("sessions")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === "sessions" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>📅 수업 일정</button>
            <button onClick={() => setTab("qa")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === "qa" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>💬 Q&A</button>
          </div>
          <button onClick={() => router.push(`/courses/${courseId}/qa`)} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2.5 rounded-2xl text-xs font-bold active:scale-[0.98] transition-all whitespace-nowrap shadow-sm shadow-emerald-200">+ 질문</button>
        </div>

        {/* Sessions */}
        {tab === "sessions" && (
          <div className="space-y-2.5">
            {course.sessions.map((session) => {
              const start = new Date(session.startsAt).getTime();
              const end = new Date(session.endsAt).getTime();
              const isLive = start - 600000 <= now && end + 600000 >= now;
              const isPast = end + 600000 < now;
              return (
                <div key={session.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${isLive ? "bg-red-50" : isPast ? "bg-gray-50" : "bg-violet-50"}`}>
                        {isLive ? "🔴" : isPast ? "✅" : "📅"}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{session.weekLabel || new Date(session.startsAt).toLocaleDateString("ko-KR")}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(session.startsAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} ~ {new Date(session.endsAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                    <div>
                      {isLive && (
                        <button onClick={() => router.push(`/courses/${courseId}/live?sessionId=${session.id}`)}
                          className="flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2.5 rounded-2xl text-xs font-bold active:scale-[0.98] transition-all shadow-sm shadow-red-200">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />실시간 참여
                        </button>
                      )}
                      {isPast && (
                        <button onClick={() => router.push(`/courses/${courseId}/live?sessionId=${session.id}&summary=1`)}
                          className="bg-gray-100 text-gray-600 px-4 py-2.5 rounded-2xl text-xs font-bold hover:bg-gray-200 active:scale-[0.98] transition-all">노트 보기</button>
                      )}
                      {!isLive && !isPast && <span className="text-xs text-gray-300 bg-gray-50 px-3 py-2 rounded-2xl font-medium">예정</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            {course.sessions.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="text-3xl mb-2">📅</div><p className="text-gray-400 text-sm">아직 수업 일정이 없어요</p>
              </div>
            )}
          </div>
        )}

        {tab === "qa" && <QAList courseId={courseId} />}
      </div>
    </div>
  );
}

function QAList({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState(DEMO_QUESTIONS[courseId] || []);

  useEffect(() => {
    fetch(`/api/question?courseId=${courseId}`).then((r) => r.json()).then((d) => {
      if (d.questions?.length > 0) setQuestions(d.questions);
    }).catch(() => {});
  }, [courseId]);

  return (
    <div className="space-y-2.5">
      {questions.map((q) => (
        <div key={q.id} onClick={() => router.push(`/courses/${courseId}/qa?questionId=${q.id}`)}
          className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 cursor-pointer card-hover">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${q.status === "solved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
              {q.status === "solved" ? "해결" : "미해결"}
            </span>
            <span className="text-[10px] text-gray-300">{q.session?.weekLabel || new Date(q.session?.startsAt).toLocaleDateString("ko-KR")}</span>
          </div>
          <h3 className="font-bold text-sm">{q.title}</h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>{q.author.nickname}</span><span>💬 {q._count.answers}개 답변</span>
          </div>
        </div>
      ))}
      {questions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
          <div className="text-3xl mb-2">💬</div><p className="text-gray-400 text-sm">아직 질문이 없어요. 첫 질문을 올려보세요!</p>
        </div>
      )}
    </div>
  );
}

export default function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  return <AuthGuard><CourseContent courseId={courseId} /></AuthGuard>;
}
