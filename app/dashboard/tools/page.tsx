import { Suspense } from "react";
import ToolsPageClient from "./ToolsPageClient";

export default function Page() {
  return (
    <Suspense>
      <ToolsPageClient />
    </Suspense>
  );
}
