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

const courseIcons: Record<string, { icon: string; gradient: string }> = {
  CS: { icon: "💻", gradient: "from-blue-500 to-indigo-600" },
  UX: { icon: "🎨", gradient: "from-pink-500 to-rose-500" },
  "경제": { icon: "📊", gradient: "from-emerald-500 to-teal-500" },
  default: { icon: "📚", gradient: "from-purple-500 to-violet-600" },
};
function getCourseInfo(tags: string) {
  try { for (const t of JSON.parse(tags) as string[]) { if (courseIcons[t]) return courseIcons[t]; } } catch {}
  return courseIcons.default;
}

const _now = Date.now();
const DEMO_COURSES: Course[] = [
  { id: "course-cs101", title: "컴퓨터과학 개론 (CS101)", description: "알고리즘과 자료구조의 기초를 함께 배웁니다", inviteCode: "CS101JOIN", tags: JSON.stringify(["CS", "알고리즘", "자료구조"]),
    sessions: [{ id: "cs-live", startsAt: new Date(_now - 30 * 60000).toISOString(), endsAt: new Date(_now + 60 * 60000).toISOString() }],
    _count: { members: 8, questions: 4, sessions: 6 }, isEnrolled: true, creatorName: "민지", noteCount: 27 },
  { id: "course-design", title: "UX/UI 디자인 워크숍", description: "사용자 경험 디자인의 핵심 원리", inviteCode: "UXJOIN26", tags: JSON.stringify(["UX", "UI", "디자인", "피그마"]),
    sessions: [{ id: "dx-future", startsAt: new Date(_now + 6 * 86400000).toISOString(), endsAt: new Date(_now + 6 * 86400000 + 90 * 60000).toISOString() }],
    _count: { members: 6, questions: 1, sessions: 3 }, isEnrolled: true, creatorName: "Emma", noteCount: 9 },
  { id: "course-econ", title: "글로벌 경제학 입문", description: "한국과 미국의 경제 비교 분석", inviteCode: "ECON2026", tags: JSON.stringify(["경제", "Economics", "거시경제"]),
    sessions: [{ id: "ec-future", startsAt: new Date(_now + 2 * 86400000).toISOString(), endsAt: new Date(_now + 2 * 86400000 + 90 * 60000).toISOString() }],
    _count: { members: 5, questions: 1, sessions: 2 }, isEnrolled: true, creatorName: "Alex", noteCount: 5 },
];
const DEMO_SCORES = {
  hongik: { school: { name: "홍익대학교", countryCode: "KR" }, score: 226, memberCount: 6 },
  ucb: { school: { name: "UC Berkeley", countryCode: "US" }, score: 234, memberCount: 6 },
};

