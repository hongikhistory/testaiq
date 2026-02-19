"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const tabs = [
  {
    href: "/courses",
    label: "수업",
    icon: (a: boolean) => (
      <svg className={`w-5 h-5 ${a ? "text-violet-600" : "text-gray-400"}`} fill={a ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 0 : 1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: "/leaderboard",
    label: "랭킹",
    icon: (a: boolean) => (
      <svg className={`w-5 h-5 ${a ? "text-violet-600" : "text-gray-400"}`} fill={a ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 0 : 1.8} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/tags",
    label: "태그",
    icon: (a: boolean) => (
      <svg className={`w-5 h-5 ${a ? "text-violet-600" : "text-gray-400"}`} fill={a ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 0 : 1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "내 정보",
    icon: (a: boolean) => (
      <svg className={`w-5 h-5 ${a ? "text-violet-600" : "text-gray-400"}`} fill={a ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={a ? 0 : 1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
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
      {/* Desktop Top Nav */}
      <nav className="hidden md:flex bg-white/90 backdrop-blur-xl border-b border-violet-100/50 px-6 py-3 items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/courses" className="text-xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            CampUs
          </Link>
          {tabs.map((t) => (
            <Link key={t.href} href={t.href} className={`text-sm font-medium transition-all px-3 py-1.5 rounded-lg ${pathname.startsWith(t.href) ? "text-violet-700 bg-violet-50" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"}`}>
              {t.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-gray-600 font-medium">{nickname}</span>
          <span className="text-xs bg-gradient-to-r from-violet-500 to-purple-500 text-white px-2.5 py-1 rounded-full font-bold">Lv.{level}</span>
          <span className="text-xs bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full font-bold border border-amber-200">{points}P</span>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-red-400 ml-1 transition">Logout</button>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <nav className="md:hidden bg-white/90 backdrop-blur-xl border-b border-violet-100/50 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/courses" className="text-lg font-extrabold bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          CampUs
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-[11px] bg-gradient-to-r from-violet-500 to-purple-500 text-white px-2 py-0.5 rounded-full font-bold">Lv.{level}</span>
          <span className="text-[11px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold border border-amber-200">{points}P</span>
        </div>
      </nav>

      {/* Mobile Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 z-50 pb-safe">
        <div className="flex items-center justify-around py-1.5">
          {tabs.map((t) => {
            const active = pathname.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href} className={`flex flex-col items-center gap-0.5 min-w-[60px] py-1.5 rounded-xl transition-all ${active ? "bg-violet-50" : ""}`}>
                {t.icon(active)}
                <span className={`text-[10px] font-semibold ${active ? "text-violet-600" : "text-gray-400"}`}>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
