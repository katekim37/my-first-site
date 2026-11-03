import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.loveaffair.cloud"),
  title: "방가워요 소피아입니다 | 마이 퍼스트 사이트",
  description: "나의 첫 번째 웹사이트 프로젝트. HTML, CSS, JavaScript로 구현된 모던 인터랙티브 웹 애플리케이션입니다.",
  openGraph: {
    title: "방가워요 소피아입니다 | 마이 퍼스트 사이트",
    description: "나의 첫 번째 웹사이트 프로젝트. HTML, CSS, JavaScript로 구현된 모던 인터랙티브 웹 애플리케이션입니다.",
    url: "https://www.loveaffair.cloud",
    siteName: "방가워요 소피아입니다 | 마이 퍼스트 사이트",
    images: [
      {
        url: "/hero_showcase.jpg",
        width: 1200,
        height: 630,
        alt: "방가워요 소피아입니다 | 마이 퍼스트 사이트",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "방가워요 소피아입니다 | 마이 퍼스트 사이트",
    description: "나의 첫 번째 웹사이트 프로젝트. HTML, CSS, JavaScript로 구현된 모던 인터랙티브 웹 애플리케이션입니다.",
    images: ["/hero_showcase.jpg"],
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚀</text></svg>",
  },
  verification: {
    google: "uwae2rQ18lTmAB_f4M8Y6q6CyDZ1ZHinI1dot0nllAw",
    other: {
      "naver-site-verification": "f19d0dd31448d760f18a8a79dc161f9145081ca7",
    },
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
