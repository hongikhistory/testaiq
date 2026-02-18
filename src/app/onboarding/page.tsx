"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const stepEmojis = ["\uD83C\uDFEB", "\uD83D\uDCDC", "\uD83D\uDE80"];
const stepTitles = ["Choose Your School", "Terms of Use", "Join a Group"];

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
    } catch (err) { setError(err instanceof Error ? err.message : "Error occurred"); }
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
    } catch (err) { setError(err instanceof Error ? err.message : "Error occurred"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      <div className="max-w-sm w-full space-y-5">
        <div className="text-center space-y-2">
          <div className="text-4xl">{stepEmojis[step - 1]}</div>
          <h1 className="text-xl font-bold text-gray-800">{stepTitles[step - 1]}</h1>
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${s <= step ? "w-8 bg-blue-500" : "w-4 bg-gray-200"}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 p-6 space-y-4">
          {step === 1 && (
            <>
              <div>
                <label className="text-xs font-medium text-gray-500 ml-1">School</label>
                <select value={schoolId} onChange={(e) => setSchoolId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white">
                  <option value="">Select your school</option>
                  {schools.map((s) => <option key={s.id} value={s.id}>{s.countryCode === "KR" ? "\uD83C\uDDF0\uD83C\uDDF7" : "\uD83C\uDDFA\uD83C\uDDF8"} {s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 ml-1">Nickname</label>
                <input type="text" placeholder="What should we call you?" value={nickname} onChange={(e) => setNickname(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 mt-1 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
              </div>
              <button onClick={() => { if (schoolId && nickname) setStep(2); else setError("Please fill in all fields"); }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition-all">
                Next
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 max-h-36 overflow-y-auto space-y-2 leading-relaxed">
                <p>1. Uploading original textbook/slide content is prohibited.</p>
                <p>2. Users are responsible for their content. Reported content may be removed.</p>
                <p>3. Sharing external messenger IDs is restricted.</p>
                <p>4. Activity logs are collected for service improvement.</p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-2 -m-2 rounded-lg active:bg-gray-50">
                <input type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} className="w-5 h-5 rounded" />
                <span className="text-sm text-gray-700 font-medium">I agree to the terms above</span>
              </label>
              <button onClick={handleOnboarding} disabled={!termsAgreed || loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-all">
                {loading ? "Processing..." : "Complete Setup"}
              </button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center py-2">
                <div className="text-3xl mb-2">\uD83C\uDF89</div>
                <p className="text-sm text-gray-600">Welcome aboard! Join a pilot group to compete with other schools.</p>
              </div>
              <input type="text" placeholder="GROUP INVITE CODE" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center tracking-[0.3em] font-mono text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
              <button onClick={handleGroupJoin} disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white py-3.5 rounded-xl font-bold text-sm disabled:opacity-50 active:scale-[0.98] transition-all">
                {loading ? "Processing..." : inviteCode ? "Join Group" : "Skip for now"}
              </button>
            </>
          )}

          {error && <p className="text-red-500 text-xs bg-red-50 rounded-lg px-3 py-2 text-center">{error}</p>}
        </div>

        {step === 3 && <p className="text-center text-[11px] text-gray-300">Try: CAMPUS2026</p>}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return <Suspense><OnboardingForm /></Suspense>;
}
