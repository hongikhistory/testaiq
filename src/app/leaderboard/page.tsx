"use client";

import { useState, useEffect } from "react";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";

interface RankedUser {
  id: string; nickname: string; avatar: string; points: number; level: number; streak: number; lastActiveAt: string | null;
  school: { name: string; countryCode: string } | null;
  _count: { liveNotes: number; questions: number; answers: number; summaries: number };
}
interface SchoolRank { id: string; name: string; countryCode: string; totalPoints: number; memberCount: number }

function LeaderboardContent() {
  const { user } = useUser();
  const [users, setUsers] = useState<RankedUser[]>([]);
  const [schools, setSchools] = useState<SchoolRank[]>([]);
  const [tab, setTab] = useState<"users" | "schools">("users");

  useEffect(() => {
    fetch("/api/leaderboard").then((r) => r.json()).then((d) => {
      setUsers(d.users || []);
      setSchools(d.schools || []);
    });
  }, []);

  const medals = ["", "bg-yellow-400", "bg-gray-300", "bg-amber-600"];
  const levelNames = ["", "Beginner", "Active", "Contributor", "Expert", "Master"];

  function isOnline(lastActive: string | null) {
    if (!lastActive) return false;
    return Date.now() - new Date(lastActive).getTime() < 86400000;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">Leaderboard</h1>

        <div className="flex gap-2">
          <button onClick={() => setTab("users")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "users" ? "bg-blue-600 text-white" : "bg-white border"}`}>
            Top Learners
          </button>
          <button onClick={() => setTab("schools")} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "schools" ? "bg-blue-600 text-white" : "bg-white border"}`}>
            School Battle
          </button>
        </div>

        {tab === "users" && (
          <div className="space-y-2">
            {users.map((u, i) => {
              const rank = i + 1;
              const isMe = u.id === user?.id;
              return (
                <div key={u.id} className={`bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 ${isMe ? "ring-2 ring-blue-400" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${rank <= 3 ? `${medals[rank]} text-white` : "bg-gray-100 text-gray-500"}`}>
                    {rank <= 3 ? rank : rank}
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-lg">
                      {u.avatar || (u.nickname || "?")[0]}
                    </div>
                    {isOnline(u.lastActiveAt) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{u.nickname}</span>
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Lv.{u.level} {levelNames[u.level] || ""}</span>
                      {u.streak >= 3 && <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">{u.streak}d streak</span>}
                    </div>
                    <div className="text-xs text-gray-400 flex gap-3 mt-0.5">
                      <span>{u.school?.name}</span>
                      <span>Notes {u._count.liveNotes}</span>
                      <span>Q&A {u._count.questions + u._count.answers}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-yellow-600">{u.points}P</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "schools" && (
          <div className="space-y-4">
            {schools.map((s, i) => {
              const maxPts = schools[0]?.totalPoints || 1;
              const pct = Math.round((s.totalPoints / maxPts) * 100);
              return (
                <div key={s.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-300">#{i + 1}</span>
                      <div>
                        <div className="font-bold text-lg">{s.countryCode === "KR" ? "\uD83C\uDDF0\uD83C\uDDF7" : "\uD83C\uDDFA\uD83C\uDDF8"} {s.name}</div>
                        <div className="text-xs text-gray-400">{s.memberCount}명 참여</div>
                      </div>
                    </div>
                    <div className="text-2xl font-extrabold text-blue-600">{s.totalPoints}P</div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${i === 0 ? "bg-blue-500" : "bg-indigo-400"}`} style={{ width: `${pct}%` }} />
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

export default function LeaderboardPage() {
  return <AuthGuard><LeaderboardContent /></AuthGuard>;
}
