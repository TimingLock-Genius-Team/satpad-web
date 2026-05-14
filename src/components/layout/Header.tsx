"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, HelpCircle, Moon, Menu, X } from "lucide-react";
import { cn } from "@/utils/cn";

const NAV_ITEMS = [
  { href: "/", label: "Explore" },
  { href: "/create", label: "Create" },
  { href: "/portfolio", label: "Portfolio" },
];

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface-base/80 backdrop-blur-md">
      <div className="w-full max-w-[1440px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className="text-2xl font-bold tracking-tighter flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="text-accent-primary italic drop-shadow-[0_0_8px_rgba(0,255,136,0.5)]">e</span>
            <span className="text-content-primary">ulr</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "font-medium transition-colors",
                    isActive
                      ? "text-accent-primary"
                      : "text-content-secondary hover:text-accent-primary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex items-center gap-2">
            <button className="p-2 text-content-secondary hover:text-content-primary hover:bg-surface-elevated rounded-full transition-colors">
              <HelpCircle className="w-5 h-5" />
            </button>
            <button className="p-2 text-content-secondary hover:text-content-primary hover:bg-surface-elevated rounded-full transition-colors">
              <Moon className="w-5 h-5" />
            </button>
          </div>
          
          <button className={cn(
            "flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 rounded-pill font-medium text-sm transition-all",
            "bg-surface-highlight hover:bg-surface-elevated border border-border"
          )}>
            <div className="hidden md:flex items-center gap-2 pr-3 border-r border-border/60">
              <span className="w-2 h-2 rounded-full bg-accent-primary shadow-[0_0_8px_rgba(0,255,136,0.6)]"></span>
              <span className="text-content-primary">12.45 OKB</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 md:pl-1">
              <span className="text-content-secondary font-mono text-xs md:text-sm">0x4c...8a23</span>
              <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-content-secondary" />
            </div>
          </button>

          <button 
            className="md:hidden p-2 -mr-2 text-content-secondary hover:text-content-primary hover:bg-surface-elevated rounded-full transition-colors"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-surface-base border-b border-border shadow-lg">
          <nav className="flex flex-col p-4 gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "block px-4 py-3 rounded-lg font-medium transition-colors",
                    isActive
                      ? "bg-accent-primary/10 text-accent-primary"
                      : "text-content-secondary hover:bg-surface-elevated hover:text-content-primary"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="flex items-center gap-6 px-4 pt-4 border-t border-border mt-2">
              <button className="flex items-center gap-2 text-content-secondary hover:text-content-primary transition-colors">
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">Help</span>
              </button>
              <button className="flex items-center gap-2 text-content-secondary hover:text-content-primary transition-colors">
                <Moon className="w-5 h-5" />
                <span className="font-medium">Theme</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
