"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const invite = searchParams.get("invite") || "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.user?.onboarded) {
        router.push("/courses");
      } else {
        router.push("/onboarding" + (invite ? "?invite=" + invite : ""));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "문제가 발생했어요");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-mesh relative overflow-hidden flex items-center justify-center px-4">
      {/* 3D decorative elements */}
      <div className="absolute inset-0 pointer-events-none scene-3d">
        <div className="absolute top-[12%] left-[10%] w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-400/20 to-purple-400/10 float-3d backdrop-blur-sm border border-white/20" />
        <div className="absolute top-[20%] right-[12%] w-10 h-10 rounded-full bg-gradient-to-br from-pink-400/20 to-rose-400/10 float-3d-alt backdrop-blur-sm border border-white/20" />
        <div className="absolute bottom-[20%] left-[8%] w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/15 to-orange-400/10 float-3d-slow backdrop-blur-sm border border-white/20 rotate-12" />
        <div className="absolute bottom-[30%] right-[10%] w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400/15 to-teal-400/10 float-3d backdrop-blur-sm border border-white/20 -rotate-6" />
      </div>

      <div className="relative z-10 max-w-sm w-full space-y-6 animate-scale-in">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="scene-3d inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 float-3d shadow-3d-lg flex items-center justify-center mx-auto">
              <span className="text-white text-2xl font-black">kn</span>
            </div>
          </div>
          <h1 className="text-3xl font-black text-gradient">knot a note</h1>
          <p className="text-sm text-slate-400">당신의 노트를 세계로 잇다</p>
        </div>

        {/* Auth Card - 3D Glass */}
        <div className="card-3d p-6 sm:p-8 space-y-5">
          <div className="flex gap-1 glass rounded-2xl p-1">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${isLogin ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
              로그인
            </button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${!isLogin ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}>
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 ml-1">이메일</label>
              <input type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full glass rounded-2xl px-4 py-3 mt-1 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition border-0" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 ml-1">비밀번호</label>
              <input type="password" placeholder="6자 이상" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full glass rounded-2xl px-4 py-3 mt-1 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition border-0" />
            </div>
            {error && <p className="text-red-500 text-xs bg-red-50/80 backdrop-blur rounded-xl px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3.5 rounded-2xl font-bold text-sm btn-3d animate-gradient disabled:opacity-50 shadow-lg shadow-indigo-200/40">
              {loading ? "잠시만요..." : isLogin ? "로그인" : "가입하기"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-xs text-slate-400">
              {isLogin ? "아직 계정이 없으신가요? " : "이미 계정이 있으신가요? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-indigo-500 font-semibold hover:underline">
                {isLogin ? "회원가입" : "로그인"}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-300">체험: minji@hongik.ac.kr / password123</p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return <Suspense><AuthForm /></Suspense>;
}
