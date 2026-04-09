import { Bell } from "lucide-react";

export default function NotificationButton() {
  return (
    <button type="button" className="text-text-secondary hover:text-text-primary transition-colors relative">
      <Bell size={20} />
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
    </button>
  );
}
