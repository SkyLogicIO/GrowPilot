"use client";

import { useState } from "react";
import CoinsVipButton from "./CoinsVipButton";
import GuestCTAs from "./GuestCTAs";
import HeaderSearch from "./HeaderSearch";
import InviteRewardButton from "./InviteRewardButton";
import InviteRewardModal from "./InviteRewardModal";
import LanguageMenu from "./LanguageMenu";
import NotificationButton from "./NotificationButton";
import SidebarToggle from "./SidebarToggle";
import UserMenu from "./UserMenu";

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenCreateTeam: () => void;
  onOpenLogin?: () => void;
}

export default function Header({ onToggleSidebar, onOpenCreateTeam, onOpenLogin }: HeaderProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-accent/[0.08] bg-[#030710]/90 backdrop-blur-xl sticky top-0 z-20 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarToggle onToggle={onToggleSidebar} />
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-3">
            <GuestCTAs onOpenLogin={onOpenLogin} />
            <InviteRewardButton onClick={() => setShowInviteModal(true)} />
            <CoinsVipButton />
          </div>
          <HeaderSearch />
          <LanguageMenu />
          <NotificationButton />
          <UserMenu onOpenCreateTeam={onOpenCreateTeam} />
        </div>
      </header>

      <InviteRewardModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </>
  );
}
