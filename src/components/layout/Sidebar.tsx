"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Bot, 
  Trophy, 
  Zap, 
  Megaphone, 
  Bell, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/utils/cn";
import { SatpadLogo } from "@/components/common/Logo";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      "border-r border-border bg-surface-base flex-col hidden lg:flex h-full sticky top-0 transition-all duration-300 relative z-50",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn(
        "p-4 h-16 flex items-center mb-4",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <Link href="/" className="text-xl font-bold text-white flex items-center gap-2">
            <SatpadLogo size={32} className="-rotate-12" />
            <span className="truncate italic tracking-wider">SATPAD</span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/" className="flex items-center justify-center shrink-0">
            <SatpadLogo size={32} className="-rotate-12" />
          </Link>
        )}
        
        {/* Toggle Button */}
        {!isCollapsed && (
          <button 
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg text-content-tertiary hover:bg-surface-elevated hover:text-content-primary transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
        <nav className="px-3 space-y-2 pb-4 flex-1">
          {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                isActive 
                  ? "bg-surface-highlight text-accent-primary" 
                  : "text-content-secondary hover:bg-surface-elevated hover:text-content-primary",
                isCollapsed && "justify-center px-0"
              )}
            >
              <Icon className={cn(
                "w-5 h-5 shrink-0",
                isActive ? "text-accent-primary" : "text-content-tertiary group-hover:text-content-primary"
              )} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
        </nav>

        {/* Expand Button (when collapsed) */}
        {isCollapsed && (
          <div className="p-3 mt-auto">
            <button 
              onClick={() => setIsCollapsed(false)}
              className="w-full flex justify-center p-2 rounded-lg text-content-tertiary hover:bg-surface-elevated hover:text-content-primary transition-colors"
              title="Expand Sidebar"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
