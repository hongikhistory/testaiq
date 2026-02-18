"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-lg w-full text-center space-y-8">
        <div>
          <h1 className="text-5xl font-extrabold text-blue-600 mb-2">CampUs</h1>
          <p className="text-lg text-gray-600">수업 기반 글로벌 학습 커뮤니티</p>
          <p className="text-sm text-gray-500 mt-2">
            수업 중엔 잠깐 열리는 라이브 노트, 수업 후엔 요약+Q&A로 남는 학습 공간
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">파일럿 참여하기</h2>
          <input
            type="text"
            placeholder="초대 코드 입력"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <button
            onClick={() => router.push("/auth?invite=" + inviteCode)}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            시작하기
          </button>
          <p className="text-xs text-gray-400">이미 계정이 있나요?{" "}
            <button onClick={() => router.push("/auth")} className="text-blue-500 underline">로그인</button>
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div className="bg-white/70 rounded-xl p-4">
            <div className="text-2xl mb-1">&#x1F4DD;</div>
            <div className="font-medium text-gray-700">라이브 노트</div>
            <div className="text-xs text-gray-500">수업 시간에만 열리는 공동 필기</div>
          </div>
          <div className="bg-white/70 rounded-xl p-4">
            <div className="text-2xl mb-1">&#x1F4CA;</div>
            <div className="font-medium text-gray-700">자동 요약</div>
            <div className="text-xs text-gray-500">AI 기반 1페이지 요약</div>
          </div>
          <div className="bg-white/70 rounded-xl p-4">
            <div className="text-2xl mb-1">&#x1F4AC;</div>
            <div className="font-medium text-gray-700">Q&A 아카이브</div>
            <div className="text-xs text-gray-500">시험 대비 문답 축적</div>
          </div>
        </div>
      </div>
    </div>
  );
}
