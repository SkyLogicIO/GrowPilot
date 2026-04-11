import type { Metadata } from "next";
import SellingPointPageClient from "./SellingPointPageClient";

export const metadata: Metadata = {
  title: "卖点图设计 | GrowPilot",
  description: "AI 驱动的电商卖点图设计工具",
};

export default function SellingPointPage() {
  return <SellingPointPageClient />;
}
