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
    <div className="min-h-screen bg-gray-50">
      <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">태그 허브</h1>

        <div className="flex gap-2">
          <input type="text" placeholder="키워드/태그 검색..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="flex-1 border rounded-lg px-4 py-3" />
          <button onClick={handleSearch} className="bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-medium">검색</button>
        </div>

        {searchResults.length > 0 && (
          <div className="bg-white rounded-xl shadow p-4 space-y-2">
            <h3 className="font-semibold text-sm text-gray-500">검색 결과</h3>
            {searchResults.map((q) => (
              <div key={q.id} className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${q.status === "solved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {q.status === "solved" ? "해결" : "미해결"}
                </span>
                {q.title}
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button key={tag} onClick={() => loadTag(tag)} className={`px-4 py-2 rounded-full text-sm font-medium transition ${selectedTag === tag ? "bg-blue-600 text-white" : "bg-white border hover:bg-blue-50"}`}>
              {tag}
            </button>
          ))}
          {tags.length === 0 && <p className="text-gray-400">아직 태그가 없습니다</p>}
        </div>

        {selectedTag && tagData && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">#{selectedTag}</h2>

            {tagData.questions.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-500">관련 질문</h3>
                {tagData.questions.map((q) => (
                  <div key={q.id} className="bg-white rounded-xl shadow p-4 cursor-pointer hover:shadow-md">
                    <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${q.status === "solved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {q.status === "solved" ? "해결" : "미해결"}
                    </span>
                    <span className="font-medium">{q.title}</span>
                    <span className="text-xs text-gray-400 ml-2">{q._count.answers}개 답변</span>
                  </div>
                ))}
              </div>
            )}

            {tagData.summaries.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-gray-500">관련 요약 ({tagData.summaries.length}개)</h3>
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
