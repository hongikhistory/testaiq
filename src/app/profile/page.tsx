"use client";

import { useState, useEffect } from "react";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";

interface EventItem {
  id: string; event: string; metadata: string; createdAt: string;
  user: { nickname: string; avatar: string };
}

const levelNames = ["", "Beginner", "Active Learner", "Contributor", "Expert", "Master"];
const levelThresholds = [0, 0, 20, 50, 80, 150];
const badgeList = [
  { name: "First Step", desc: "10P", icon: "\uD83D\uDC63", threshold: 10 },
  { name: "Active Learner", desc: "30P", icon: "\uD83D\uDCD6", threshold: 30 },
  { name: "Contributor", desc: "50P", icon: "\u2B50", threshold: 50 },
  { name: "Knowledge Sharer", desc: "100P", icon: "\uD83C\uDFC6", threshold: 100 },
  { name: "Learning Leader", desc: "200P", icon: "\uD83D\uDC51", threshold: 200 },
  { name: "Campus Legend", desc: "500P", icon: "\uD83D\uDE80", threshold: 500 },
];

const eventLabels: Record<string, string> = {
  note_created: "wrote a note",
  summary_generated: "generated a summary",
  question_created: "asked a question",
  answer_created: "posted an answer",
  answer_accepted: "accepted an answer",
  streak_reached: "reached a streak",
  badge_earned: "earned a badge",
  level_up: "leveled up",
};

function ProfileContent() {
  const { user } = useUser();
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetch("/api/activity?limit=15").then((r) => r.json()).then((d) => setEvents(d.events || []));
  }, []);

  if (!user) return null;

  const avatar = user.avatar || (user.nickname || "?")[0];
  const streak = user.streak || 0;

  const badges = badgeList.filter((b) => user.points >= b.threshold);
  const nextBadge = badgeList.find((b) => user.points < b.threshold);
  const level = user.points >= 150 ? 5 : user.points >= 80 ? 4 : user.points >= 50 ? 3 : user.points >= 20 ? 2 : 1;
  const currentThreshold = levelThresholds[level] || 0;
  const nextThreshold = levelThresholds[level + 1] || levelThresholds[level] + 100;
  const levelProgress = Math.min(100, Math.round(((user.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100));

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function getEventMeta(ev: EventItem) {
    try { return JSON.parse(ev.metadata); } catch { return {}; }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar nickname={user.nickname || ""} points={user.points} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl backdrop-blur">
              {avatar}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{user.nickname}</h1>
              <p className="text-blue-100 text-sm">{user.school?.name || "School not set"}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
              <div className="text-2xl font-extrabold">{user.points}</div>
              <div className="text-xs text-blue-100">Points</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
              <div className="text-2xl font-extrabold">Lv.{level}</div>
              <div className="text-xs text-blue-100">{levelNames[level]}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur">
              <div className="text-2xl font-extrabold">{streak}d</div>
              <div className="text-xs text-blue-100">Streak</div>
            </div>
          </div>
          {/* Level Progress */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-100 mb-1">
              <span>Lv.{level} {levelNames[level]}</span>
              <span>{level < 5 ? `${user.points}/${nextThreshold}P` : "MAX"}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5">
              <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-bold mb-3">Badges ({badges.length}/{badgeList.length})</h2>
          <div className="grid grid-cols-3 gap-2">
            {badgeList.map((b) => {
              const earned = user.points >= b.threshold;
              return (
                <div key={b.name} className={`rounded-xl p-3 text-center transition ${earned ? "bg-gradient-to-br from-yellow-50 to-amber-50" : "bg-gray-50 opacity-40"}`}>
                  <div className="text-2xl mb-1">{b.icon}</div>
                  <div className={`text-xs font-semibold ${earned ? "text-gray-700" : "text-gray-400"}`}>{b.name}</div>
                  <div className="text-[10px] text-gray-400">{b.desc}</div>
                </div>
              );
            })}
          </div>
          {nextBadge && (
            <div className="mt-3 text-center text-sm text-gray-400">
              Next: {nextBadge.icon} {nextBadge.name} ({nextBadge.threshold - user.points}P more)
            </div>
          )}
        </div>

        {/* Point Rules */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-bold mb-3">How to Earn Points</h2>
          <div className="space-y-2">
            {[
              { act: "Write a live note", pts: "+1P", icon: "\uD83D\uDCDD" },
              { act: "Ask a question", pts: "+2P", icon: "\u2753" },
              { act: "Post an answer", pts: "+3P", icon: "\uD83D\uDCAC" },
              { act: "Generate summary", pts: "+5P", icon: "\uD83D\uDCCB" },
              { act: "Get answer accepted", pts: "+10P", icon: "\u2705" },
            ].map((r) => (
              <div key={r.act} className="flex items-center gap-3 text-sm">
                <span className="text-lg w-7 text-center">{r.icon}</span>
                <span className="flex-1 text-gray-600">{r.act}</span>
                <span className="font-bold text-blue-600">{r.pts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-lg font-bold mb-3">Recent Activity</h2>
          <div className="space-y-3">
            {events.length === 0 && <p className="text-gray-400 text-sm text-center py-4">No activity yet</p>}
            {events.map((ev) => {
              const meta = getEventMeta(ev);
              return (
                <div key={ev.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    {ev.user.avatar || (ev.user.nickname || "?")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{ev.user.nickname}</span>{" "}
                      <span className="text-gray-500">{eventLabels[ev.event] || ev.event}</span>
                      {meta.courseTitle && <span className="text-gray-400"> in {meta.courseTitle}</span>}
                      {meta.title && <span className="text-gray-400 text-xs"> &ldquo;{(meta.title as string).slice(0, 25)}...&rdquo;</span>}
                      {meta.badge && <span className="text-yellow-600 font-medium"> {meta.badge}</span>}
                      {meta.level && <span className="text-blue-600 font-medium"> Lv.{meta.level}</span>}
                      {meta.days && <span className="text-orange-600 font-medium"> {meta.days} days</span>}
                    </p>
                    <p className="text-xs text-gray-400">{timeAgo(ev.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <AuthGuard><ProfileContent /></AuthGuard>;
}
