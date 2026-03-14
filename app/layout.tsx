import type { Metadata } from "next";
import "@/app/globals.css";
import { AppProvider } from "@/components/auth/app-provider";

export const metadata: Metadata = {
  title: "코토바 스피크",
  description: "한국인 학습자를 위한 모바일 중심 일본어 회화 연습 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-stone-950 text-stone-50 antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
