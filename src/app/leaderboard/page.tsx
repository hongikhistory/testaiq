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

// === HARDCODED DEMO DATA ===
const DEMO_USERS: RankedUser[] = [
  { id: "u-alex", nickname: "Alex", avatar: "\uD83C\uDFC0", points: 95, level: 4, streak: 7, lastActiveAt: new Date().toISOString(), school: { name: "UC Berkeley", countryCode: "US" }, _count: { liveNotes: 12, questions: 3, answers: 5, summaries: 1 } },
  { id: "u-minji", nickname: "\uBBFC\uC9C0", avatar: "\uD83C\uDFA8", points: 87, level: 4, streak: 5, lastActiveAt: new Date().toISOString(), school: { name: "\uD64D\uC775\uB300\uD559\uAD50", countryCode: "KR" }, _count: { liveNotes: 14, questions: 2, answers: 4, summaries: 2 } },
  { id: "u-emma", nickname: "Emma", avatar: "\uD83D\uDD2C", points: 63, level: 3, streak: 4, lastActiveAt: new Date().toISOString(), school: { name: "UC Berkeley", countryCode: "US" }, _count: { liveNotes: 8, questions: 1, answers: 3, summaries: 1 } },
  { id: "u-jiwoo", nickname: "\uC9C0\uC6B0", avatar: "\uD83C\uDFB5", points: 52, level: 3, streak: 3, lastActiveAt: new Date(Date.now() - 3600000).toISOString(), school: { name: "\uD64D\uC775\uB300\uD559\uAD50", countryCode: "KR" }, _count: { liveNotes: 6, questions: 2, answers: 1, summaries: 0 } },
  { id: "u-jason", nickname: "Jason", avatar: "\uD83D\uDCBB", points: 41, level: 2, streak: 2, lastActiveAt: new Date(Date.now() - 7200000).toISOString(), school: { name: "UC Berkeley", countryCode: "US" }, _count: { liveNotes: 5, questions: 1, answers: 2, summaries: 0 } },
  { id: "u-hyun", nickname: "\uD604\uC6B0", avatar: "\uD83D\uDCD0", points: 34, level: 2, streak: 2, lastActiveAt: new Date(Date.now() - 86400000).toISOString(), school: { name: "\uD64D\uC775\uB300\uD559\uAD50", countryCode: "KR" }, _count: { liveNotes: 4, questions: 2, answers: 1, summaries: 0 } },
  { id: "u-soyeon", nickname: "\uC18C\uC5F0", avatar: "\uD83C\uDFAD", points: 28, level: 2, streak: 1, lastActiveAt: new Date(Date.now() - 172800000).toISOString(), school: { name: "\uD64D\uC775\uB300\uD559\uAD50", countryCode: "KR" }, _count: { liveNotes: 3, questions: 0, answers: 1, summaries: 1 } },
  { id: "u-sophia", nickname: "Sophia", avatar: "\uD83C\uDFAF", points: 22, level: 2, streak: 1, lastActiveAt: null, school: { name: "UC Berkeley", countryCode: "US" }, _count: { liveNotes: 2, questions: 1, answers: 1, summaries: 0 } },
];
const DEMO_SCHOOLS: SchoolRank[] = [
  { id: "school-ucb", name: "UC Berkeley", countryCode: "US", totalPoints: 234, memberCount: 6 },
  { id: "school-hongik", name: "\uD64D\uC775\uB300\uD559\uAD50", countryCode: "KR", totalPoints: 226, memberCount: 6 },
];

