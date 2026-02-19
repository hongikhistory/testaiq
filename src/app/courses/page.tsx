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

const courseEmojis: Record<string, string> = { CS: "\uD83D\uDCBB", UX: "\uD83C\uDFA8", "\uACBD\uC81C": "\uD83D\uDCCA", default: "\uD83D\uDCDA" };
function getCourseEmoji(tags: string): string { try { for (const t of JSON.parse(tags) as string[]) { if (courseEmojis[t]) return courseEmojis[t]; } } catch {} return courseEmojis.default; }

// === HARDCODED DEMO DATA for MVP ===
const _now = Date.now();
const DEMO_COURSES: Course[] = [
  { id: "course-cs101", title: "\uCEF4\uD4E8\uD130\uACFC\uD559 \uAC1C\uB860 (CS101)", description: "\uC54C\uACE0\uB9AC\uC998\uACFC \uC790\uB8CC\uAD6C\uC870\uC758 \uAE30\uCD08\uB97C \uD568\uAED8 \uBC30\uC6C0\uB2C8\uB2E4", inviteCode: "CS101JOIN", tags: JSON.stringify(["CS", "\uC54C\uACE0\uB9AC\uC998", "\uC790\uB8CC\uAD6C\uC870"]),
    sessions: [{ id: "cs-live", startsAt: new Date(_now - 30 * 60000).toISOString(), endsAt: new Date(_now + 60 * 60000).toISOString() }],
    _count: { members: 8, questions: 4, sessions: 6 }, isEnrolled: true, creatorName: "\uBBFC\uC9C0", noteCount: 27 },
  { id: "course-design", title: "UX/UI \uB514\uC790\uC778 \uC6CC\uD06C\uC20D", description: "\uC0AC\uC6A9\uC790 \uACBD\uD5D8 \uB514\uC790\uC778\uC758 \uD575\uC2EC \uC6D0\uB9AC", inviteCode: "UXJOIN26", tags: JSON.stringify(["UX", "UI", "\uB514\uC790\uC778", "\uD53C\uADF8\uB9C8"]),
    sessions: [{ id: "dx-future", startsAt: new Date(_now + 6 * 86400000).toISOString(), endsAt: new Date(_now + 6 * 86400000 + 90 * 60000).toISOString() }],
    _count: { members: 6, questions: 1, sessions: 3 }, isEnrolled: true, creatorName: "Emma", noteCount: 9 },
  { id: "course-econ", title: "\uAE00\uB85C\uBC8C \uACBD\uC81C\uD559 \uC785\uBB38", description: "\uD55C\uAD6D\uACFC \uBBF8\uAD6D\uC758 \uACBD\uC81C \uBE44\uAD50 \uBD84\uC11D", inviteCode: "ECON2026", tags: JSON.stringify(["\uACBD\uC81C", "Economics", "\uAC70\uC2DC\uACBD\uC81C"]),
    sessions: [{ id: "ec-future", startsAt: new Date(_now + 2 * 86400000).toISOString(), endsAt: new Date(_now + 2 * 86400000 + 90 * 60000).toISOString() }],
    _count: { members: 5, questions: 1, sessions: 2 }, isEnrolled: true, creatorName: "Alex", noteCount: 5 },
];
const DEMO_SCORES = {
  hongik: { school: { name: "\uD64D\uC775\uB300\uD559\uAD50", countryCode: "KR" }, score: 226, memberCount: 6 },
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
    // Try real API in background; replace demo data if successful
    Promise.all([
      fetch("/api/course").then((r) => r.json()).catch(() => null),
    ]).then(([courseData]) => {
      if (courseData?.courses?.length > 0) setCourses(courseData.courses);
    });
    // Try seed + group join silently
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
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-white has-bottom-nav">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* School Battle */}
        <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-3xl p-5 text-white shadow-lg shadow-violet-200/50">
          <h2 className="text-sm font-bold opacity-90 mb-3">School Battle</h2>
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

        {/* Quick Stats */}
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }} className="flex-1 bg-gradient-to-r from-violet-600 to-purple-500 text-white px-4 py-3 rounded-2xl text-sm font-bold active:scale-[0.98] transition-all shadow-sm shadow-violet-200">+ 수업 만들기</button>
          <button onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }} className="flex-1 bg-white border border-violet-200 px-4 py-3 rounded-2xl text-sm font-bold text-violet-700 active:scale-[0.98] transition-all">코드로 참여하기</button>
        </div>

        {showCreate && (<form onSubmit={createCourse} className="bg-white rounded-3xl shadow-sm border border-violet-100 p-5 space-y-3"><h3 className="font-bold text-sm">새 수업 만들기</h3><input type="text" placeholder="수업 이름" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none" /><input type="text" placeholder="설명 (선택)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none" /><button type="submit" className="w-full bg-violet-600 text-white py-3 rounded-2xl text-sm font-bold">만들기</button></form>)}
        {showJoin && (<form onSubmit={joinCourse} className="bg-white rounded-3xl shadow-sm border border-violet-100 p-5 space-y-3"><h3 className="font-bold text-sm">수업 참여하기</h3><input type="text" placeholder="초대 코드" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} required className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-center tracking-[0.3em] font-mono text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none" /><button type="submit" className="w-full bg-violet-600 text-white py-3 rounded-2xl text-sm font-bold">참여하기</button></form>)}

        {/* Enrolled Courses */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-800">내 수업</h2>
          {enrolled.map((course) => {
            const ns = course.sessions?.[0];
            const isLive = ns && new Date(ns.startsAt).getTime() - 600000 <= pageNow && new Date(ns.endsAt).getTime() + 600000 >= pageNow;
            const tags: string[] = (() => { try { return JSON.parse(course.tags); } catch { return []; } })();
            return (
              <div key={course.id} onClick={() => router.push(`/courses/${course.id}`)} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-5 cursor-pointer card-hover">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center text-xl flex-shrink-0">{getCourseEmoji(course.tags)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base truncate">{course.title}</h3>
                      {isLive && <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold"><span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE</span>}
                    </div>
                    {course.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{course.description}</p>}
                    {tags.length > 0 && <div className="flex gap-1 mt-2 flex-wrap">{tags.slice(0, 3).map((t) => <span key={t} className="text-[10px] bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-medium">{t}</span>)}</div>}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-4 text-[11px] text-gray-400">
                  <span>👥 {course._count.members}명</span><span>📝 {course.noteCount}</span><span>💬 {course._count.questions}</span><span>📅 {course._count.sessions}</span>
                  <span className="ml-auto text-[10px] font-mono text-gray-300">{course.inviteCode}</span>
                </div>
                {ns && <div className="mt-2 text-xs text-gray-400">{isLive ? "🔴 지금 수업 중!" : `다음 수업: ${new Date(ns.startsAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric", weekday: "short" })}`}</div>}
              </div>
            );
          })}
        </div>

        {available.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-base font-bold text-gray-800">참여 가능한 수업</h2>
            {available.map((course) => (
              <div key={course.id} className="bg-white rounded-3xl shadow-sm border border-dashed border-violet-200 p-4 sm:p-5 flex items-center gap-3">
                <div className="flex-1 min-w-0"><h3 className="font-bold text-sm truncate">{course.title}</h3></div>
                <button onClick={() => quickJoin(course.inviteCode)} disabled={joining === course.inviteCode} className="bg-gradient-to-r from-violet-600 to-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl active:scale-95 transition-all">{joining === course.inviteCode ? "..." : "참여"}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CoursesPage() { return <AuthGuard><CoursesContent /></AuthGuard>; }
