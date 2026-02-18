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

  const levelNames = ["", "Beginner", "Active", "Contributor", "Expert", "Master"];

  function isOnline(lastActive: string | null) {
    if (!lastActive) return false;
    return Date.now() - new Date(lastActive).getTime() < 86400000;
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] has-bottom-nav">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <h1 className="text-lg font-bold">랭킹</h1>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setTab("users")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition ${tab === "users" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>
            🏆 Top Learners
          </button>
          <button onClick={() => setTab("schools")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition ${tab === "schools" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>
            🏫 School Battle
          </button>
        </div>

        {/* User ranking */}
        {tab === "users" && (
          <div className="space-y-2">
            {/* Top 3 podium */}
            {users.length >= 3 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[users[1], users[0], users[2]].map((u, idx) => {
                  const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                  const isMe = u.id === user?.id;
                  const heights = ["h-20", "h-24", "h-16"];
                  const medals = ["🥈", "🥇", "🥉"];
                  return (
                    <div key={u.id} className={`flex flex-col items-center justify-end ${isMe ? "scale-105" : ""}`}>
                      <div className="relative mb-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${rank === 1 ? "bg-gradient-to-br from-yellow-300 to-amber-400 text-white ring-2 ring-yellow-200" : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"}`}>
                          {u.avatar || (u.nickname || "?")[0]}
                        </div>
                        {isOnline(u.lastActiveAt) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-gray-700 truncate max-w-full">{u.nickname}</span>
                      <span className="text-[10px] text-gray-400">{u.points}P</span>
                      <div className={`w-full ${heights[idx]} bg-gradient-to-t ${rank === 1 ? "from-yellow-400 to-amber-300" : rank === 2 ? "from-gray-300 to-gray-200" : "from-amber-600 to-amber-500"} rounded-t-xl mt-1 flex items-start justify-center pt-1`}>
                        <span className="text-lg">{medals[idx]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rest of rankings */}
            {users.map((u, i) => {
              if (i < 3) return null;
              const rank = i + 1;
              const isMe = u.id === user?.id;
              return (
                <div key={u.id} className={`bg-white rounded-2xl shadow-sm border p-4 flex items-center gap-3 ${isMe ? "border-blue-300 bg-blue-50/30" : "border-gray-100"}`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-500">
                    {rank}
                  </div>
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                      {u.avatar || (u.nickname || "?")[0]}
                    </div>
                    {isOnline(u.lastActiveAt) && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-semibold truncate">{u.nickname}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Lv.{u.level}</span>
                      {u.streak >= 3 && <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">🔥{u.streak}d</span>}
                    </div>
                    <div className="text-[10px] text-gray-400 flex gap-2 mt-0.5">
                      <span>{u.school?.name}</span>
                      <span>노트 {u._count.liveNotes}</span>
                      <span>Q&A {u._count.questions + u._count.answers}</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-yellow-600">{u.points}P</div>
                </div>
              );
            })}
            {users.length === 0 && (
              <div className="text-center py-12">
                <div className="text-3xl mb-2">🏆</div>
                <p className="text-gray-400 text-sm">아직 랭킹 데이터가 없습니다</p>
              </div>
            )}
          </div>
        )}

        {/* School battle */}
        {tab === "schools" && (
          <div className="space-y-3">
            {schools.map((s, i) => {
              const maxPts = schools[0]?.totalPoints || 1;
              const pct = Math.round((s.totalPoints / maxPts) * 100);
              const flag = s.countryCode === "KR" ? "🇰🇷" : "🇺🇸";
              return (
                <div key={s.id} className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${i === 0 ? "ring-2 ring-yellow-300" : ""}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-extrabold text-gray-200">#{i + 1}</span>
                      <div>
                        <div className="text-sm font-bold">{flag} {s.name}</div>
                        <div className="text-[10px] text-gray-400">{s.memberCount}명 참여</div>
                      </div>
                    </div>
                    <div className="text-lg font-extrabold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">{s.totalPoints}P</div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${i === 0 ? "bg-gradient-to-r from-yellow-400 to-amber-400" : "bg-gradient-to-r from-blue-400 to-indigo-400"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {schools.length === 0 && (
              <div className="text-center py-12">
                <div className="text-3xl mb-2">🏫</div>
                <p className="text-gray-400 text-sm">학교 배틀 데이터가 없습니다</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  return <AuthGuard><LeaderboardContent /></AuthGuard>;
}