function LeaderboardContent() {
  const { user } = useUser();
  const [users, setUsers] = useState<RankedUser[]>(DEMO_USERS);
  const [schools, setSchools] = useState<SchoolRank[]>(DEMO_SCHOOLS);
  const [tab, setTab] = useState<"users" | "schools">("users");

  useEffect(() => {
    fetch("/api/leaderboard").then((r) => r.json()).then((d) => {
      if (d.users?.length > 0) setUsers(d.users);
      if (d.schools?.length > 0) setSchools(d.schools);
    }).catch(() => {});
  }, []);

  function isOnline(lastActive: string | null) {
    if (!lastActive) return false;
    return Date.now() - new Date(lastActive).getTime() < 86400000;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-white has-bottom-nav">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <h1 className="text-lg font-bold">랭킹</h1>

        <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
          <button onClick={() => setTab("users")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === "users" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>🏆 Top Learners</button>
          <button onClick={() => setTab("schools")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === "schools" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>🏫 School Battle</button>
        </div>

        {tab === "users" && (
          <div className="space-y-2.5">
            {users.length >= 3 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[users[1], users[0], users[2]].map((u, idx) => {
                  const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
                  const isMe = u.id === user?.id;
                  const heights = ["h-20", "h-24", "h-16"];
                  const medals = ["🥈", "🥇", "🥉"];
                  const bgColors = ["from-gray-200 to-gray-300", "from-amber-300 to-yellow-400", "from-amber-600 to-amber-500"];
                  return (
                    <div key={u.id} className={`flex flex-col items-center justify-end ${isMe ? "scale-105" : ""}`}>
                      <div className="relative mb-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg ${rank === 1 ? "bg-gradient-to-br from-amber-200 to-yellow-300 ring-2 ring-amber-200 shadow-lg shadow-amber-100" : "bg-gradient-to-br from-gray-100 to-gray-200"}`}>{u.avatar || (u.nickname || "?")[0]}</div>
                        {isOnline(u.lastActiveAt) && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />}
                      </div>
                      <span className="text-[10px] font-bold text-gray-700 truncate max-w-full">{u.nickname}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{u.points}P</span>
                      <div className={`w-full ${heights[idx]} bg-gradient-to-t ${bgColors[idx]} rounded-t-2xl mt-1 flex items-start justify-center pt-1.5`}>
                        <span className="text-lg">{medals[idx]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {users.map((u, i) => {
              if (i < 3) return null;
              const isMe = u.id === user?.id;
              return (
                <div key={u.id} className={`bg-white rounded-3xl shadow-sm border p-4 flex items-center gap-3 ${isMe ? "border-violet-300 bg-violet-50/30" : "border-gray-100"}`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-gray-100 text-gray-500">{i + 1}</div>
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center text-sm font-bold text-violet-600">{u.avatar || (u.nickname || "?")[0]}</div>
                    {isOnline(u.lastActiveAt) && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold truncate">{u.nickname}</span>
                      <span className="text-[10px] bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-bold">Lv.{u.level}</span>
                      {u.streak >= 3 && <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-bold">🔥{u.streak}일</span>}
                    </div>
                    <div className="text-[10px] text-gray-400 flex gap-2 mt-0.5">
                      <span>{u.school?.name}</span><span>📝 {u._count.liveNotes}</span><span>💬 {u._count.questions + u._count.answers}</span>
                    </div>
                  </div>
                  <div className="text-sm font-extrabold text-amber-500">{u.points}P</div>
                </div>
              );
            })}
          </div>
        )}

        {tab === "schools" && (
          <div className="space-y-3">
            {schools.map((s, i) => {
              const maxPts = schools[0]?.totalPoints || 1;
              const pct = Math.round((s.totalPoints / maxPts) * 100);
              const flag = s.countryCode === "KR" ? "🇰🇷" : "🇺🇸";
              return (
                <div key={s.id} className={`bg-white rounded-3xl shadow-sm border p-5 ${i === 0 ? "border-amber-200 ring-2 ring-amber-100" : "border-gray-100"}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-extrabold text-gray-200">#{i + 1}</span>
                      <div>
                        <div className="text-sm font-bold">{flag} {s.name}</div>
                        <div className="text-[10px] text-gray-400">{s.memberCount}명 참여</div>
                      </div>
                    </div>
                    <div className="text-lg font-extrabold bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">{s.totalPoints}P</div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${i === 0 ? "bg-gradient-to-r from-amber-400 to-yellow-400" : "bg-gradient-to-r from-violet-400 to-purple-400"}`} style={{ width: `${pct}%` }} />
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

export default function LeaderboardPage() { return <AuthGuard><LeaderboardContent /></AuthGuard>; }
