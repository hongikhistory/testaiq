"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [stats, setStats] = useState({ schools: 0, courses: 0, notes: 0, users: 0 });

  useEffect(() => {
    fetch("/api/stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 px-4 py-8">
      <div className="max-w-md w-full text-center space-y-6 animate-bounce-in">
        {/* Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur rounded-full px-4 py-1.5 text-xs text-violet-600 font-medium border border-violet-100 shadow-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {stats.users > 0 ? `${stats.users}명의 학생이 참여 중` : "파일럿 진행 중"}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            <span className="bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">CampUs</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">함께 배우는 캠퍼스 커뮤니티</p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            수업 중 실시간 노트, 수업 후 AI 요약, 영원히 남는 Q&A 아카이브
          </p>
        </div>

        {/* CTA Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-violet-100/50 p-6 sm:p-8 space-y-4 border border-violet-50">
          <h2 className="text-base font-bold text-gray-800">파일럿에 참여하기</h2>
          <input
            type="text"
            placeholder="초대 코드 입력"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="w-full border border-gray-200 rounded-2xl px-4 py-3.5 text-center text-base tracking-[0.3em] font-mono focus:ring-2 focus:ring-violet-400 focus:border-transparent focus:outline-none transition placeholder:tracking-normal placeholder:font-sans"
          />
          <button
            onClick={() => router.push("/auth?invite=" + inviteCode)}
            className="w-full bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 text-white py-3.5 rounded-2xl font-bold text-base hover:shadow-lg hover:shadow-violet-200 active:scale-[0.98] transition-all"
          >
            시작하기
          </button>
          <p className="text-xs text-gray-400">
            이미 계정이 있으신가요?{" "}
            <button onClick={() => router.push("/auth")} className="text-violet-500 font-medium hover:underline">로그인</button>
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { emoji: "\uD83D\uDCDD", title: "실시간 노트", desc: "수업 중에만 열리는 공유 노트", color: "from-violet-50 to-violet-100/50" },
            { emoji: "\u2728", title: "AI 요약", desc: "수업 끝나면 자동 요약", color: "from-purple-50 to-purple-100/50" },
            { emoji: "\uD83D\uDCAC", title: "Q&A 모음", desc: "시험대비 질문 아카이브", color: "from-pink-50 to-pink-100/50" },
          ].map((f) => (
            <div key={f.title} className={`bg-gradient-to-br ${f.color} rounded-2xl p-3.5 border border-white/60 text-center`}>
              <div className="text-2xl mb-1.5">{f.emoji}</div>
              <div className="font-bold text-[11px] text-gray-700">{f.title}</div>
              <div className="text-[10px] text-gray-400 mt-0.5 leading-snug">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-5 text-xs text-gray-400 pt-2">
          <div><span className="font-bold text-violet-600 text-sm">{stats.schools}</span> Schools</div>
          <div className="w-px h-3 bg-gray-200" />
          <div><span className="font-bold text-violet-600 text-sm">{stats.courses}</span> Courses</div>
          <div className="w-px h-3 bg-gray-200" />
          <div><span className="font-bold text-violet-600 text-sm">{stats.notes}</span> Notes</div>
        </div>
      </div>
    </div>
  );
}
