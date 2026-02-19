"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const stepIcons = ["🏫", "📜", "🚀"];
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
  const [inviteCode, setInviteCode] = useState(invite || "CAMPUS2026");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    async function init() {
      let data = await fetch("/api/schools").then((r) => r.json()).catch(() => ({ schools: [] }));
      if (!data.schools || data.schools.length === 0) {
        await fetch("/api/seed", { method: "POST" }).catch(() => {});
        data = await fetch("/api/schools").then((r) => r.json()).catch(() => ({ schools: [] }));
      }
      setSchools(data.schools || []);
      const kr = (data.schools || []).find((s: { countryCode: string }) => s.countryCode === "KR");
      if (kr) setSchoolId(kr.id);
      setInitLoading(false);
    }
    init();
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

  if (initLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-mesh gap-4">
        <div className="scene-3d">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 float-3d shadow-3d-lg flex items-center justify-center">
            <span className="text-white text-lg font-black">kn</span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0s" }} />
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
          <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh relative overflow-hidden flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none scene-3d">
        <div className="absolute top-[15%] left-[10%] w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400/20 to-purple-400/10 float-3d backdrop-blur-sm border border-white/20" />
        <div className="absolute bottom-[20%] right-[12%] w-10 h-10 rounded-full bg-gradient-to-br from-pink-400/15 to-rose-400/10 float-3d-alt backdrop-blur-sm border border-white/20" />
      </div>

      <div className="relative z-10 max-w-sm w-full space-y-5 animate-scale-in">
        <div className="text-center space-y-3">
          <div className="scene-3d inline-block">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 float-3d shadow-3d flex items-center justify-center mx-auto">
              <span className="text-3xl">{stepIcons[step - 1]}</span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-slate-800">{stepTitles[step - 1]}</h1>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${s <= step ? "w-8 bg-gradient-to-r from-indigo-500 to-purple-500" : "w-4 bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="card-3d p-6 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-500 ml-1">학교</label>
                <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full glass rounded-2xl px-4 py-3 mt-1 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none border-0">
                  <option value="">학교를 선택하세요</option>
                  {schools.map((s) => <option key={s.id} value={s.id}>{s.countryCode === "KR" ? "🇰🇷" : "🇺🇸"} {s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 ml-1">닉네임</label>
                <input type="text" placeholder="어떻게 불러드릴까요?" value={nickname} onChange={(e) => setNickname(e.target.value)}
                  className="w-full glass rounded-2xl px-4 py-3 mt-1 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none border-0" />
              </div>
              <button onClick={() => { if (schoolId && nickname) setStep(2); else setError("모든 필드를 입력해주세요"); }}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3.5 rounded-2xl font-bold text-sm btn-3d animate-gradient">다음</button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="glass rounded-2xl p-4 text-xs text-slate-500 max-h-36 overflow-y-auto space-y-2 leading-relaxed">
                <p>1. 교재/슬라이드 원본 업로드는 금지됩니다.</p>
                <p>2. 사용자는 자신의 콘텐츠에 책임을 집니다.</p>
                <p>3. 외부 메신저 ID 공유는 제한됩니다.</p>
                <p>4. 서비스 개선을 위해 활동 로그를 수집합니다.</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-2 -m-2 rounded-xl active:bg-slate-50">
                <input type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} className="w-5 h-5 rounded accent-indigo-500" />
                <span className="text-sm text-slate-700 font-medium">위 약관에 동의합니다</span>
              </label>
              <button onClick={handleOnboarding} disabled={!termsAgreed || loading}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3.5 rounded-2xl font-bold text-sm disabled:opacity-50 btn-3d animate-gradient">
                {loading ? "잠시만요..." : "설정 완료"}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center py-2">
                <div className="text-3xl mb-2">🎉</div>
                <p className="text-sm text-slate-600 font-medium">환영합니다! 그룹에 참여하고 수업을 시작해보세요.</p>
              </div>
              <div className="glass rounded-2xl p-3 text-center">
                <p className="text-[11px] text-slate-400 mb-1">파일럿 그룹 초대 코드</p>
                <p className="text-lg font-black text-gradient tracking-[0.2em] font-mono">CAMPUS2026</p>
              </div>
              <input type="text" placeholder="그룹 초대 코드" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full glass rounded-2xl px-4 py-3 text-center tracking-[0.3em] font-mono text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none border-0" />
              <button onClick={handleGroupJoin} disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3.5 rounded-2xl font-bold text-sm disabled:opacity-50 btn-3d animate-gradient">
                {loading ? "잠시만요..." : inviteCode ? "그룹 참여하기" : "건너뛰기"}
              </button>
            </>
          )}

          {error && <p className="text-red-500 text-xs bg-red-50/80 backdrop-blur rounded-xl px-3 py-2 text-center">{error}</p>}
        </div>

        <p className="text-center text-[11px] text-slate-300 tracking-wide">knotyournote.</p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return <Suspense><OnboardingForm /></Suspense>;
}
