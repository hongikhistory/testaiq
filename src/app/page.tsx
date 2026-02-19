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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 py-8">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Hero */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur rounded-full px-4 py-1.5 text-xs text-indigo-600 font-medium border border-indigo-100">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {stats.users > 0 ? `${stats.users} students joined` : "Pilot in progress"}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">CampUs</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 font-medium">Campus Learning Community</p>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            Live notes during class. AI summaries after. Q&A archive forever.
          </p>
        </div>

        {/* CTA Card */}
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 p-6 sm:p-8 space-y-4">
          <h2 className="text-base font-bold text-gray-800">Join the Pilot</h2>
          <input
            type="text"
            placeholder="Enter invite code"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-center text-base tracking-[0.3em] font-mono focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:outline-none transition placeholder:tracking-normal placeholder:font-sans"
          />
          <button
            onClick={() => router.push("/auth?invite=" + inviteCode)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3.5 rounded-xl font-bold text-base hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98] transition-all"
          >
            Get Started
          </button>
          <p className="text-xs text-gray-400">
            Already have an account?{" "}
            <button onClick={() => router.push("/auth")} className="text-blue-500 font-medium hover:underline">Sign in</button>
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { emoji: "\uD83D\uDCDD", title: "Live Notes", desc: "Collaborative notes that open only during class", color: "from-blue-50 to-blue-100/50" },
            { emoji: "\u2728", title: "AI Summary", desc: "One-page summary auto-generated after class", color: "from-purple-50 to-purple-100/50" },
            { emoji: "\uD83D\uDCAC", title: "Q&A Archive", desc: "Questions & answers that build up for exams", color: "from-indigo-50 to-indigo-100/50" },
          ].map((f) => (
            <div key={f.title} className={`bg-gradient-to-br ${f.color} rounded-2xl p-4 sm:p-5 border border-white/60`}>
              <div className="text-2xl mb-2">{f.emoji}</div>
              <div className="font-bold text-sm text-gray-800">{f.title}</div>
              <div className="text-xs text-gray-500 mt-1 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 text-xs text-gray-400 pt-2">
          <div><span className="font-bold text-gray-600 text-sm">{stats.schools}</span> Schools</div>
          <div className="w-px h-3 bg-gray-200" />
          <div><span className="font-bold text-gray-600 text-sm">{stats.courses}</span> Courses</div>
          <div className="w-px h-3 bg-gray-200" />
          <div><span className="font-bold text-gray-600 text-sm">{stats.notes}</span> Notes</div>
        </div>
      </div>
    </div>
  );
}
