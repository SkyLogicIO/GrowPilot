import { Search } from "lucide-react";

export default function HeaderSearch() {
  return (
    <div className="relative hidden md:block">
      <Search className="absolute left-3 top-2.5 text-text-muted" size={16} />
      <input
        type="text"
        placeholder="搜索..."
        className="w-56 pl-10 pr-4 py-2 bg-surface-hover border-2 border-border rounded-full text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-all"
      />
    </div>
  );
}
