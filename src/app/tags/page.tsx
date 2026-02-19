"use client";

import { useState, useEffect } from "react";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";

const DEMO_TAGS = ["Big-O", "시간복잡도", "정렬", "Stack", "Queue", "BST", "트리", "UX", "페르소나", "Figma", "디자인", "금리", "환율", "거시경제", "DP"];
const DEMO_TAG_QUESTIONS: Record<string, { id: string; title: string; status: string; author: { nickname: string }; _count: { answers: number } }[]> = {
  "Big-O": [{ id: "q1", title: "Big-O에서 상수를 무시하는 이유가 뭔가요?", status: "solved", author: { nickname: "Alex" }, _count: { answers: 3 } }],
  "정렬": [{ id: "q2", title: "Merge Sort와 Quick Sort 중 어떤 걸 써야 하나요?", status: "solved", author: { nickname: "지우" }, _count: { answers: 2 } }],
  "Stack": [{ id: "q3", title: "Stack으로 괄호 매칭하는 코드 예시 있나요?", status: "open", author: { nickname: "Sophia" }, _count: { answers: 2 } }],
  "BST": [{ id: "q4", title: "BST에서 노드 삭제할 때 3가지 경우가 헷갈려요", status: "open", author: { nickname: "현우" }, _count: { answers: 1 } }],
  "UX": [{ id: "q5", title: "UX 포트폴리오에 꼭 들어가야 할 요소가 뭔가요?", status: "open", author: { nickname: "지우" }, _count: { answers: 2 } }],
  "금리": [{ id: "q6", title: "한미 금리 차이가 환율에 미치는 영향?", status: "solved", author: { nickname: "도현" }, _count: { answers: 2 } }],
};

function TagsContent() {
  const { user } = useUser();
  const [tags, setTags] = useState<string[]>(DEMO_TAGS);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagData, setTagData] = useState<{ summaries: unknown[]; questions: { id: string; title: string; status: string; author: { nickname: string }; _count: { answers: number } }[] } | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; status: string }[]>([]);

  useEffect(() => {
    fetch("/api/tags").then((r) => r.json()).then((d) => { if (d.tags?.length > 0) setTags(d.tags); }).catch(() => {});
  }, []);

  async function loadTag(tag: string) {
    setSelectedTag(tag);
    try {
      const data = await fetch(`/api/tags?tag=${encodeURIComponent(tag)}`).then((r) => r.json());
      if (data.questions?.length > 0 || data.summaries?.length > 0) { setTagData(data); return; }
    } catch {}
    setTagData({ summaries: [], questions: DEMO_TAG_QUESTIONS[tag] || [] });
  }

  async function handleSearch() {
    if (!search.trim()) return;
    try {
      const data = await fetch(`/api/tags?q=${encodeURIComponent(search)}`).then((r) => r.json());
      if (data.questions?.length > 0) { setSearchResults(data.questions); return; }
    } catch {}
    const results = Object.values(DEMO_TAG_QUESTIONS).flat().filter((q) => q.title.toLowerCase().includes(search.toLowerCase()));
    setSearchResults(results);
  }

  const tagGradients = ["from-indigo-500 to-blue-500", "from-purple-500 to-pink-500", "from-emerald-500 to-teal-500", "from-amber-500 to-orange-500", "from-rose-500 to-red-500"];

  return (
    <div className="min-h-screen bg-mesh has-bottom-nav">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-sm">🏷️</span>
          Tag Hub
        </h1>

        <div className="flex gap-2">
          <input type="text" placeholder="키워드/태그 검색..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 glass rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none transition border-0" />
          <button onClick={handleSearch} className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-5 py-3 rounded-2xl text-xs font-bold btn-3d whitespace-nowrap shadow-md shadow-indigo-200/30">검색</button>
        </div>

        {searchResults.length > 0 && (
          <div className="card-3d p-4 space-y-2 animate-slide-up">
            <h3 className="text-xs font-bold text-slate-500">검색 결과</h3>
            {searchResults.map((q) => (
              <div key={q.id} className="p-3 glass rounded-2xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all">
                <span className={`text-[10px] px-2 py-0.5 rounded-lg mr-2 font-bold ${q.status === "solved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {q.status === "solved" ? "해결" : "미해결"}
                </span>
                <span className="text-sm font-medium text-slate-700">{q.title}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 stagger-children">
          {tags.map((tag, i) => (
            <button key={tag} onClick={() => loadTag(tag)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${selectedTag === tag
                ? `bg-gradient-to-r ${tagGradients[i % tagGradients.length]} text-white shadow-md`
                : "card-3d text-slate-600"}`}>
              #{tag}
            </button>
          ))}
        </div>

        {selectedTag && tagData && (
          <div className="space-y-3 animate-slide-up">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1 rounded-lg text-xs font-bold shadow-sm">#{selectedTag}</span>
            </h2>
            {tagData.questions.length > 0 && (
              <div className="space-y-2 stagger-children">
                <h3 className="text-xs font-bold text-slate-500">관련 질문</h3>
                {tagData.questions.map((q) => (
                  <div key={q.id} className="card-3d p-4 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-lg font-bold ${q.status === "solved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {q.status === "solved" ? "해결" : "미해결"}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800">{q.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="font-medium">{q.author.nickname}</span><span>💬 {q._count.answers}개 답변</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tagData.questions.length === 0 && (
              <div className="text-center py-8 card-3d" style={{ borderStyle: "dashed" }}>
                <p className="text-slate-400 text-sm">이 태그의 질문이 아직 없어요</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TagsPage() { return <AuthGuard><TagsContent /></AuthGuard>; }
