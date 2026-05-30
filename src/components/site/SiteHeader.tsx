import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Home" },
  { to: "/plans", label: "Plans" },
  { to: "/trainers", label: "Trainers" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-[70] border-b border-[#1A1A1A] bg-[#0A0A0A]/90 backdrop-blur">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 py-4">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-[#E02020] flex items-center justify-center shrink-0">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl sm:text-2xl tracking-wide truncate">IronForge Gym</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors touch-target-inline flex items-center",
                  active ? "text-white" : "text-[#8A8A8A] hover:text-white",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/login">
            <Button variant="ghost" className="text-[#8A8A8A] hover:text-white hover:bg-[#1A1A1A] touch-target-inline">Member Login</Button>
          </Link>
          <Link to="/join">
            <Button className="bg-[#E02020] hover:bg-[#C41818] text-white font-medium touch-target-inline">Join Now</Button>
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden text-white touch-target flex items-center justify-center -mr-2"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Full-screen mobile nav overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[60] bg-[#0A0A0A] flex flex-col pt-[72px]">
          <nav className="flex-1 flex flex-col justify-center px-6 py-8 space-y-1">
            {links.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-4 py-4 text-2xl font-display tracking-wide rounded-lg touch-target-inline flex items-center",
                    active ? "text-[#E02020]" : "text-white hover:bg-[#1A1A1A]",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="px-6 pb-10 pt-6 border-t border-[#1A1A1A] space-y-3 safe-area-pb">
            <Link to="/login" onClick={() => setOpen(false)} className="block">
              <Button variant="outline" className="w-full h-12 border-[#222222] bg-transparent text-white hover:bg-[#1A1A1A]">
                Member Login
              </Button>
            </Link>
            <Link to="/join" onClick={() => setOpen(false)} className="block">
              <Button className="w-full h-12 bg-[#E02020] hover:bg-[#C41818] text-white">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
