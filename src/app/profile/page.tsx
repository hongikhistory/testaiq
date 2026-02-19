"use client";

import { useState, useEffect } from "react";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";

interface EventItem { id: string; event: string; metadata: string; createdAt: string; user: { nickname: string; avatar: string } }

const levelNames = ["", "Beginner", "Active Learner", "Contributor", "Expert", "Master"];
const levelThresholds = [0, 0, 20, 50, 80, 150];
const badgeList = [
  { name: "첫 걸음", desc: "10P 달성", icon: "👣", threshold: 10 },
  { name: "열심히 배우는 중", desc: "30P 달성", icon: "📖", threshold: 30 },
  { name: "기여자", desc: "50P 달성", icon: "⭐", threshold: 50 },
  { name: "지식 공유자", desc: "100P 달성", icon: "🏆", threshold: 100 },
  { name: "학습 리더", desc: "200P 달성", icon: "👑", threshold: 200 },
  { name: "캠퍼스 레전드", desc: "500P 달성", icon: "🚀", threshold: 500 },
];
const eventLabels: Record<string, string> = {
  note_created: "노트를 작성했어요", summary_generated: "요약을 생성했어요", question_created: "질문을 남겼어요",
  answer_created: "답변을 달았어요", answer_accepted: "답변이 채택됐어요", streak_reached: "연속 출석 달성!",
  badge_earned: "뱃지를 획득했어요", level_up: "레벨업!",
};

const _now = Date.now();
const DEMO_EVENTS: EventItem[] = [
  { id: "e1", event: "note_created", metadata: JSON.stringify({ courseTitle: "CS101" }), createdAt: new Date(_now - 20 * 60000).toISOString(), user: { nickname: "민지", avatar: "🎨" } },
  { id: "e2", event: "note_created", metadata: JSON.stringify({ courseTitle: "CS101" }), createdAt: new Date(_now - 25 * 60000).toISOString(), user: { nickname: "Alex", avatar: "🏀" } },
  { id: "e3", event: "streak_reached", metadata: JSON.stringify({ days: 7 }), createdAt: new Date(_now - 3600000).toISOString(), user: { nickname: "Alex", avatar: "🏀" } },
  { id: "e4", event: "question_created", metadata: JSON.stringify({ title: "BST에서 노드 삭제할 때 3가지 경우가 헷갈려요" }), createdAt: new Date(_now - 5 * 3600000).toISOString(), user: { nickname: "현우", avatar: "📐" } },
  { id: "e5", event: "answer_created", metadata: JSON.stringify({ questionTitle: "Stack으로 괄호 매칭하는 코드 예시 있나요?" }), createdAt: new Date(_now - 2 * 86400000).toISOString(), user: { nickname: "민지", avatar: "🎨" } },
  { id: "e6", event: "badge_earned", metadata: JSON.stringify({ badge: "활발한 학습자" }), createdAt: new Date(_now - 2 * 86400000).toISOString(), user: { nickname: "민지", avatar: "🎨" } },
  { id: "e7", event: "summary_generated", metadata: JSON.stringify({ courseTitle: "CS101", week: "Week 3" }), createdAt: new Date(_now - 3 * 86400000).toISOString(), user: { nickname: "Emma", avatar: "🔬" } },
  { id: "e8", event: "answer_accepted", metadata: JSON.stringify({ answerer: "Alex", questionTitle: "Big-O에서 상수를 무시하는 이유" }), createdAt: new Date(_now - 9 * 86400000).toISOString(), user: { nickname: "Alex", avatar: "🏀" } },
  { id: "e9", event: "level_up", metadata: JSON.stringify({ level: 4 }), createdAt: new Date(_now - 86400000).toISOString(), user: { nickname: "Alex", avatar: "🏀" } },
];

