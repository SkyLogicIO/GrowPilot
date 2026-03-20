"use client";

import { useState } from "react";
import Header from "@/components/header/Header";
import CreateTeamModal from "@/components/shell/CreateTeamModal";
import DashboardSidebar from "@/components/shell/DashboardSidebar";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0D10] text-white flex">
      <DashboardSidebar isOpen={isSidebarOpen} />

      <main className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        <Header
          onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
          onOpenCreateTeam={() => setIsCreateTeamOpen(true)}
        />

        <div className="flex-1 p-8 overflow-y-auto">{children}</div>
      </main>

      <CreateTeamModal isOpen={isCreateTeamOpen} onClose={() => setIsCreateTeamOpen(false)} />
    </div>
  );
}
