"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  nickname: string | null;
  avatar: string;
  schoolId: string | null;
  groupId: string | null;
  points: number;
  level: number;
  streak: number;
  role: string;
  onboarded: boolean;
  school: { id: string; name: string; countryCode: string } | null;
  group: { id: string; name: string } | null;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return { user, loading, setUser };
}

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/auth");
    if (!loading && user && !user.onboarded) router.push("/onboarding");
  }, [user, loading, router]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-mesh gap-4">
      <div className="scene-3d">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 float-3d shadow-3d-lg flex items-center justify-center">
          <span className="text-white text-lg font-black">kn</span>
        </div>
      </div>
      <div className="flex gap-1.5 mt-2">
        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0s" }} />
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
        <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
      </div>
    </div>
  );
  if (!user || !user.onboarded) return null;

  return <>{children}</>;
}
