import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-50 border-b border-[#1A1A1A] bg-[#0A0A0A]/90 backdrop-blur">
      <div className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-[#E02020] flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-2xl tracking-wide">IronForge Gym</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-md transition-colors",
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
            <Button variant="ghost" className="text-[#8A8A8A] hover:text-white hover:bg-[#1A1A1A]">Member Login</Button>
          </Link>
          <Link to="/join">
            <Button className="bg-[#E02020] hover:bg-[#C41818] text-white font-medium">Join Now</Button>
          </Link>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#1A1A1A] px-4 py-3 space-y-2 bg-[#0A0A0A]">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm rounded-md text-[#CFCFCF] hover:bg-[#1A1A1A]"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-[#1A1A1A] space-y-2">
            <Link to="/login" onClick={() => setOpen(false)} className="block">
              <Button variant="outline" className="w-full border-[#222222] bg-transparent text-white hover:bg-[#1A1A1A]">Member Login</Button>
            </Link>
            <Link to="/join" onClick={() => setOpen(false)} className="block">
              <Button className="w-full bg-[#E02020] hover:bg-[#C41818] text-white">Join Now</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
