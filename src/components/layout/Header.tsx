import Link from "next/link";
import { Search, Wallet } from "lucide-react";
import { cn } from "@/utils/cn";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface-base/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-accent-primary flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white text-sm">
              S
            </span>
            SATPAD
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-content-primary font-medium hover:text-accent-primary transition-colors">
              Explore
            </Link>
            <Link href="/create" className="text-content-secondary font-medium hover:text-accent-primary transition-colors">
              Create
            </Link>
            <Link href="/portfolio" className="text-content-secondary font-medium hover:text-accent-primary transition-colors">
              Portfolio
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center relative">
            <Search className="w-4 h-4 absolute left-3 text-content-tertiary" />
            <input 
              type="text" 
              placeholder="Search tokens..." 
              className="pl-9 pr-4 py-2 bg-surface rounded-input border border-border focus:outline-none focus:border-accent-primary text-sm w-64 transition-colors text-content-primary placeholder:text-content-tertiary"
            />
          </div>
          
          <button className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-pill font-medium text-sm transition-all",
            "bg-surface-highlight text-content-primary hover:bg-surface-elevated border border-border"
          )}>
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        </div>
      </div>
    </header>
  );
}
