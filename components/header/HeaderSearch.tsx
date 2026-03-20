import { Search } from "lucide-react";

export default function HeaderSearch() {
  return (
    <div className="relative hidden md:block">
      <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
      <input
        type="text"
        placeholder="搜索..."
        className="w-56 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
      />
    </div>
  );
}
