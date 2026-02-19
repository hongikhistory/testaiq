"use client";

import { useState, useEffect } from "react";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";

function TagsContent() {
  const { user } = useUser();
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagData, setTagData] = useState<{ summaries: unknown[]; questions: { id: string; title: string; status: string; author: { nickname: string }; _count: { answers: number } }[] } | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; status: string }[]>([]);

  useEffect(() => {
    fetch("/api/tags").then((r) => r.json()).then((d) => setTags(d.tags || []));
  }, []);

  async function loadTag(tag: string) {
    setSelectedTag(tag);
    const data = await fetch(`/api/tags?tag=${encodeURIComponent(tag)}`).then((r) => r.json());
    setTagData(data);
  }

  async function handleSearch() {
    if (!search.trim()) return;
    const data = await fetch(`/api/tags?q=${encodeURIComponent(search)}`).then((r) => r.json());
    setSearchResults(data.questions || []);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50/50 to-white has-bottom-nav">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">
        <h1 className="text-lg font-bold">태그 허브</h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="키워드/태그 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-violet-400 focus:border-transparent focus:outline-none transition"
          />
          <button onClick={handleSearch}
            className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-5 py-3 rounded-2xl text-xs font-bold active:scale-[0.98] transition-all whitespace-nowrap">
            검색
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 space-y-2">
            <h3 className="text-xs font-bold text-gray-500">검색 결과</h3>
            {searchResults.map((q) => (
              <div key={q.id} className="p-3 border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all">
                <span className={`text-[10px] px-2 py-0.5 rounded-full mr-2 font-bold ${q.status === "solved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {q.status === "solved" ? "해결" : "미해결"}
                </span>
                <span className="text-sm">{q.title}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button key={tag} onClick={() => loadTag(tag)}
              className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all active:scale-95 ${selectedTag === tag ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-sm shadow-violet-200" : "bg-white border border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600"}`}>
              #{tag}
            </button>
          ))}
          {tags.length === 0 && (
            <div className="w-full text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="text-3xl mb-2">🏷️</div>
              <p className="text-gray-400 text-sm">아직 태그가 없어요</p>
            </div>
          )}
        </div>

        {selectedTag && tagData && (
          <div className="space-y-3">
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">#{selectedTag}</span>
            </h2>
            {tagData.questions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500">관련 질문</h3>
                {tagData.questions.map((q) => (
                  <div key={q.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 cursor-pointer card-hover">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${q.status === "solved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {q.status === "solved" ? "해결" : "미해결"}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm">{q.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <span>{q.author.nickname}</span>
                      <span>💬 {q._count.answers}개 답변</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tagData.summaries.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-500">관련 요약 ({tagData.summaries.length}개)</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TagsPage() {
  return <AuthGuard><TagsContent /></AuthGuard>;
}
