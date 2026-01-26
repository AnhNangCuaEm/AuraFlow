import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Aura Flow",
  description: "A music player with morden UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={notoSansJP.className}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
