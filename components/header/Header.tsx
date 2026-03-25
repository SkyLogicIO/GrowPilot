"use client";

import CoinsVipButton from "./CoinsVipButton";
import HeaderSearch from "./HeaderSearch";
import InviteRewardButton from "./InviteRewardButton";
import LanguageMenu from "./LanguageMenu";
import NotificationButton from "./NotificationButton";
import SidebarToggle from "./SidebarToggle";
import UserMenu from "./UserMenu";

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenCreateTeam: () => void;
}

export default function Header({ onToggleSidebar, onOpenCreateTeam }: HeaderProps) {
  return (
    <header className="h-16 border-b-2 border-border bg-surface sticky top-0 z-20 px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarToggle onToggle={onToggleSidebar} />
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-3">
          <InviteRewardButton />
          <CoinsVipButton />
        </div>
        <HeaderSearch />
        <LanguageMenu />
        <NotificationButton />
        <UserMenu onOpenCreateTeam={onOpenCreateTeam} />
      </div>
    </header>
  );
}
