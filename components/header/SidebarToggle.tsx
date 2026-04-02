import { Menu } from "lucide-react";

interface SidebarToggleProps {
  onToggle: () => void;
}

export default function SidebarToggle({ onToggle }: SidebarToggleProps) {
  return (
    <button type="button" onClick={onToggle} className="text-text-secondary hover:text-text-primary transition-colors">
      <Menu size={20} />
    </button>
  );
}
