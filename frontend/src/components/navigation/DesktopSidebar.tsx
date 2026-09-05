"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Sparkles, Map, Clock, Settings,
  Users, ClipboardList, AlertTriangle, TrendingUp,
  ChevronLeft, ChevronRight, LogOut, Flame
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/sidebar";
import { Avatar, ProgressBar, Tooltip } from "@/components/primitives";
import { STUDENT_NAV_SECTIONS, TEACHER_NAV_SECTIONS, PARENT_NAV_SECTIONS } from "@/mock-data";
import { useSession, signOut } from "next-auth/react";
import type { NavItem } from "@/types";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Sparkles, Map, Clock, Settings,
  Users, ClipboardList, AlertTriangle, TrendingUp,
};

function NavIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] ?? LayoutDashboard;
  return <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.75} />;
}

function SidebarNavItem({ item, isCollapsed }: { item: NavItem; isCollapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));

  const content = (
    <Link
      href={item.href}
      title={isCollapsed ? item.label : undefined}
      className={cn(
        "sidebar-nav-item relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
        isActive
          ? "active bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] dark:bg-purple-500/15 dark:text-purple-400 font-semibold"
          : "text-[hsl(var(--muted-foreground))] dark:text-zinc-300 hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))] dark:hover:text-white dark:hover:bg-white/5",
        isCollapsed && "justify-center px-0"
      )}
    >
      <span className={cn("sidebar-nav-icon relative z-10 transition-colors", isActive ? "text-[hsl(var(--primary))] dark:text-purple-400" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white")}>
        <NavIcon name={item.icon} />
      </span>
      {!isCollapsed && <span className="sidebar-nav-label relative z-10 truncate">{item.label}</span>}
      {item.badge && !isCollapsed && (
        <span className="ml-auto relative z-10 text-xs bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] dark:bg-purple-900/40 dark:text-purple-300 px-1.5 py-0.5 rounded-full font-medium">
          {item.badge}
        </span>
      )}
    </Link>
  );

  return content;
}

export function DesktopSidebar() {
  const { isCollapsed, toggleCollapse } = useSidebar();
  const { data: session } = useSession();
  const userName = session?.user?.name || "Student";
  const userGrade = (session?.user as any)?.grade || "";
  const levelProgress = 0; // Will be updated once profile is fetched

  const navSections = React.useMemo(() => {
    const role = (session?.user as any)?.role;
    if (role === "TEACHER") return TEACHER_NAV_SECTIONS;
    if (role === "PARENT") return PARENT_NAV_SECTIONS;
    return STUDENT_NAV_SECTIONS;
  }, [session]);

  return (
    <aside id="app-desktop-sidebar" className={cn("hidden md:flex flex-col h-screen bg-[hsl(var(--surface))] dark:bg-[#171821] border-r border-[hsl(var(--border))] dark:border-white/10 relative z-20 flex-shrink-0 transition-all duration-300", isCollapsed ? "w-[72px]" : "w-[240px]")}>
      {/* Logo */}
      <div className={cn("flex items-center h-[var(--header-height)] flex-shrink-0", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0" title={isCollapsed ? "ScaffoldAI" : undefined}>
          <div className="w-8 h-8 bg-[hsl(var(--primary))] rounded-md flex items-center justify-center shrink-0">
             <span className="text-white font-bold text-sm">S</span>
          </div>
          {!isCollapsed && <span className="font-bold text-[15px] tracking-tight text-[hsl(var(--foreground))] dark:text-white overflow-hidden whitespace-nowrap">
            ScaffoldAI
          </span>}
        </Link>
        {!isCollapsed && (
          <button onClick={toggleCollapse} className="p-1 rounded-md hover:bg-[hsl(var(--surface-2))] dark:hover:bg-white/5 text-[hsl(var(--muted-foreground))] dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors">
            <ChevronLeft size={18} />
          </button>
        )}
      </div>
      
      {isCollapsed && (
        <div className="flex justify-center mb-2">
          <button onClick={toggleCollapse} className="p-1.5 rounded-md hover:bg-[hsl(var(--surface-2))] dark:hover:bg-white/5 text-[hsl(var(--muted-foreground))] dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors border border-[hsl(var(--border))] dark:border-white/10">
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {navSections.map((section) => (
          <div key={section.id} className="space-y-0.5">
            {section.label && !isCollapsed && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground)/0.6)] dark:text-zinc-400 px-3 py-2">
                {section.label}
              </p>
            )}
            {section.label && isCollapsed && (
              <div className="h-px w-8 mx-auto bg-[hsl(var(--border))] dark:bg-white/10 my-2" />
            )}
            {section.items.map((item) => (
              <SidebarNavItem key={item.id} item={item} isCollapsed={isCollapsed} />
            ))}
          </div>
        ))}
      </nav>

      {/* User card */}
      <div className="px-3 py-3 border-t border-[hsl(var(--border))] dark:border-white/10 flex-shrink-0">
        <div className={cn("sidebar-user-card rounded-[var(--radius-md)] bg-[hsl(var(--surface-2))] dark:bg-[#1e202b] dark:border dark:border-white/10 p-3 space-y-2.5", isCollapsed && "flex flex-col items-center p-2")}>
          <div className={cn("flex items-center gap-2.5 min-w-0", isCollapsed && "justify-center")}>
            <Avatar name={userName} size="sm" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="sidebar-user-name text-sm font-semibold truncate leading-tight text-zinc-900 dark:text-zinc-100">{userName}</p>
                <p className="sidebar-user-email text-[11px] text-[hsl(var(--muted-foreground))] dark:text-zinc-400 truncate">{session?.user?.email || ""}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="sidebar-brand-label text-[10px] text-[hsl(var(--muted-foreground))] dark:text-zinc-400">ScaffoldAI</span>
              </div>
            </div>
          )}
          <div className="flex justify-center mt-2">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              title={isCollapsed ? "Log out" : undefined}
              className={cn("sidebar-logout-btn p-2 w-full flex items-center justify-center gap-2 text-[hsl(var(--muted-foreground))] dark:text-zinc-300 hover:bg-[hsl(var(--destructive)/0.1)] hover:text-[hsl(var(--destructive))] dark:hover:text-red-400 dark:hover:bg-red-950/40 rounded-[var(--radius-sm)] transition-colors text-xs font-semibold", isCollapsed && "px-0")}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Log out</span>}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
