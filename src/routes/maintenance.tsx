import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Wrench, Phone, ShieldAlert, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "System Maintenance — IronForge Gym" },
      { name: "description", content: "IronForge Gym portal is undergoing maintenance." },
    ],
  }),
  component: MaintenancePage,
});

function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between items-center p-6 relative overflow-hidden font-sans select-none">
      
      {/* Background visual details */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#E02020] opacity-[0.03] blur-[150px] pointer-events-none" />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }}
      />

      {/* Header */}
      <header className="w-full max-w-4xl flex justify-start pt-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-[#E02020] flex items-center justify-center shadow-lg shadow-[#E02020]/20">
            <Dumbbell className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-xl tracking-wide uppercase font-bold text-white">IronForge Gym</span>
        </Link>
      </header>

      {/* Center content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center max-w-md px-4 space-y-6">
        
        {/* Animated wrench/gears icon */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="h-20 w-20 rounded-2xl bg-[#111111] border border-[#222222] flex items-center justify-center text-[#E02020] shadow-xl"
          >
            <Wrench className="h-10 w-10 animate-bounce duration-[3000ms]" />
          </motion.div>
          
          <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-[#E02020]/10 border border-[#E02020]/30 flex items-center justify-center text-[#E02020]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#E02020] animate-ping" />
          </div>
        </div>

        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-[#E02020] font-bold">System Status</span>
          <h1 className="font-display text-3xl uppercase font-bold tracking-wide text-white">We're upgrading the gym 🔧</h1>
          <p className="text-xs text-[#8A8A8A] leading-relaxed">
            Our portal is temporarily offline for scheduled database optimization and security maintenance. We expect to be fully functional shortly.
          </p>
        </div>

        {/* Info card */}
        <div className="w-full rounded-xl border border-[#222222] bg-[#111111]/40 p-4 space-y-2 text-left text-xs text-[#8A8A8A]">
          <div className="flex justify-between">
            <span>Expected back online:</span>
            <span className="text-white font-bold">Today, 11:30 PM (IST)</span>
          </div>
          <div className="h-px bg-[#222222]" />
          <div className="flex justify-between">
            <span>Operational updates:</span>
            <span className="text-white font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Normal Entry Open
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:+919876543210"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#222222] bg-[#111111] hover:bg-[#1A1A1A] hover:text-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#8A8A8A] transition-colors"
          >
            <Phone className="h-4 w-4 text-[#E02020]" /> Call Reception
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-[10px] text-[#555555] uppercase tracking-widest font-mono">
        IronForge Operations Security Operations Center
      </footer>
    </div>
  );
}