function ProfileContent() {
  const { user } = useUser();
  const [events, setEvents] = useState<EventItem[]>(DEMO_EVENTS);

  useEffect(() => {
    fetch("/api/activity?limit=15").then((r) => r.json()).then((d) => { if (d.events?.length > 0) setEvents(d.events); }).catch(() => {});
  }, []);

  if (!user) return null;

  const avatar = user.avatar || (user.nickname || "?")[0];
  const pts = user.points || 0;
  const streak = user.streak || 0;
  const badges = badgeList.filter((b) => pts >= b.threshold);
  const nextBadge = badgeList.find((b) => pts < b.threshold);
  const level = pts >= 150 ? 5 : pts >= 80 ? 4 : pts >= 50 ? 3 : pts >= 20 ? 2 : 1;
  const currentThreshold = levelThresholds[level] || 0;
  const nextThreshold = levelThresholds[level + 1] || levelThresholds[level] + 100;
  const levelProgress = Math.min(100, Math.round(((pts - currentThreshold) / (nextThreshold - currentThreshold)) * 100));

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금 전";
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
  }
  function getEventMeta(ev: EventItem) { try { return JSON.parse(ev.metadata); } catch { return {}; } }

  return (
    <div className="min-h-screen bg-mesh has-bottom-nav">
      <NavBar nickname={user.nickname || ""} points={pts} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        {/* Profile Card - 3D gradient */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 shadow-3d-lg p-5 text-white animate-slide-up">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5 blur-xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 glass-dark rounded-2xl flex items-center justify-center text-3xl shadow-lg">{avatar}</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold truncate">{user.nickname}</h1>
              <p className="text-indigo-200 text-xs font-medium">{user.school?.name || "학교 미설정"}</p>
            </div>
          </div>
          <div className="relative mt-4 grid grid-cols-3 gap-2.5 text-center">
            <div className="glass-dark rounded-2xl p-3"><div className="text-2xl font-black">{pts}</div><div className="text-[10px] text-indigo-200">포인트</div></div>
            <div className="glass-dark rounded-2xl p-3"><div className="text-2xl font-black">Lv.{level}</div><div className="text-[10px] text-indigo-200">{levelNames[level]}</div></div>
            <div className="glass-dark rounded-2xl p-3"><div className="text-2xl font-black">{streak}일</div><div className="text-[10px] text-indigo-200">연속 출석</div></div>
          </div>
          <div className="relative mt-3">
            <div className="flex justify-between text-[10px] text-indigo-200 mb-1"><span>Lv.{level} {levelNames[level]}</span><span>{level < 5 ? `${pts}/${nextThreshold}P` : "MAX"}</span></div>
            <div className="w-full bg-white/20 rounded-full h-2.5"><div className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full transition-all" style={{ width: `${levelProgress}%` }} /></div>
          </div>
        </div>

        {/* Badges */}
        <div className="card-3d p-5">
          <h2 className="text-sm font-bold mb-3 text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-xs">🏅</span>
            뱃지 ({badges.length}/{badgeList.length})
          </h2>
          <div className="grid grid-cols-3 gap-2.5 stagger-children">
            {badgeList.map((b) => {
              const earned = pts >= b.threshold;
              return (
                <div key={b.name} className={`rounded-2xl p-3 text-center transition ${earned ? "bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 shadow-sm" : "bg-slate-50 opacity-40"}`}>
                  <div className="text-xl mb-1">{b.icon}</div>
                  <div className={`text-[10px] font-bold leading-tight ${earned ? "text-slate-700" : "text-slate-400"}`}>{b.name}</div>
                  <div className="text-[10px] text-slate-400">{b.desc}</div>
                </div>
              );
            })}
          </div>
          {nextBadge && <div className="mt-3 text-center text-xs text-slate-400">다음: {nextBadge.icon} {nextBadge.name} ({nextBadge.threshold - pts}P 더 필요)</div>}
        </div>

        {/* Point Rules */}
        <div className="card-3d p-5">
          <h2 className="text-sm font-bold mb-3 text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center text-xs">💡</span>
            포인트 획득 방법
          </h2>
          <div className="space-y-2.5">
            {[
              { act: "라이브 노트 작성", pts: "+1P", gradient: "from-indigo-500 to-blue-500" },
              { act: "질문 작성", pts: "+2P", gradient: "from-pink-500 to-rose-500" },
              { act: "답변 작성", pts: "+3P", gradient: "from-emerald-500 to-teal-500" },
              { act: "AI 요약 생성", pts: "+5P", gradient: "from-purple-500 to-violet-500" },
              { act: "답변 채택", pts: "+10P", gradient: "from-amber-500 to-orange-500" },
            ].map((r) => (
              <div key={r.act} className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg text-white bg-gradient-to-r ${r.gradient} shadow-sm`}>{r.pts}</span>
                <span className="flex-1 text-slate-600 text-xs font-medium">{r.act}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card-3d p-5">
          <h2 className="text-sm font-bold mb-3 text-slate-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-xs">⚡</span>
            최근 활동
          </h2>
          <div className="space-y-3 stagger-children">
            {events.map((ev) => {
              const meta = getEventMeta(ev);
              return (
                <div key={ev.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-sm flex-shrink-0 font-bold text-indigo-600 shadow-sm">{ev.user.avatar || (ev.user.nickname || "?")[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-relaxed">
                      <span className="font-bold text-slate-700">{ev.user.nickname}</span>{" "}
                      <span className="text-slate-500">{eventLabels[ev.event] || ev.event}</span>
                      {meta.courseTitle && <span className="text-slate-400"> · {meta.courseTitle}</span>}
                      {meta.title && <span className="text-slate-400 text-[10px]"> &ldquo;{(meta.title as string).slice(0, 25)}...&rdquo;</span>}
                      {meta.badge && <span className="text-amber-600 font-semibold"> {meta.badge}</span>}
                      {meta.level && <span className="text-indigo-600 font-semibold"> Lv.{meta.level}</span>}
                      {meta.days && <span className="text-orange-600 font-semibold"> {meta.days}일</span>}
                    </p>
                    <p className="text-[10px] text-slate-300 mt-0.5">{timeAgo(ev.createdAt)}</p>
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

export default function ProfilePage() { return <AuthGuard><ProfileContent /></AuthGuard>; }
