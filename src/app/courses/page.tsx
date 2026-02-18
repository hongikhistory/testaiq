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
      setShowCreate(false);
      setTitle("");
      setDescription("");
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
      setShowJoin(false);
      setJoinCode("");
      const data = await fetch("/api/course").then((r) => r.json());
      setCourses(data.courses || []);
    }
  }

  const scores = groupData?.scores as Record<string, { school: { name: string }; score: number; memberCount: number }> | undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Group Scoreboard */}
        {scores && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4">학교 대결 점수판</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.values(scores).map((s, i) => (
                <div key={i} className={`text-center p-4 rounded-lg ${i === 0 ? "bg-blue-50" : "bg-indigo-50"}`}>
                  <div className="font-bold text-lg">{s.school.name}</div>
                  <div className="text-3xl font-extrabold text-blue-600 my-2">{s.score}</div>
                  <div className="text-sm text-gray-500">{s.memberCount}명 참여</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => setShowCreate(!showCreate)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">수업 만들기</button>
          <button onClick={() => setShowJoin(!showJoin)} className="bg-white border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">초대코드로 참여</button>
        </div>

        {showCreate && (
          <form onSubmit={createCourse} className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="font-semibold">새 수업 만들기</h3>
            <input type="text" placeholder="수업 제목" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full border rounded-lg px-4 py-3" />
            <input type="text" placeholder="설명 (선택)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded-lg px-4 py-3" />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg">생성</button>
          </form>
        )}

        {showJoin && (
          <form onSubmit={joinCourse} className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="font-semibold">수업 참여하기</h3>
            <input type="text" placeholder="초대 코드" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} required className="w-full border rounded-lg px-4 py-3 tracking-widest text-center" />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg">참여</button>
          </form>
        )}

        {/* Course List */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold">내 수업</h2>
          {loading && <div className="text-center py-8 text-gray-400">로딩 중...</div>}
          {!loading && courses.length === 0 && <div className="text-center py-8 text-gray-400">아직 참여한 수업이 없습니다</div>}
          {courses.map((course) => {
            const nextSession = course.sessions?.[0];
            const isLive = nextSession && new Date(nextSession.startsAt).getTime() - 600000 <= now && new Date(nextSession.endsAt).getTime() + 600000 >= now;
            return (
              <div key={course.id} onClick={() => router.push(`/courses/${course.id}`)} className="bg-white rounded-xl shadow p-5 cursor-pointer hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">{course.title}</h3>
                      {isLive && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">LIVE</span>}
                    </div>
                    {course.description && <p className="text-sm text-gray-500 mt-1">{course.description}</p>}
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div>{course._count.members}명</div>
                    <div className="text-xs font-mono">{course.inviteCode}</div>
                  </div>
                </div>
                {nextSession && (
                  <div className="mt-2 text-xs text-gray-500">
                    다음 수업: {new Date(nextSession.startsAt).toLocaleString("ko-KR")}
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
