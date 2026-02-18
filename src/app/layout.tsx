import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampUs - 수업 기반 글로벌 학습 커뮤니티",
  description: "시간표 기반으로 수업 중엔 라이브 노트, 수업 후엔 요약+Q&A로 남는 글로벌 학습 커뮤니티",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-gray-50 text-gray-900" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
