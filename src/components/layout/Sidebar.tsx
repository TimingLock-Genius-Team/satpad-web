"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Bot, 
  Trophy, 
  Zap, 
  Megaphone, 
  Bell, 
  MoreHorizontal 
} from "lucide-react";
import { cn } from "@/utils/cn";

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Agentic", href: "/agentic", icon: Bot },
  { name: "Ranking", href: "/ranking", icon: Trophy },
  { name: "Advanced", href: "/advanced", icon: Zap },
  { name: "Campaign", href: "/campaign", icon: Megaphone },
  { name: "Announcement", href: "/announcement", icon: Bell },
  { name: "More", href: "/more", icon: MoreHorizontal },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-surface-base flex-col hidden lg:flex h-full sticky top-0 overflow-y-auto">
      <div className="p-4 h-16 flex items-center mb-4">
        <Link href="/" className="text-xl font-bold text-accent-primary flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white text-sm">
            S
          </span>
          SATPAD
        </Link>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                isActive 
                  ? "bg-surface-highlight text-accent-primary" 
                  : "text-content-secondary hover:bg-surface-elevated hover:text-content-primary"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive ? "text-accent-primary" : "text-content-tertiary group-hover:text-content-primary"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      {/* Optional: Add user profile or settings at the bottom */}
      <div className="p-4 border-t border-border mt-auto">
        <div className="text-xs text-content-tertiary text-center">
          © 2026 SATPAD
        </div>
      </div>
    </aside>
  );
}
