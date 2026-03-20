import { Menu } from "lucide-react";

interface SidebarToggleProps {
  onToggle: () => void;
}

export default function SidebarToggle({ onToggle }: SidebarToggleProps) {
  return (
    <button type="button" onClick={onToggle} className="text-gray-400 hover:text-white transition-colors">
      <Menu size={20} />
    </button>
  );
}
