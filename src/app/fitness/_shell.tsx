"use client";

import { Dumbbell, Library, Route, LineChart, Apple, LayoutDashboard, Menu, X, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { PageTransition } from "./_animations";
import "./fitness.css";

const navItems = [
  { href: "/fitness", label: "Dashboard", icon: LayoutDashboard },
  { href: "/fitness/exercises", label: "Exercises", icon: Library },
  { href: "/fitness/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/fitness/routines", label: "Routines", icon: Route },
  { href: "/fitness/progress", label: "Progress", icon: LineChart },
  { href: "/fitness/meals", label: "Meals", icon: Apple },
];

export default function FitnessShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  return (
    <div className="min-h-screen bg-[oklch(3.5%_0.003_155)] text-zinc-100 font-['Inter'] relative overflow-x-hidden">
      <div className="grain-overlay animate-breathe" />

      <div className="ambient-blob ambient-blob-1 w-[600px] h-[600px] bg-emerald-500/4"
        style={{ top: `${mousePos.y * 50}%`, left: `${mousePos.x * 50}%`, transform: "translate(-50%, -50%)" }}
      />
      <div className="ambient-blob ambient-blob-2 w-[400px] h-[400px] bg-emerald-500/3"
        style={{ top: `${80 - mousePos.y * 30}%`, right: `${mousePos.x * 40}%`, transform: "translate(-50%, -50%)" }}
      />
      <div className="ambient-blob ambient-blob-3 w-[300px] h-[300px] bg-emerald-500/3"
        style={{ bottom: `${mousePos.y * 30}%`, left: `${30 + mousePos.x * 30}%`, transform: "translate(-50%, -50%)" }}
      />

      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-3 left-3 z-50 lg:hidden p-2.5 rounded-xl bg-zinc-900/80 backdrop-blur-md border border-zinc-800 btn-press"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-[oklch(6%_0.003_155)] backdrop-blur-2xl border-r border-[oklch(100%_0_0/0.06)] transform transition-all duration-500 ease-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-5 flex flex-col h-full">
          <Link href="/fitness" className="flex items-center gap-3 mb-12 group" onClick={() => setMobileOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 via-emerald-500/10 to-emerald-500/5 flex items-center justify-center border border-emerald-500/20 group-hover:border-emerald-500/40 transition-all duration-500 shadow-lg shadow-emerald-500/5">
              <Dumbbell size={20} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-tight leading-none">IronMind</h1>
              <p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase mt-0.5">Free Fitness Tracker</p>
            </div>
          </Link>

          <nav className="space-y-1 flex-1 relative">
            {navItems.map((item, i) => {
              const isActive = pathname === item.href || (item.href !== "/fitness" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 animate-slide-right relative",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/10"
                      : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/30 border border-transparent"
                  )}
                  style={{ animationDelay: `${i * 30}ms`, animationFillMode: "both" }}
                >
                  {isActive && <div className="nav-active-indicator" />}
                  <item.icon size={18} className={cn("transition-colors shrink-0", isActive && "text-emerald-400")} />
                  <span>{item.label}</span>
                  {isActive && (
                    <ChevronRight size={14} className="ml-auto text-emerald-400/60" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 rounded-xl bg-gradient-to-b from-emerald-500/8 to-emerald-500/3 border border-emerald-500/8 mt-auto animate-fade-in">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
              <p className="text-[10px] text-emerald-400/60 font-mono tracking-widest uppercase">Status</p>
            </div>
            <p className="text-xs text-zinc-500">100% Free — No subscription</p>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="lg:pl-64 min-h-screen relative z-10">
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}