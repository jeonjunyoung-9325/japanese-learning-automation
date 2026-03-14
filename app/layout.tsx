import type { Metadata } from "next";
import "@/app/globals.css";
import { AppProvider } from "@/components/auth/app-provider";

export const metadata: Metadata = {
  title: "Kotoba Mate",
  description: "한국인 학습자를 위한 모바일 중심 일본어 회화 연습 앱",
  applicationName: "Kotoba Mate",
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  appleWebApp: {
    capable: true,
    title: "Kotoba Mate",
    startupImage: [
      {
        url: "/pwa/startup-image?width=1179&height=2556",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/pwa/startup-image?width=1290&height=2796",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/pwa/startup-image?width=1170&height=2532",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/pwa/startup-image?width=1242&height=2688",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
    ],
    statusBarStyle: "black-translucent",
  },
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
