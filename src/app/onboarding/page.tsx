"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const stepEmojis = ["\uD83C\uDFEB", "\uD83D\uDCDC", "\uD83D\uDE80"];
const stepTitles = ["학교 선택", "이용약관", "그룹 참여"];

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
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/onboarding", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nickname, schoolId, termsAgreed }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep(3);
    } catch (err) { setError(err instanceof Error ? err.message : "오류가 발생했어요"); }
    finally { setLoading(false); }
  }

  async function handleGroupJoin() {
    if (!inviteCode) { router.push("/courses"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/group/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ inviteCode }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/courses");
    } catch (err) { setError(err instanceof Error ? err.message : "오류가 발생했어요"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 px-4">
      <div className="max-w-sm w-full space-y-5 animate-bounce-in">
        <div className="text-center space-y-2">
          <div className="text-4xl">{stepEmojis[step - 1]}</div>
          <h1 className="text-xl font-bold text-gray-800">{stepTitles[step - 1]}</h1>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${s <= step ? "w-8 bg-violet-500" : "w-4 bg-gray-200"}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-violet-100/50 p-6 space-y-4 border border-violet-50">
          {step === 1 && (
            <>
              <div>
                <label className="text-xs font-medium text-gray-500 ml-1">학교</label>
                <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1 text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none bg-white">
                  <option value="">학교를 선택하세요</option>
                  {schools.map((s) => <option key={s.id} value={s.id}>{s.countryCode === "KR" ? "\uD83C\uDDF0\uD83C\uDDF7" : "\uD83C\uDDFA\uD83C\uDDF8"} {s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 ml-1">닉네임</label>
                <input type="text" placeholder="어떻게 불러드릴까요?" value={nickname} onChange={(e) => setNickname(e.target.value)}
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 mt-1 text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none" />
              </div>
              <button onClick={() => { if (schoolId && nickname) setStep(2); else setError("모든 필드를 입력해주세요"); }}
                className="w-full bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 text-white py-3.5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all">
                다음
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-500 max-h-36 overflow-y-auto space-y-2 leading-relaxed">
                <p>1. 교재/슬라이드 원본 업로드는 금지됩니다.</p>
                <p>2. 사용자는 자신의 콘텐츠에 책임을 집니다.</p>
                <p>3. 외부 메신저 ID 공유는 제한됩니다.</p>
                <p>4. 서비스 개선을 위해 활동 로그를 수집합니다.</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-2 -m-2 rounded-xl active:bg-gray-50">
                <input type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} className="w-5 h-5 rounded accent-violet-500" />
                <span className="text-sm text-gray-700 font-medium">위 약관에 동의합니다</span>
              </label>
              <button onClick={handleOnboarding} disabled={!termsAgreed || loading}
                className="w-full bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 text-white py-3.5 rounded-2xl font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-all">
                {loading ? "잠시만요..." : "설정 완료"}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center py-2">
                <div className="text-3xl mb-2">\uD83C\uDF89</div>
                <p className="text-sm text-gray-600">환영합니다! 파일럿 그룹에 참여하고 다른 학교와 경쟁해보세요.</p>
              </div>
              <input type="text" placeholder="그룹 초대 코드" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-center tracking-[0.3em] font-mono text-sm focus:ring-2 focus:ring-violet-400 focus:outline-none" />
              <button onClick={handleGroupJoin} disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 via-purple-500 to-pink-500 text-white py-3.5 rounded-2xl font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-all">
                {loading ? "잠시만요..." : inviteCode ? "그룹 참여" : "건너뛰기"}
              </button>
            </>
          )}

          {error && <p className="text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2 text-center">{error}</p>}
        </div>

        {step === 3 && <p className="text-center text-[11px] text-gray-300">체험: CAMPUS2026</p>}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return <Suspense><OnboardingForm /></Suspense>;
}
