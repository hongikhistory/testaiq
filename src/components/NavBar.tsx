"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NavBar({ nickname, points }: { nickname: string; points: number }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth");
  }

  const level = points >= 150 ? 5 : points >= 80 ? 4 : points >= 50 ? 3 : points >= 20 ? 2 : 1;

  return (
    <nav className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-5">
        <Link href="/courses" className="text-xl font-bold text-blue-600">CampUs</Link>
        <Link href="/courses" className="text-sm text-gray-600 hover:text-blue-600">Courses</Link>
        <Link href="/leaderboard" className="text-sm text-gray-600 hover:text-blue-600">Ranking</Link>
        <Link href="/tags" className="text-sm text-gray-600 hover:text-blue-600">Tags</Link>
        <Link href="/profile" className="text-sm text-gray-600 hover:text-blue-600">Profile</Link>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{nickname}</span>
        <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">Lv.{level}</span>
        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">{points}P</span>
        <button onClick={logout} className="text-xs text-gray-400 hover:text-red-500">Logout</button>
      </div>
    </nav>
  );
}