function CoursesContent() {
  const { user } = useUser();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>(DEMO_COURSES);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [scores] = useState(DEMO_SCORES);
  const [joining, setJoining] = useState<string | null>(null);
  const [pageNow] = useState(() => Date.now());

  useEffect(() => {
    Promise.all([fetch("/api/course").then((r) => r.json()).catch(() => null)]).then(([courseData]) => {
      if (courseData?.courses?.length > 0) setCourses(courseData.courses);
    });
    fetch("/api/seed", { method: "POST" }).catch(() => {});
    fetch("/api/group/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ inviteCode: "CAMPUS2026" }) }).catch(() => {});
  }, []);

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/course", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, description, schedule: [{ dayOfWeek: new Date().getDay(), startTime: "10:00", endTime: "11:30" }] }) });
    if (res.ok) { setShowCreate(false); setTitle(""); setDescription(""); }
  }
  async function joinCourse(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/course/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ inviteCode: joinCode }) }).catch(() => {});
    setShowJoin(false); setJoinCode("");
  }
  function quickJoin(inviteCode: string) {
    setJoining(inviteCode);
    fetch("/api/course/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ inviteCode }) }).catch(() => {});
    setCourses((prev) => prev.map((c) => c.inviteCode === inviteCode ? { ...c, isEnrolled: true } : c));
    setTimeout(() => setJoining(null), 500);
  }

  const enrolled = courses.filter((c) => c.isEnrolled);
  const available = courses.filter((c) => !c.isEnrolled);

  return (
    <div className="min-h-screen bg-mesh has-bottom-nav">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* School Battle - 3D gradient card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-5 text-white shadow-3d-lg animate-slide-up">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />
          <h2 className="text-sm font-bold opacity-90 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs">⚔️</span>
            School Battle
          </h2>
          <div className="grid grid-cols-2 gap-3 relative">
            {Object.values(scores).map((s, i) => (
              <div key={i} className="glass-dark rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{s.school.countryCode === "KR" ? "🇰🇷" : "🇺🇸"}</div>
                <div className="font-bold text-sm truncate">{s.school.name}</div>
                <div className="text-3xl font-black my-1.5">{s.score}<span className="text-sm font-normal opacity-70">P</span></div>
                <div className="text-[11px] opacity-60">{s.memberCount}명 참여</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 stagger-children">
          {[
            { val: courses.length, label: "수업", gradient: "from-indigo-500 to-blue-500", icon: "📖" },
            { val: courses.reduce((sum, c) => sum + c.noteCount, 0), label: "노트", gradient: "from-emerald-500 to-teal-500", icon: "📝" },
            { val: courses.reduce((sum, c) => sum + c._count.questions, 0), label: "Q&A", gradient: "from-pink-500 to-rose-500", icon: "💬" },
          ].map((s) => (
            <div key={s.label} className="card-3d p-4 text-center">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-lg mx-auto mb-2 shadow-md`}>{s.icon}</div>
              <div className="text-2xl font-black text-slate-800">{s.val}</div>
              <div className="text-[11px] text-slate-400 mt-0.5 font-semibold">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }}
            className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-4 py-3.5 rounded-2xl text-sm font-bold btn-3d animate-gradient shadow-lg shadow-indigo-200/30">
            + 수업 만들기
          </button>
          <button onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }}
            className="flex-1 card-3d px-4 py-3.5 text-sm font-bold text-indigo-600 text-center">
            코드로 참여하기
          </button>
        </div>

        {showCreate && (
          <form onSubmit={createCourse} className="card-3d p-5 space-y-3 animate-slide-up">
            <h3 className="font-bold text-sm">새 수업 만들기</h3>
            <input type="text" placeholder="수업 이름" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full glass rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none border-0" />
            <input type="text" placeholder="설명 (선택)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full glass rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none border-0" />
            <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-2xl text-sm font-bold btn-3d">만들기</button>
          </form>
        )}
        {showJoin && (
          <form onSubmit={joinCourse} className="card-3d p-5 space-y-3 animate-slide-up">
            <h3 className="font-bold text-sm">수업 참여하기</h3>
            <input type="text" placeholder="초대 코드" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} required className="w-full glass rounded-2xl px-4 py-3 text-center tracking-[0.3em] font-mono text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none border-0" />
            <button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-2xl text-sm font-bold btn-3d">참여하기</button>
          </form>
        )}

        {/* Enrolled Courses */}
        <div className="space-y-3 stagger-children">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-sm">📖</span>
            내 수업
          </h2>
          {enrolled.map((course) => {
            const ns = course.sessions?.[0];
            const isLive = ns && new Date(ns.startsAt).getTime() - 600000 <= pageNow && new Date(ns.endsAt).getTime() + 600000 >= pageNow;
            const info = getCourseInfo(course.tags);
            const tags: string[] = (() => { try { return JSON.parse(course.tags); } catch { return []; } })();
            return (
              <div key={course.id} onClick={() => router.push(`/courses/${course.id}`)}
                className={`card-3d p-5 cursor-pointer ${isLive ? "animate-pulse-glow" : ""}`}>
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${info.gradient} flex items-center justify-center text-xl shadow-lg flex-shrink-0`}>
                    {info.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base truncate text-slate-800">{course.title}</h3>
                      {isLive && (
                        <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-sm shadow-red-200">
                          <span className="live-dot" style={{ width: 5, height: 5 }} />LIVE
                        </span>
                      )}
                    </div>
                    {course.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{course.description}</p>}
                    {tags.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {tags.slice(0, 3).map((t) => <span key={t} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-semibold">{t}</span>)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100/50 flex items-center gap-4 text-[11px] text-slate-400 font-medium">
                  <span>👥 {course._count.members}</span><span>📝 {course.noteCount}</span><span>💬 {course._count.questions}</span><span>📅 {course._count.sessions}</span>
                  <span className="ml-auto text-[10px] font-mono text-slate-300 bg-slate-50 px-2 py-0.5 rounded-lg">{course.inviteCode}</span>
                </div>
                {ns && (
                  <div className="mt-2 text-xs text-slate-400">
                    {isLive ? <span className="text-red-500 font-semibold">🔴 지금 수업 중!</span> : `다음: ${new Date(ns.startsAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric", weekday: "short" })}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {available.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-800">참여 가능한 수업</h2>
            {available.map((course) => (
              <div key={course.id} className="card-3d p-4 flex items-center gap-3" style={{ borderStyle: "dashed" }}>
                <div className="flex-1 min-w-0"><h3 className="font-bold text-sm truncate">{course.title}</h3></div>
                <button onClick={() => quickJoin(course.inviteCode)} disabled={joining === course.inviteCode}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl btn-3d">
                  {joining === course.inviteCode ? "..." : "참여"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() { return <AuthGuard><CoursesContent /></AuthGuard>; }
