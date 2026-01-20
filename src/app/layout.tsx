import type { Metadata } from "next";
import "./globals.css";
import { LoadingProvider } from '@/components/ui/LoadingSpinner';
import { ServiceWorkerProvider } from '@/components/ServiceWorkerProvider';

export const metadata: Metadata = {
  title: "만세력 노트",
  description: "사주팔자와 대운을 계산하고 관리하는 개인용 도구",
  manifest: "/manifest.json",
  icons: {
    icon: "/yinyang.png",
    apple: "/yinyang.png",
  },
  authors: [{ name: "류동윤" }],
  creator: "류동윤",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
};

export const viewport = {
  themeColor: "#020817",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover' as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className="antialiased font-serif"
        style={{ fontFamily: "'Noto Serif SC', serif" }}
      >
        <ServiceWorkerProvider>
          <LoadingProvider>
            {children}
          </LoadingProvider>
        </ServiceWorkerProvider>
      </body>
    </html>
  );
}
