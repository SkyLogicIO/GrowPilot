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
      <header className="h-16 border-b border-accent/[0.08] bg-[#030710]/90 backdrop-blur-xl sticky top-0 z-20 px-4 md:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <SidebarToggle onToggle={onToggleSidebar} />
        </div>

        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          {/* 宽屏：未登录 CTA + 运营按钮 */}
          <div className="hidden xl:flex items-center gap-3">
            <GuestCTAs onOpenLogin={onOpenLogin} />
            <InviteRewardButton onClick={() => setShowInviteModal(true)} />
            <CoinsVipButton />
          </div>
          {/* 中屏：搜索框 */}
          <HeaderSearch />
          {/* 中屏以上：语言切换 */}
          <LanguageMenu />
          <NotificationButton />
          <UserMenu onOpenCreateTeam={onOpenCreateTeam} />
        </div>
      </header>

      <InviteRewardModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} />
    </>
  );
}
