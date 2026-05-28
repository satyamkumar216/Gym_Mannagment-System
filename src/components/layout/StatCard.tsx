import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  icon: LucideIcon;
  index?: number;
}

export function StatCard({ label, value, delta, trend = "up", icon: Icon, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="rounded-xl bg-[#111111] border border-[#222222] p-5 hover:border-[#E02020]/40 transition-colors"
    >
      <div className="flex items-start justify-between">
        <div className="text-xs uppercase tracking-widest text-[#8A8A8A] font-medium">
          {label}
        </div>
        <div className="h-9 w-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center text-[#E02020]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4 font-display text-4xl tracking-wide">{value}</div>
      {delta && (
        <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
          {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {delta}
        </div>
      )}
    </motion.div>
  );
}
