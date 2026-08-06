import { Search, Loader2 } from "lucide-react";
import { Input } from "./ui/input";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  isSearching?: boolean;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  value,
  onChange,
  isSearching = false,
  placeholder = "Search...",
  className = "",
}: SearchBarProps) {
  return (
    <div className={`relative ${className}`}>
      {isSearching ? (
        <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5 animate-spin" aria-hidden="true" />
      ) : (
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" aria-hidden="true" />
      )}
      <Input
        type="search"
        aria-label="Search articles"
        placeholder={placeholder}
        className="pl-10 h-12 bg-card border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
