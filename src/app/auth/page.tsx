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
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">CampUs</h1>
          <p className="text-sm text-gray-400">Campus Learning Community</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 p-6 sm:p-8 space-y-5">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${isLogin ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>Sign In</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${!isLogin ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>Sign Up</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 ml-1">Email</label>
              <input type="email" placeholder="you@university.edu" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none transition" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 ml-1">Password</label>
              <input type="password" placeholder="6+ characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none transition" />
            </div>
            {error && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98] disabled:opacity-50 transition-all">
              {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="text-center">
            <p className="text-xs text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setIsLogin(!isLogin)} className="text-blue-500 font-medium hover:underline">
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-gray-300">Try: minji@hongik.ac.kr / password123</p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return <Suspense><AuthForm /></Suspense>;
}
