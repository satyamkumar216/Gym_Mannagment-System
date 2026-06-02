import { Link, useRouterState } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className="fixed top-0 left-0 right-0 z-[9999] select-none transition-all duration-300 bg-transparent"
      style={{
        background: scrolled 
          ? "linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.3) 40%, rgba(10,10,10,0.3) 60%, rgba(10,10,10,0.95) 100%), linear-gradient(to bottom, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.4) 100%)"
          : "linear-gradient(to right, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.05) 40%, rgba(10,10,10,0.05) 60%, rgba(10,10,10,0.85) 100%), linear-gradient(to bottom, rgba(10,10,10,0.8) 0%, transparent 100%)"
      }}
    >
      <style>{`
        .hamburger-menu {
          display: none !important;
        }
        @media (max-width: 768px) {
          .hamburger-menu {
            display: flex !important;
          }
          .nav-glass-pill {
            display: none !important;
          }
          .member-login-btn {
            display: none !important;
          }
          .join-now-btn {
            display: none !important;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl grid grid-cols-2 md:grid-cols-3 items-center px-4 sm:px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group w-fit">
          <motion.div
            whileHover={{ rotate: -12, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
            className="h-9 w-9 rounded-lg bg-[#E02020] flex items-center justify-center shadow-[0_0_20px_rgba(224,32,32,0.4)]"
          >
            <Dumbbell className="h-5 w-5 text-white" />
          </motion.div>
          <span className="font-display text-[15px] font-bold uppercase tracking-wider text-white group-hover:text-[#E02020] transition-colors">
            IronForge Gym
          </span>
        </Link>

        {/* Center nav pill */}
        <nav className="hidden md:flex items-center justify-center nav-glass-pill">
          <div 
            style={{
              display: "inline-flex",
              width: "fit-content",
              padding: "6px 8px",
              borderRadius: "50px",
              background: "rgba(0, 0, 0, 0.35)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              boxShadow: "0 4px 24px rgba(0, 0, 0, 0.3)"
            }}
            className="flex items-center gap-1"
          >
            {links.map((l) => {
              const active = pathname === l.to;
              return (
                <Link key={l.to} to={l.to} className="relative">
                  <motion.span
                    whileHover={{ y: -2, scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className={cn(
                      "relative block px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors rounded-full",
                      active ? "text-white" : "text-[#9A9A9A] hover:text-white"
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-[#E02020] shadow-[0_0_20px_rgba(224,32,32,0.5)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{l.label}</span>
                  </motion.span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* CTA & Member Login */}
        <div className="hidden md:flex items-center justify-end gap-5">
          <Link to="/login" className="member-login-btn">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#9A9A9A] hover:text-white transition-colors cursor-pointer">
              Member Login
            </span>
          </Link>
          <Link to="/join" className="join-now-btn">
            <motion.div
              whileHover={{ scale: 1.06, y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 15 }}
            >
              <Button className="rounded-full px-6 bg-[#E02020] hover:bg-[#C41818] text-white shadow-[0_0_25px_rgba(224,32,32,0.45)] text-xs font-semibold uppercase tracking-wider py-2.5 h-auto">
                Join Now
              </Button>
            </motion.div>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="hamburger-menu text-white justify-self-end touch-target p-2 flex items-center justify-center hover:text-[#E02020] transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile nav dropdown overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-white/5 px-4 py-4 space-y-2 bg-[#0A0A0A] overflow-hidden"
          >
            {links.map((l) => {
              const active = pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block px-4 py-3 text-sm rounded-xl transition-all font-semibold uppercase tracking-wider",
                    active ? "text-[#E02020] bg-white/5" : "text-[#CFCFCF] hover:bg-white/5"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
            <div className="pt-4 border-t border-white/5 space-y-2">
              <Link to="/login" onClick={() => setOpen(false)} className="block">
                <Button variant="outline" className="w-full rounded-full border-white/10 bg-transparent text-white hover:bg-white/5 text-xs font-semibold uppercase tracking-wider h-11">
                  Member Login
                </Button>
              </Link>
              <Link to="/join" onClick={() => setOpen(false)} className="block">
                <Button className="w-full rounded-full bg-[#E02020] hover:bg-[#C41818] text-white text-xs font-semibold uppercase tracking-wider h-11">
                  Join Now
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
