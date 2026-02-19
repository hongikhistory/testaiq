"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const tabs = [
  { href: "/courses", label: "Notes", mLabel: "Notes", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: "/leaderboard", label: "Ranks", mLabel: "Ranks", icon: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/tags", label: "Tags", mLabel: "Tags", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
  { href: "/profile", label: "Profile", mLabel: "Me", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export default function NavBar({ nickname, points }: { nickname: string; points: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const level = points >= 150 ? 5 : points >= 80 ? 4 : points >= 50 ? 3 : points >= 20 ? 2 : 1;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth");
  }

  return (
    <>
      {/* Desktop Nav - Glassmorphism floating bar */}
      <nav className="hidden md:flex glass sticky top-0 z-50 px-6 py-3 items-center justify-between border-b border-white/30">
        <div className="flex items-center gap-8">
          <Link href="/courses" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-200/50">
              <span className="text-white text-sm font-black">kn</span>
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              <span className="text-gradient">knot a note</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            {tabs.map((t) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link key={t.href} href={t.href}
                  className={`flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl transition-all ${active ? "bg-indigo-50 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                  </svg>
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-600 font-semibold">{nickname}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2.5 py-1 rounded-lg font-bold shadow-sm">Lv.{level}</span>
            <span className="text-xs bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg font-bold border border-amber-200/50">{points}P</span>
          </div>
          <button onClick={logout} className="text-xs text-slate-400 hover:text-red-400 ml-1 transition font-medium">Logout</button>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="md:hidden glass sticky top-0 z-50 px-4 py-3 flex items-center justify-between border-b border-white/30">
        <Link href="/courses" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-200/50">
            <span className="text-white text-[10px] font-black">kn</span>
          </div>
          <span className="text-base font-extrabold tracking-tight text-gradient">knot a note</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-lg font-bold">Lv.{level}</span>
          <span className="text-[11px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg font-bold border border-amber-200/50">{points}P</span>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar - Floating 3D style */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="glass rounded-2xl shadow-3d-lg px-2 py-2 pb-safe">
          <div className="flex items-center justify-around">
            {tabs.map((t) => {
              const active = pathname.startsWith(t.href);
              return (
                <Link key={t.href} href={t.href}
                  className={`flex flex-col items-center gap-0.5 min-w-[56px] py-2 rounded-xl transition-all ${active ? "bg-indigo-50 shadow-sm" : ""}`}>
                  <svg className={`w-5 h-5 transition-colors ${active ? "text-indigo-600" : "text-slate-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                  </svg>
                  <span className={`text-[10px] font-semibold ${active ? "text-indigo-600" : "text-slate-400"}`}>{t.mLabel}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
