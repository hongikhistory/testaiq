"use client";

import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";

function ProfileContent() {
  const { user } = useUser();

  if (!user) return null;

  const badges = [];
  if (user.points >= 10) badges.push({ name: "첫 발걸음", desc: "10포인트 달성" });
  if (user.points >= 50) badges.push({ name: "활발한 학습자", desc: "50포인트 달성" });
  if (user.points >= 100) badges.push({ name: "지식 기여자", desc: "100포인트 달성" });
  if (user.points >= 500) badges.push({ name: "학습 리더", desc: "500포인트 달성" });

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar nickname={user.nickname || ""} points={user.points} />
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-blue-600">{(user.nickname || "?")[0].toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-bold">{user.nickname}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-400 mt-1">{user.school?.name}</p>
          <div className="mt-4 inline-block bg-yellow-50 px-6 py-3 rounded-xl">
            <div className="text-3xl font-extrabold text-yellow-600">{user.points}</div>
            <div className="text-xs text-yellow-500 font-medium">포인트</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">배지</h2>
          {badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {badges.map((b) => (
                <div key={b.name} className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-1">&#x1F3C6;</div>
                  <div className="font-semibold text-sm">{b.name}</div>
                  <div className="text-xs text-gray-400">{b.desc}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">아직 배지가 없습니다. 활동을 시작해보세요!</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">포인트 기준</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between"><span>라이브 노트 작성</span><span className="font-medium">+1P</span></div>
            <div className="flex justify-between"><span>질문 작성</span><span className="font-medium">+2P</span></div>
            <div className="flex justify-between"><span>답변 작성</span><span className="font-medium">+3P</span></div>
            <div className="flex justify-between"><span>요약 생성</span><span className="font-medium">+5P</span></div>
            <div className="flex justify-between"><span>답변 채택됨</span><span className="font-medium">+10P</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <AuthGuard><ProfileContent /></AuthGuard>;
}
