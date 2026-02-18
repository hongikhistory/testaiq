"use client";

import { useState, useEffect } from "react";
import AuthGuard, { useUser } from "@/components/AuthGuard";
import NavBar from "@/components/NavBar";

interface ReportItem {
  id: string; targetType: string; targetId: string; reason: string; status: string; createdAt: string;
  reporter: { id: string; nickname: string; email: string };
}

function AdminContent() {
  const { user } = useUser();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/reports").then((r) => r.json()).then((d) => {
      setReports(d.reports || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function handleAction(reportId: string, action: string) {
    await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, action }),
    });
    setReports(reports.map((r) => r.id === reportId ? { ...r, status: "closed" } : r));
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar nickname={user?.nickname || ""} points={user?.points || 0} />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">관리자 권한이 필요합니다</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar nickname={user.nickname || ""} points={user.points} />
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-2xl font-bold">운영 관리</h1>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">신고 접수 ({reports.filter((r) => r.status === "open").length}건 미처리)</h2>
          {loading && <p className="text-gray-400">로딩 중...</p>}
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className={`border rounded-lg p-4 ${report.status === "open" ? "border-red-200 bg-red-50" : "border-gray-200"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${report.status === "open" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                      {report.status === "open" ? "미처리" : "처리완료"}
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{report.targetType}</span>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleString("ko-KR")}</span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{report.reason}</p>
                <div className="text-xs text-gray-400 mb-3">신고자: {report.reporter.nickname} ({report.reporter.email})</div>
                {report.status === "open" && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(report.id, "hide")} className="text-xs bg-orange-500 text-white px-3 py-1 rounded-lg">콘텐츠 숨김</button>
                    <button onClick={() => handleAction(report.id, "close")} className="text-xs bg-gray-500 text-white px-3 py-1 rounded-lg">닫기</button>
                    <button onClick={() => handleAction(report.id, "block_user")} className="text-xs bg-red-600 text-white px-3 py-1 rounded-lg">사용자 차단</button>
                  </div>
                )}
              </div>
            ))}
            {reports.length === 0 && <p className="text-gray-400 text-center py-4">신고 내역이 없습니다</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return <AuthGuard><AdminContent /></AuthGuard>;
}
