"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite") || "";

  const [step, setStep] = useState(1);
  const [schools, setSchools] = useState<{ id: string; name: string; countryCode: string }[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [nickname, setNickname] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [inviteCode, setInviteCode] = useState(invite);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/schools").then((r) => r.json()).then((d) => setSchools(d.schools || []));
  }, []);

  async function handleOnboarding() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname, schoolId, termsAgreed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류 발생");
    } finally {
      setLoading(false);
    }
  }

  async function handleGroupJoin() {
    if (!inviteCode) { router.push("/courses"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/group/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/courses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류 발생");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-sm w-full bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-600">온보딩</h1>
        <div className="flex justify-center gap-2">
          {[1, 2, 3].map((s) => <div key={s} className={`w-8 h-1 rounded ${s <= step ? "bg-blue-500" : "bg-gray-200"}`} />)}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700">학교 선택 & 닉네임</h2>
            <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} className="w-full border rounded-lg px-4 py-3">
              <option value="">학교를 선택하세요</option>
              {schools.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.countryCode})</option>)}
            </select>
            <input type="text" placeholder="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full border rounded-lg px-4 py-3" />
            <button onClick={() => { if (schoolId && nickname) setStep(2); else setError("모든 항목을 입력해주세요"); }} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">다음</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700">이용약관 동의</h2>
            <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 max-h-40 overflow-y-auto space-y-2">
              <p>1. 교재/슬라이드 원문 업로드가 금지됩니다.</p>
              <p>2. 작성 콘텐츠의 책임은 사용자에게 있으며, 침해 신고 시 삭제/제재가 가능합니다.</p>
              <p>3. 외부 메신저 ID 공유가 제한됩니다.</p>
              <p>4. 서비스 이용 중 수집되는 활동 로그는 서비스 개선에 활용됩니다.</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm text-gray-700">위 약관에 동의합니다</span>
            </label>
            <button onClick={handleOnboarding} disabled={!termsAgreed || loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? "처리 중..." : "완료"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700">파일럿 그룹 참가</h2>
            <input type="text" placeholder="그룹 초대 코드 (선택)" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className="w-full border rounded-lg px-4 py-3 text-center tracking-widest" />
            <button onClick={handleGroupJoin} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? "처리 중..." : inviteCode ? "그룹 참가" : "건너뛰기"}
            </button>
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return <Suspense><OnboardingForm /></Suspense>;
}
