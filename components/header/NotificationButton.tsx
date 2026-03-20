import { Bell } from "lucide-react";

export default function NotificationButton() {
  return (
    <button type="button" className="text-gray-400 hover:text-white transition-colors relative">
      <Bell size={20} />
      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
    </button>
  );
}
