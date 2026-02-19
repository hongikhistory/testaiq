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
    <div className="min-h-screen bg-mesh relative overflow-hidden">
      {/* 3D Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none scene-3d overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute top-[10%] left-[8%] w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400/30 to-purple-400/20 float-3d backdrop-blur-sm border border-white/20" />
        <div className="absolute top-[15%] right-[10%] w-12 h-12 rounded-full bg-gradient-to-br from-pink-400/25 to-rose-400/15 float-3d-alt backdrop-blur-sm border border-white/20" />
        <div className="absolute top-[45%] left-[5%] w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-400/15 float-3d-slow backdrop-blur-sm border border-white/20 rotate-12" />
        <div className="absolute bottom-[25%] right-[8%] w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-teal-400/15 float-3d backdrop-blur-sm border border-white/20 -rotate-12" />
        <div className="absolute bottom-[15%] left-[15%] w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400/20 to-indigo-400/15 float-3d-alt backdrop-blur-sm border border-white/20 rotate-45" />
        {/* Large gradient orb */}
        <div className="absolute top-[5%] right-[20%] w-64 h-64 rounded-full bg-gradient-to-br from-indigo-300/10 to-purple-300/5 blur-3xl animate-spin-slow" />
        <div className="absolute bottom-[10%] left-[10%] w-48 h-48 rounded-full bg-gradient-to-br from-pink-300/10 to-rose-300/5 blur-3xl animate-spin-slow" style={{ animationDirection: "reverse" }} />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="max-w-md w-full text-center space-y-8 animate-scale-in">
          {/* 3D Logo */}
          <div className="scene-3d inline-block">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 float-3d shadow-3d-lg flex items-center justify-center mx-auto">
              <span className="text-white text-3xl font-black">kn</span>
            </div>
          </div>

          {/* Brand */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 text-xs font-semibold text-indigo-600 shadow-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {stats.users > 0 ? `${stats.users}명 참여 중` : "Pilot Open"}
            </div>
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
              <span className="text-gradient">knot a note</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 font-semibold">당신의 노트를 세계로 잇다</p>
            <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
              수업 중 실시간 노트 공유, AI 요약, Q&A 아카이브.
              <br />전 세계 캠퍼스를 하나로 연결합니다.
            </p>
          </div>

          {/* CTA Card - 3D Glass */}
          <div className="card-3d p-6 sm:p-8 space-y-4">
            <h2 className="text-base font-bold text-slate-700">Get Started</h2>
            <input
              type="text"
              placeholder="초대 코드 입력"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full glass rounded-2xl px-4 py-3.5 text-center text-base tracking-[0.3em] font-mono focus:ring-2 focus:ring-indigo-400 focus:outline-none transition placeholder:tracking-normal placeholder:font-sans border-0"
            />
            <button
              onClick={() => router.push("/auth?invite=" + inviteCode)}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-base btn-3d animate-gradient shadow-lg shadow-indigo-200/40">
              시작하기
            </button>
            <p className="text-xs text-slate-400">
              이미 계정이 있으신가요?{" "}
              <button onClick={() => router.push("/auth")} className="text-indigo-500 font-semibold hover:underline">로그인</button>
            </p>
          </div>

          {/* 3D Feature Cards */}
          <div className="grid grid-cols-3 gap-3 stagger-children">
            {[
              { icon: "📝", title: "실시간 노트", desc: "LIVE 수업 노트 공유", gradient: "from-indigo-500 to-blue-500" },
              { icon: "✨", title: "AI 요약", desc: "자동 핵심 정리", gradient: "from-purple-500 to-pink-500" },
              { icon: "💬", title: "Q&A Hub", desc: "질문 아카이브", gradient: "from-pink-500 to-rose-500" },
            ].map((f) => (
              <div key={f.title} className="card-3d p-4 text-center group cursor-default">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-xl mx-auto mb-2.5 shadow-lg group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <div className="font-bold text-xs text-slate-700">{f.title}</div>
                <div className="text-[10px] text-slate-400 mt-1 leading-snug">{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2">
            <div className="flex flex-col items-center"><span className="font-black text-lg text-gradient">{stats.schools || 2}</span><span>Schools</span></div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex flex-col items-center"><span className="font-black text-lg text-gradient">{stats.courses || 3}</span><span>Courses</span></div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="flex flex-col items-center"><span className="font-black text-lg text-gradient">{stats.notes || 41}</span><span>Notes</span></div>
          </div>

          <p className="text-[11px] text-slate-300 tracking-wide">knotyournote.</p>
        </div>
      </div>
    </div>
  );
}
