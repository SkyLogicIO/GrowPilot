import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const rubik = localFont({
  src: "../public/fonts/RubikVariable.ttf",
  weight: "400 900",
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "GrowPilot MVP",
  description: "Build Growth Once, Scale Everywhere",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={rubik.variable}>
      <body>{children}</body>
    </html>
  );
}
