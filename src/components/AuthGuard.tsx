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

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-violet-50/50 to-white"><div className="animate-spin h-8 w-8 border-3 border-violet-500 border-t-transparent rounded-full" /></div>;
  if (!user || !user.onboarded) return null;

  return <>{children}</>;
}
