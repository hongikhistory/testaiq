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

const DEMO_USERS: RankedUser[] = [
  { id: "u-alex", nickname: "Alex", avatar: "🏀", points: 95, level: 4, streak: 7, lastActiveAt: new Date().toISOString(), school: { name: "UC Berkeley", countryCode: "US" }, _count: { liveNotes: 12, questions: 3, answers: 5, summaries: 1 } },
  { id: "u-minji", nickname: "민지", avatar: "🎨", points: 87, level: 4, streak: 5, lastActiveAt: new Date().toISOString(), school: { name: "홍익대학교", countryCode: "KR" }, _count: { liveNotes: 14, questions: 2, answers: 4, summaries: 2 } },
  { id: "u-emma", nickname: "Emma", avatar: "🔬", points: 63, level: 3, streak: 4, lastActiveAt: new Date().toISOString(), school: { name: "UC Berkeley", countryCode: "US" }, _count: { liveNotes: 8, questions: 1, answers: 3, summaries: 1 } },
  { id: "u-jiwoo", nickname: "지우", avatar: "🎵", points: 52, level: 3, streak: 3, lastActiveAt: new Date(Date.now() - 3600000).toISOString(), school: { name: "홍익대학교", countryCode: "KR" }, _count: { liveNotes: 6, questions: 2, answers: 1, summaries: 0 } },
  { id: "u-jason", nickname: "Jason", avatar: "💻", points: 41, level: 2, streak: 2, lastActiveAt: new Date(Date.now() - 7200000).toISOString(), school: { name: "UC Berkeley", countryCode: "US" }, _count: { liveNotes: 5, questions: 1, answers: 2, summaries: 0 } },
  { id: "u-hyun", nickname: "현우", avatar: "📐", points: 34, level: 2, streak: 2, lastActiveAt: new Date(Date.now() - 86400000).toISOString(), school: { name: "홍익대학교", countryCode: "KR" }, _count: { liveNotes: 4, questions: 2, answers: 1, summaries: 0 } },
  { id: "u-soyeon", nickname: "소연", avatar: "🎭", points: 28, level: 2, streak: 1, lastActiveAt: new Date(Date.now() - 172800000).toISOString(), school: { name: "홍익대학교", countryCode: "KR" }, _count: { liveNotes: 3, questions: 0, answers: 1, summaries: 1 } },
  { id: "u-sophia", nickname: "Sophia", avatar: "🎯", points: 22, level: 2, streak: 1, lastActiveAt: null, school: { name: "UC Berkeley", countryCode: "US" }, _count: { liveNotes: 2, questions: 1, answers: 1, summaries: 0 } },
];
const DEMO_SCHOOLS: SchoolRank[] = [
  { id: "school-ucb", name: "UC Berkeley", countryCode: "US", totalPoints: 234, memberCount: 6 },
  { id: "school-hongik", name: "홍익대학교", countryCode: "KR", totalPoints: 226, memberCount: 6 },
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

  function isOnline(lastActive: string | null) { return lastActive ? Date.now() - new Date(lastActive).getTime() < 86400000 : false; }

  return (
    <div className="min-h-screen bg-mesh has-bottom-nav">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-sm">🏆</span>Rankings
        </h1>

        <div className="flex gap-1 glass rounded-2xl p-1">
          <button onClick={() => setTab("users")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === "users" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>🏆 Top Learners</button>
          <button onClick={() => setTab("schools")} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === "schools" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>⚔️ School Battle</button>
        </div>

        {tab === "users" && (
          <div className="space-y-2.5">
            {users.length >= 3 && (
              <div className="card-3d p-5 animate-slide-up">
                <div className="grid grid-cols-3 gap-3">
                  {[users[1], users[0], users[2]].map((u, idx) => {
                    const isMe = u.id === user?.id;
                    const heights = ["h-20", "h-28", "h-16"];
                    const medals = ["🥈", "🥇", "🥉"];
                    const gradients = ["from-slate-300 to-slate-400", "from-amber-300 via-yellow-400 to-amber-300", "from-amber-600 to-amber-500"];
                    return (
                      <div key={u.id} className={`flex flex-col items-center justify-end ${isMe ? "scale-105" : ""}`}>
                        <div className="relative mb-1.5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-lg ${idx === 1 ? "bg-gradient-to-br from-amber-200 to-yellow-300 ring-2 ring-amber-200" : "bg-gradient-to-br from-slate-100 to-slate-200"}`}>
                            {u.avatar || (u.nickname || "?")[0]}
                          </div>
                          {isOnline(u.lastActiveAt) && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white" />}
                        </div>
                        <span className="text-xs font-bold text-slate-700 truncate max-w-full">{u.nickname}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{u.points}P</span>
                        <div className={`w-full ${heights[idx]} bg-gradient-to-t ${gradients[idx]} rounded-t-2xl mt-1.5 flex items-start justify-center pt-2 shadow-inner`}>
                          <span className="text-xl drop-shadow">{medals[idx]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="stagger-children">
              {users.map((u, i) => {
                if (i < 3) return null;
                const isMe = u.id === user?.id;
                return (
                  <div key={u.id} className={`card-3d p-4 flex items-center gap-3 mb-2.5 ${isMe ? "animate-pulse-glow" : ""}`}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-500">{i + 1}</div>
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-base font-bold text-indigo-600 shadow-sm">{u.avatar || (u.nickname || "?")[0]}</div>
                      {isOnline(u.lastActiveAt) && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold truncate text-slate-800">{u.nickname}</span>
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-lg font-bold">Lv.{u.level}</span>
                        {u.streak >= 3 && <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg font-bold">🔥{u.streak}일</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 flex gap-2 mt-0.5 font-medium"><span>{u.school?.name}</span><span>📝 {u._count.liveNotes}</span></div>
                    </div>
                    <div className="text-sm font-extrabold text-gradient">{u.points}P</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "schools" && (
          <div className="space-y-3 stagger-children">
            {schools.map((s, i) => {
              const maxPts = schools[0]?.totalPoints || 1;
              const pct = Math.round((s.totalPoints / maxPts) * 100);
              const flag = s.countryCode === "KR" ? "🇰🇷" : "🇺🇸";
              return (
                <div key={s.id} className={`card-3d p-5 ${i === 0 ? "animate-pulse-glow" : ""}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shadow-md ${i === 0 ? "bg-gradient-to-br from-amber-300 to-yellow-400" : "bg-gradient-to-br from-slate-100 to-slate-200"}`}>{flag}</div>
                      <div><div className="text-sm font-bold text-slate-800">{s.name}</div><div className="text-[10px] text-slate-400 font-medium">{s.memberCount}명 참여</div></div>
                    </div>
                    <div className="text-xl font-black text-gradient">{s.totalPoints}P</div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${i === 0 ? "bg-gradient-to-r from-amber-400 to-yellow-400" : "bg-gradient-to-r from-indigo-400 to-purple-400"}`} style={{ width: `${pct}%` }} />
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
