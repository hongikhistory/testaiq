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
      setError(err instanceof Error ? err.message : "오류 발생");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-blue-600 mb-6">CampUs</h1>
        <div className="flex gap-2 mb-6">
          <button onClick={() => setIsLogin(true)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${isLogin ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>로그인</button>
          <button onClick={() => setIsLogin(false)} className={`flex-1 py-2 rounded-lg text-sm font-medium ${!isLogin ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>회원가입</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
          <input type="password" placeholder="비밀번호 (6자 이상)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-400 focus:outline-none" />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
            {loading ? "처리 중..." : isLogin ? "로그인" : "회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return <Suspense><AuthForm /></Suspense>;
}
