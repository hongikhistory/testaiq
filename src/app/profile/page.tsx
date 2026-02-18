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
  { name: "첫 걸음", desc: "10P", icon: "\uD83D\uDC63", threshold: 10 },
  { name: "열심히 배우는 중", desc: "30P", icon: "\uD83D\uDCD6", threshold: 30 },
  { name: "기여자", desc: "50P", icon: "\u2B50", threshold: 50 },
  { name: "지식 공유자", desc: "100P", icon: "\uD83C\uDFC6", threshold: 100 },
  { name: "학습 리더", desc: "200P", icon: "\uD83D\uDC51", threshold: 200 },
  { name: "캠퍼스 레전드", desc: "500P", icon: "\uD83D\uDE80", threshold: 500 },
];

const eventLabels: Record<string, string> = {
  note_created: "노트를 작성했어요",
  summary_generated: "요약을 생성했어요",
  question_created: "질문을 남겼어요",
  answer_created: "답변을 달았어요",
  answer_accepted: "답변이 채택됐어요",
  streak_reached: "연속 출석 달성!",
  badge_earned: "뱃지를 획득했어요",
  level_up: "레벨업!",
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
    if (mins < 1) return "방금 전";
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  }

  function getEventMeta(ev: EventItem) {
    try { return JSON.parse(ev.metadata); } catch { return {}; }
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb] has-bottom-nav">
      <NavBar nickname={user.nickname || ""} points={user.points} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200/50 p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
              {avatar}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold truncate">{user.nickname}</h1>
              <p className="text-blue-100 text-xs">{user.school?.name || "학교 미설정"}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
              <div className="text-xl font-extrabold">{user.points}</div>
              <div className="text-[10px] text-blue-100">포인트</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
              <div className="text-xl font-extrabold">Lv.{level}</div>
              <div className="text-[10px] text-blue-100">{levelNames[level]}</div>
            </div>
            <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
              <div className="text-xl font-extrabold">{streak}일</div>
              <div className="text-[10px] text-blue-100">연속 출석</div>
            </div>
          </div>
          {/* Level Progress */}
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-blue-100 mb-1">
              <span>Lv.{level} {levelNames[level]}</span>
              <span>{level < 5 ? `${user.points}/${nextThreshold}P` : "MAX"}</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-bold mb-3">뱃지 ({badges.length}/{badgeList.length})</h2>
          <div className="grid grid-cols-3 gap-2">
            {badgeList.map((b) => {
              const earned = user.points >= b.threshold;
              return (
                <div key={b.name} className={`rounded-xl p-3 text-center transition ${earned ? "bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100" : "bg-gray-50 opacity-40"}`}>
                  <div className="text-xl mb-1">{b.icon}</div>
                  <div className={`text-[10px] font-semibold leading-tight ${earned ? "text-gray-700" : "text-gray-400"}`}>{b.name}</div>
                  <div className="text-[10px] text-gray-400">{b.desc}</div>
                </div>
              );
            })}
          </div>
          {nextBadge && (
            <div className="mt-3 text-center text-xs text-gray-400">
              다음 뱃지: {nextBadge.icon} {nextBadge.name} ({nextBadge.threshold - user.points}P 더 필요)
            </div>
          )}
        </div>

        {/* Point Rules */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-bold mb-3">포인트 획득 방법</h2>
          <div className="space-y-2">
            {[
              { act: "라이브 노트 작성", pts: "+1P", icon: "📝" },
              { act: "질문 작성", pts: "+2P", icon: "❓" },
              { act: "답변 작성", pts: "+3P", icon: "💬" },
              { act: "AI 요약 생성", pts: "+5P", icon: "📋" },
              { act: "답변 채택", pts: "+10P", icon: "✅" },
            ].map((r) => (
              <div key={r.act} className="flex items-center gap-3 text-sm">
                <span className="text-base w-6 text-center">{r.icon}</span>
                <span className="flex-1 text-gray-600 text-xs">{r.act}</span>
                <span className="font-bold text-blue-600 text-xs">{r.pts}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-bold mb-3">최근 활동</h2>
          <div className="space-y-3">
            {events.length === 0 && <p className="text-gray-400 text-xs text-center py-4">아직 활동 내역이 없어요</p>}
            {events.map((ev) => {
              const meta = getEventMeta(ev);
              return (
                <div key={ev.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center text-xs flex-shrink-0 font-bold text-blue-600">
                    {ev.user.avatar || (ev.user.nickname || "?")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed">
                      <span className="font-semibold">{ev.user.nickname}</span>{" "}
                      <span className="text-gray-500">{eventLabels[ev.event] || ev.event}</span>
                      {meta.courseTitle && <span className="text-gray-400"> &middot; {meta.courseTitle}</span>}
                      {meta.title && <span className="text-gray-400 text-[10px]"> &ldquo;{(meta.title as string).slice(0, 25)}...&rdquo;</span>}
                      {meta.badge && <span className="text-yellow-600 font-medium"> {meta.badge}</span>}
                      {meta.level && <span className="text-blue-600 font-medium"> Lv.{meta.level}</span>}
                      {meta.days && <span className="text-orange-600 font-medium"> {meta.days}일</span>}
                    </p>
                    <p className="text-[10px] text-gray-300 mt-0.5">{timeAgo(ev.createdAt)}</p>
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
