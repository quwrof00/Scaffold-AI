"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Sparkles, Map, Clock, Settings, X, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/lib/sidebar";
import { Avatar, ProgressBar } from "@/components/primitives";
import { STUDENT_NAV_SECTIONS, TEACHER_NAV_SECTIONS, PARENT_NAV_SECTIONS } from "@/mock-data";
import { useSession } from "next-auth/react";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, Sparkles, Map, Clock, Settings,
};

function MobileNavIcon({ name }: { name: string }) {
  const Icon = ICON_MAP[name] ?? LayoutDashboard;
  return <Icon className="h-5 w-5" strokeWidth={1.75} />;
}

// Bottom tab bar — shows top 4 nav items
export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const navSections = React.useMemo(() => {
    const role = (session?.user as any)?.role;
    if (role === "TEACHER") return TEACHER_NAV_SECTIONS;
    if (role === "PARENT") return PARENT_NAV_SECTIONS;
    return STUDENT_NAV_SECTIONS;
  }, [session]);
  const mainItems = navSections[0]?.items.slice(0, 4) ?? [];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[hsl(var(--surface))/0.9] backdrop-blur-xl border-t border-[hsl(var(--border))] pb-safe">
      <div className="flex items-center h-16 px-2">
        {mainItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-colors",
                isActive
                  ? "text-[hsl(var(--primary))]"
                  : "text-[hsl(var(--muted-foreground))] dark:text-zinc-300"
              )}
            >
              <div className="relative">
                {isActive && (
                  <motion.div
                    layoutId="mobile-active"
                    className="absolute -inset-1.5 rounded-xl bg-[hsl(var(--primary)/0.1)]"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.35 }}
                  />
                )}
                <span className="relative z-10">
                  <MobileNavIcon name={item.icon} />
                </span>
              </div>
              <span className={cn("text-[10px] font-medium", isActive && "text-[hsl(var(--primary))]")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// Full-screen drawer for mobile — triggered from header
export function MobileDrawer() {
  const { isMobileOpen, closeMobile } = useSidebar();
  const { data: session } = useSession();
  const pathname = usePathname();
  const userName = session?.user?.name || "Student";
  const userEmail = session?.user?.email || "";

  const navSections = React.useMemo(() => {
    const role = (session?.user as any)?.role;
    if (role === "TEACHER") return TEACHER_NAV_SECTIONS;
    if (role === "PARENT") return PARENT_NAV_SECTIONS;
    return STUDENT_NAV_SECTIONS;
  }, [session]);

  return (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={closeMobile}
          />

          {/* Drawer panel */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[hsl(var(--surface))] border-r border-[hsl(var(--border))] flex flex-col md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between h-[var(--header-height)] px-5">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-[15px]">ScaffoldAI</span>
              </div>
              <button
                onClick={closeMobile}
                className="h-8 w-8 flex items-center justify-center rounded-[var(--radius-sm)] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--surface-2))] transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
              {navSections.map((section) => (
                <div key={section.id} className="space-y-0.5">
                  {section.label && (
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground)/0.6)] px-3 py-2">
                      {section.label}
                    </p>
                  )}
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={closeMobile}
                        className={cn(
                          "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                          isActive
                            ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] dark:bg-purple-500/15 dark:text-purple-400 font-semibold"
                            : "text-[hsl(var(--muted-foreground))] dark:text-zinc-300 hover:bg-[hsl(var(--surface-2))] hover:text-[hsl(var(--foreground))] dark:hover:text-white dark:hover:bg-white/5"
                        )}
                      >
                        <Icon className="h-[18px] w-[18px] flex-shrink-0" strokeWidth={1.75} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>

            {/* User */}
            <div className="p-4 border-t border-[hsl(var(--border))]">
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={userName} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{userName}</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] dark:text-zinc-400">{userEmail}</p>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
