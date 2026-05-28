import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, Calendar, CreditCard, Dumbbell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/members", label: "Members", icon: Users },
  { to: "/classes", label: "Classes", icon: Calendar },
  { to: "/billing", label: "Billing", icon: CreditCard },
  { to: "/trainers", label: "Trainers", icon: Dumbbell },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-[#1A1A1A] bg-[#0A0A0A] min-h-screen">
      <div className="flex items-center gap-2 px-6 py-6 border-b border-[#1A1A1A]">
        <div className="h-9 w-9 rounded-lg bg-[#E02020] flex items-center justify-center">
          <Dumbbell className="h-5 w-5 text-white" />
        </div>
        <div className="font-display text-2xl tracking-wide">IronForge Gym</div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-[#E02020] text-white"
                  : "text-[#8A8A8A] hover:bg-[#1A1A1A] hover:text-white",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-[#1A1A1A] text-xs text-[#8A8A8A]">
        v1.0 · Mumbai
      </div>
    </aside>
  );
}
