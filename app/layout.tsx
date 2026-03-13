import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Japanese Learning Automation",
  description: "Daily Japanese lesson generator with Notion sync and quest tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
