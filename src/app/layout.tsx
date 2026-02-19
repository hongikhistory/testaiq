import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "knot a note - 당신의 노트를 세계로 잇다",
  description: "실시간 노트 공유, AI 요약, Q&A 아카이브로 전 세계 캠퍼스를 연결합니다",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Noto+Sans+KR:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body
        className="antialiased bg-mesh text-slate-800"
        style={{ fontFamily: '"Inter", "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
