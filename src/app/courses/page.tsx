"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";

interface Session { id: string; startsAt: string; endsAt: string; _count?: { liveNotes: number } }
interface Course {
  id: string; title: string; description: string; inviteCode: string; tags: string;
  sessions: Session[]; _count: { members: number; questions: number; sessions: number };
  isEnrolled: boolean; creatorName: string; noteCount: number;
}

const courseEmojis: Record<string, string> = {
  CS: "💻", UX: "🎨", "경제": "📊", default: "📚",
};

function getCourseEmoji(tags: string): string {
  try {
    const parsed = JSON.parse(tags) as string[];
    for (const tag of parsed) {
      if (courseEmojis[tag]) return courseEmojis[tag];
    }
  } catch { /* empty */ }
  return courseEmojis.default;
}

function CoursesContent() {
  const { user } = useUser();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [groupData, setGroupData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    Promise.all([
      fetch("/api/course").then((r) => r.json()),
      fetch("/api/group").then((r) => r.json()).catch(() => null),
    ]).then(([courseData, gData]) => {
      setCourses(courseData.courses || []);
      if (gData && !gData.error) setGroupData(gData);
      setLoading(false);
    });
  }, []);

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/course", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, schedule: [{ dayOfWeek: new Date().getDay(), startTime: "10:00", endTime: "11:30" }] }),
    });
    if (res.ok) {
      setShowCreate(false); setTitle(""); setDescription("");
      const data = await fetch("/api/course").then((r) => r.json());
      setCourses(data.courses || []);
    }
  }

  async function joinCourse(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/course/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode: joinCode }),
    });
    if (res.ok) {
      setShowJoin(false); setJoinCode("");
      const data = await fetch("/api/course").then((r) => r.json());
      setCourses(data.courses || []);
    }
  }

  async function quickJoin(inviteCode: string) {
    setJoining(inviteCode);
    const res = await fetch("/api/course/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode }),
    });
    if (res.ok) {
      const data = await fetch("/api/course").then((r) => r.json());
      setCourses(data.courses || []);
    }
    setJoining(null);
  }

  const scores = groupData?.scores as Record<string, { school: { name: string; countryCode?: string }; score: number; memberCount: number }> | undefined;
  const enrolled = courses.filter((c) => c.isEnrolled);
  const available = courses.filter((c) => !c.isEnrolled);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-white has-bottom-nav">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* School Battle */}
        {scores && (
          <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-3xl p-5 text-white shadow-lg shadow-violet-200/50">
            <h2 className="text-sm font-bold opacity-90 mb-3 flex items-center gap-1.5">School Battle</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(scores).map((s, i) => (
                <div key={i} className="bg-white/15 backdrop-blur rounded-2xl p-3.5 text-center">
                  <div className="text-lg">{s.school.countryCode === "KR" ? "\uD83C\uDDF0\uD83C\uDDF7" : "\uD83C\uDDFA\uD83C\uDDF8"}</div>
                  <div className="font-bold text-sm mt-0.5 truncate">{s.school.name}</div>
                  <div className="text-2xl font-extrabold my-1">{s.score}<span className="text-sm font-normal opacity-70">P</span></div>
                  <div className="text-[11px] opacity-70">{s.memberCount}명 참여</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {!loading && courses.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { val: courses.length, label: "수업", color: "text-violet-600", bg: "bg-violet-50" },
              { val: courses.reduce((sum, c) => sum + c.noteCount, 0), label: "노트", color: "text-emerald-600", bg: "bg-emerald-50" },
              { val: courses.reduce((sum, c) => sum + c._count.questions, 0), label: "Q&A", color: "text-pink-600", bg: "bg-pink-50" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-3.5 text-center border border-white`}>
                <div className={`text-xl font-extrabold ${s.color}`}>{s.val}</div>
                <div className="text-[11px] text-gray-400 mt-0.5 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }}
            className="flex-1 bg-gradient-to-r from-violet-600 to-purple-500 text-white px-4 py-3 rounded-2xl text-sm font-bold active:scale-[0.98] transition-all shadow-sm shadow-violet-200">
            + 수업 만들기
          </button>
          <button onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }}
            className="flex-1 bg-white border border-violet-200 px-4 py-3 rounded-2xl text-sm font-bold text-violet-700 active:scale-[0.98] transition-all">
            코드로 참여하기
          </button>
        </div>

        {showCreate && (
          <form onSubmit={createCourse} className="bg-white rounded-3xl shadow-sm border border-violet-100 p-5 space-y-3">
            <h3 className="font-bold text-sm">새 수업 만들기</h3>
            <input type="text" placeholder="수업 이름" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none" />
            <input type="text" placeholder="설명 (선택)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none" />
            <button type="submit" className="w-full bg-violet-600 text-white py-3 rounded-2xl text-sm font-bold">만들기</button>
          </form>
        )}

        {showJoin && (
          <form onSubmit={joinCourse} className="bg-white rounded-3xl shadow-sm border border-violet-100 p-5 space-y-3">
            <h3 className="font-bold text-sm">수업 참여하기</h3>
            <input type="text" placeholder="초대 코드" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} required className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-center tracking-[0.3em] font-mono text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none" />
            <button type="submit" className="w-full bg-violet-600 text-white py-3 rounded-2xl text-sm font-bold">참여하기</button>
          </form>
        )}

        {/* My Enrolled Courses */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-800">내 수업</h2>
          {loading && <div className="text-center py-12"><div className="animate-spin h-6 w-6 border-3 border-violet-500 border-t-transparent rounded-full mx-auto" /></div>}
          {!loading && enrolled.length === 0 && (
            <div className="text-center py-8 bg-white rounded-3xl border border-dashed border-violet-200">
              <div className="text-3xl mb-2">📚</div>
              <p className="text-gray-400 text-sm">{available.length > 0 ? "아래 수업에 참여해보세요!" : "아직 수업이 없어요. 만들어보세요!"}</p>
            </div>
          )}
          {enrolled.map((course) => {
            const nextSession = course.sessions?.[0];
            const isLive = nextSession && new Date(nextSession.startsAt).getTime() - 600000 <= now && new Date(nextSession.endsAt).getTime() + 600000 >= now;
            const tags: string[] = (() => { try { return JSON.parse(course.tags); } catch { return []; } })();
            const emoji = getCourseEmoji(course.tags);
            return (
              <div key={course.id} onClick={() => router.push(`/courses/${course.id}`)}
                className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-5 cursor-pointer card-hover">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base truncate">{course.title}</h3>
                      {isLive && (
                        <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
                        </span>
                      )}
                    </div>
                    {course.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{course.description}</p>}
                    {tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {tags.slice(0, 3).map((t) => <span key={t} className="text-[10px] bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-medium">{t}</span>)}
                      </div>
                    )}
                  </div>
                </div>
                {/* Stats bar */}
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-4 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="text-violet-400">👥</span> {course._count.members}명
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-emerald-400">📝</span> {course.noteCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-pink-400">💬</span> {course._count.questions}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-amber-400">📅</span> {course._count.sessions}
                  </span>
                  <span className="ml-auto text-[10px] font-mono text-gray-300">{course.inviteCode}</span>
                </div>
                {nextSession && (
                  <div className="mt-2 text-xs text-gray-400">
                    다음 수업: {new Date(nextSession.startsAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric", weekday: "short" })} {new Date(nextSession.startsAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Available Courses */}
        {!loading && available.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-gray-800">참여 가능한 수업</h2>
            <p className="text-xs text-gray-400 -mt-2">&quot;참여&quot; 버튼을 눌러 바로 등록하세요</p>
            {available.map((course) => {
              const tags: string[] = (() => { try { return JSON.parse(course.tags); } catch { return []; } })();
              const emoji = getCourseEmoji(course.tags);
              return (
                <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-dashed border-violet-200 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 opacity-70">
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm sm:text-base truncate">{course.title}</h3>
                      {course.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{course.description}</p>}
                      {tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">{tags.slice(0, 3).map((t) => <span key={t} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">{t}</span>)}</div>
                      )}
                    </div>
                    <button
                      onClick={() => quickJoin(course.inviteCode)}
                      disabled={joining === course.inviteCode}
                      className="flex-shrink-0 bg-gradient-to-r from-violet-600 to-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl active:scale-95 transition-all disabled:opacity-50"
                    >
                      {joining === course.inviteCode ? "..." : "참여"}
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-4 text-[11px] text-gray-400">
                    <span>👥 {course._count.members}명</span>
                    <span>📝 {course.noteCount}</span>
                    <span>💬 {course._count.questions}</span>
                    <span className="ml-auto text-gray-300">by {course.creatorName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return <AuthGuard><CoursesContent /></AuthGuard>;
}
