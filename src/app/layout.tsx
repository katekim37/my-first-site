import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "안녕하세요 소피아입니다 | 마이 퍼스트 사이트",
  description: "나의 첫 번째 웹사이트 프로젝트. HTML, CSS, JavaScript로 구현된 모던 인터랙티브 웹 애플리케이션입니다.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Noto+Sans+KR:wght@400;500;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body data-theme="soft">{children}</body>
    </html>
  );
}
