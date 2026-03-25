import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
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
