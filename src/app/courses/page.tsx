"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";

interface Session { id: string; startsAt: string; endsAt: string }
interface Course {
  id: string; title: string; description: string; inviteCode: string; tags: string;
  sessions: Session[]; _count: { members: number };
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

  const scores = groupData?.scores as Record<string, { school: { name: string; countryCode?: string }; score: number; memberCount: number }> | undefined;

  return (
    <div className="min-h-screen bg-[#f8f9fb] has-bottom-nav">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">
        {/* School Battle */}
        {scores && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-5 text-white">
            <h2 className="text-sm font-semibold opacity-80 mb-3">School Battle</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(scores).map((s, i) => (
                <div key={i} className="bg-white/15 backdrop-blur rounded-xl p-3 text-center">
                  <div className="text-xs opacity-80">{s.school.countryCode === "KR" ? "\uD83C\uDDF0\uD83C\uDDF7" : "\uD83C\uDDFA\uD83C\uDDF8"}</div>
                  <div className="font-bold text-sm mt-0.5 truncate">{s.school.name}</div>
                  <div className="text-2xl font-extrabold my-1">{s.score}<span className="text-sm font-normal opacity-70">P</span></div>
                  <div className="text-[11px] opacity-70">{s.memberCount} members</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={() => { setShowCreate(!showCreate); setShowJoin(false); }}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-500 text-white px-4 py-3 rounded-xl text-sm font-semibold active:scale-[0.98] transition-all">
            + Create Course
          </button>
          <button onClick={() => { setShowJoin(!showJoin); setShowCreate(false); }}
            className="flex-1 bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 active:scale-[0.98] transition-all">
            Join with Code
          </button>
        </div>

        {showCreate && (
          <form onSubmit={createCourse} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="font-bold text-sm">Create New Course</h3>
            <input type="text" placeholder="Course title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            <input type="text" placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold">Create</button>
          </form>
        )}

        {showJoin && (
          <form onSubmit={joinCourse} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
            <h3 className="font-bold text-sm">Join Course</h3>
            <input type="text" placeholder="INVITE CODE" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} required className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center tracking-[0.3em] font-mono text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold">Join</button>
          </form>
        )}

        {/* Course List */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-800">My Courses</h2>
          {loading && <div className="text-center py-12"><div className="animate-spin h-6 w-6 border-3 border-blue-500 border-t-transparent rounded-full mx-auto" /></div>}
          {!loading && courses.length === 0 && <div className="text-center py-12 text-gray-400 text-sm">No courses yet. Create or join one!</div>}
          {courses.map((course) => {
            const nextSession = course.sessions?.[0];
            const isLive = nextSession && new Date(nextSession.startsAt).getTime() - 600000 <= now && new Date(nextSession.endsAt).getTime() + 600000 >= now;
            const tags: string[] = (() => { try { return JSON.parse(course.tags); } catch { return []; } })();
            return (
              <div key={course.id} onClick={() => router.push(`/courses/${course.id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base truncate">{course.title}</h3>
                      {isLive && (
                        <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
                        </span>
                      )}
                    </div>
                    {course.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{course.description}</p>}
                    {tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">{tags.slice(0, 3).map((t) => <span key={t} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t}</span>)}</div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-400">{course._count.members} members</div>
                    <div className="text-[10px] font-mono text-gray-300 mt-0.5">{course.inviteCode}</div>
                  </div>
                </div>
                {nextSession && (
                  <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Next: {new Date(nextSession.startsAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric", weekday: "short" })} {new Date(nextSession.startsAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return <AuthGuard><CoursesContent /></AuthGuard>;
}
