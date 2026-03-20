import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
