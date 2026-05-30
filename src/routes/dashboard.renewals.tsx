import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ArrowLeft, Dumbbell, Download, Receipt, CheckCircle2, Clock,
  RefreshCw, ChevronRight, CalendarDays, TrendingUp, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

export const Route = createFileRoute("/dashboard/renewals")({
  head: () => ({
    meta: [
      { title: "Renewal History — IronForge Gym" },
      { name: "description", content: "View your complete membership renewal history and download past invoices." },
    ],
  }),
  component: RenewalHistoryPage,
});

// ─── Types & Static Data ──────────────────────────────────────────────────────

interface RenewalRecord {
  id: string;
  invoiceNo: string;
  plan: string;
  planId: "monthly" | "quarterly" | "annual";
  startDate: string;
  endDate: string;
  amount: number;
  method: string;
  status: "Paid" | "Pending";
  isCurrent?: boolean;
}

// Demo renewal history — 4 periods, latest marked current
const DEMO_RENEWALS: RenewalRecord[] = [
  {
    id: "r4",
    invoiceNo: "INV-2025-0182",
    plan: "Quarterly Premium",
    planId: "quarterly",
    startDate: "12 Feb 2025",
    endDate: "11 Aug 2025",
    amount: 3999,
    method: "UPI (GPay)",
    status: "Paid",
    isCurrent: true,
  },
  {
    id: "r3",
    invoiceNo: "INV-2024-0842",
    plan: "Quarterly Premium",
    planId: "quarterly",
    startDate: "12 Nov 2024",
    endDate: "11 Feb 2025",
    amount: 3999,
    method: "UPI (PhonePe)",
    status: "Paid",
  },
  {
    id: "r2",
    invoiceNo: "INV-2024-0417",
    plan: "Quarterly Premium",
    planId: "quarterly",
    startDate: "12 Aug 2024",
    endDate: "11 Nov 2024",
    amount: 3999,
    method: "Cash",
    status: "Paid",
  },
  {
    id: "r1",
    invoiceNo: "INV-2024-0112",
    plan: "Monthly Standard",
    planId: "monthly",
    startDate: "12 Feb 2024",
    endDate: "11 Mar 2024",
    amount: 1499,
    method: "Card (HDFC)",
    status: "Paid",
  },
];

// Plan colour helpers
const PLAN_COLORS = {
  monthly: {
    border: "border-blue-500/20",
    bg: "bg-blue-500/5",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dot: "bg-blue-400",
    icon: "text-blue-400",
  },
  quarterly: {
    border: "border-[#E02020]/20",
    bg: "bg-[#E02020]/5",
    badge: "bg-[#E02020]/10 text-[#E02020] border-[#E02020]/20",
    dot: "bg-[#E02020]",
    icon: "text-[#E02020]",
  },
  annual: {
    border: "border-amber-500/20",
    bg: "bg-amber-500/5",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
    icon: "text-amber-400",
  },
};

const monthsFull = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatInvoiceText(r: RenewalRecord, memberName: string, memberId: string, mobile: string): string {
  const base = Math.round(r.amount / 1.18);
  const cgst = Math.round((r.amount - base) / 2);
  const sgst = cgst;
  return `================================================
IRONFORGE GYM HYDERABAD - TAX INVOICE
================================================
Invoice No: ${r.invoiceNo}
Plan: ${r.plan}
Period: ${r.startDate} — ${r.endDate}
Status: ${r.status.toUpperCase()}

BILL TO:
Name: ${memberName}
Member ID: ${memberId}
Mobile: ${mobile}

DESCRIPTION:
IronForge Gym ${r.plan} Access Subscription
Period: ${r.startDate} to ${r.endDate}

BREAKDOWN:
Base Subscription Cost: ₹${base.toLocaleString("en-IN")}
CGST (9%):              ₹${cgst.toLocaleString("en-IN")}
SGST (9%):              ₹${sgst.toLocaleString("en-IN")}
------------------------------------------------
TOTAL INCLUSIVE OF GST: ₹${r.amount.toLocaleString("en-IN")}
------------------------------------------------
Payment Method:         ${r.method}

COMPANY DETAILS:
IronForge Gym, Plot 42, Road 5,
Banjara Hills, Hyderabad - 500034.
GSTIN: 36AAAAI4284P1Z3
================================================
Thank you for training with us!
`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

function RenewalHistoryPage() {
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>("r4"); // Start expanded on current

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("is_member_logged_in");
    if (!isLoggedIn) {
      navigate({ to: "/login" });
      return;
    }
    const memberStr = localStorage.getItem("logged_in_member");
    if (memberStr) {
      try { setMember(JSON.parse(memberStr)); } catch {}
    }
  }, [navigate]);

  const memberName = member?.fullName || "Rahul Sharma";
  const memberId = member?.memberId || "IG-2024-0042";
  const mobile = member?.mobile || "+91 98765 43210";

  const handleDownload = (r: RenewalRecord) => {
    const text = formatInvoiceText(r, memberName, memberId, mobile);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `IronForge_Invoice_${r.invoiceNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Invoice ${r.invoiceNo} downloaded!`);
  };

  // Stats
  const totalSpent = DEMO_RENEWALS.reduce((s, r) => s + r.amount, 0);
  const monthsActive = DEMO_RENEWALS.reduce((s, r) => {
    const p = r.planId;
    return s + (p === "monthly" ? 1 : p === "quarterly" ? 3 : 12);
  }, 0);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-[#1A1A1A] bg-[#0A0A0A]/95 backdrop-blur-md">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link to="/dashboard" className="touch-target flex items-center justify-center text-[#8A8A8A] hover:text-white transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-[#E02020] flex items-center justify-center shrink-0">
              <History className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display text-base tracking-wide uppercase font-bold">Renewal History</span>
          </div>
          <div className="ml-auto">
            <Link to="/dashboard/renew">
              <Button size="sm" className="bg-[#E02020] hover:bg-[#C41818] h-8 text-xs px-3 font-bold">
                <RefreshCw className="h-3 w-3 mr-1.5" />
                Renew Now
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 pb-20 space-y-8">

        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="text-[10px] uppercase tracking-widest text-[#E02020] font-bold mb-1">Membership</div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-wide uppercase text-white">Renewal History</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">Your complete IronForge membership timeline from day one.</p>
        </motion.div>

        {/* Summary stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <StatCard label="Member Since" value="Feb 2024" icon={<CalendarDays className="h-4 w-4 text-[#E02020]" />} />
          <StatCard label="Total Renewals" value={String(DEMO_RENEWALS.length)} icon={<RefreshCw className="h-4 w-4 text-blue-400" />} />
          <StatCard label="Months Active" value={`${monthsActive}m`} icon={<TrendingUp className="h-4 w-4 text-emerald-400" />} />
          <StatCard label="Total Invested" value={`₹${totalSpent.toLocaleString("en-IN")}`} icon={<Receipt className="h-4 w-4 text-amber-400" />} />
        </motion.div>

        {/* Timeline */}
        <div className="relative space-y-0">
          {/* Vertical timeline line */}
          <div className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-[#E02020]/60 via-[#333333] to-transparent hidden sm:block" />

          {DEMO_RENEWALS.map((record, idx) => {
            const colors = PLAN_COLORS[record.planId];
            const isExpanded = expandedId === record.id;

            return (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: idx * 0.07 }}
                className="relative sm:pl-14"
              >
                {/* Timeline dot (desktop) */}
                <div className={cn(
                  "absolute left-3.5 top-6 h-3 w-3 rounded-full border-2 border-[#0A0A0A] hidden sm:block z-10",
                  colors.dot,
                  record.isCurrent && "ring-2 ring-offset-1 ring-offset-[#0A0A0A] ring-[#E02020]"
                )} />

                {/* Card */}
                <div className={cn(
                  "rounded-xl border mb-4 overflow-hidden transition-all",
                  record.isCurrent
                    ? "border-[#E02020]/30 bg-[#111111]"
                    : "border-[#222222] bg-[#0C0C0C]"
                )}>
                  {/* Card header — always visible */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : record.id)}
                    className="w-full text-left px-4 sm:px-5 py-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#111111] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Plan icon */}
                      <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", colors.bg, `border ${colors.border}`)}>
                        <Dumbbell className={cn("h-5 w-5", colors.icon)} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-white">{record.plan}</span>
                          {record.isCurrent && (
                            <Badge className="bg-[#E02020]/10 text-[#E02020] border border-[#E02020]/30 text-[8px] uppercase tracking-wider px-1.5 py-0">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-[#8A8A8A]">
                          <CalendarDays className="h-3 w-3 shrink-0" />
                          <span>{record.startDate}</span>
                          <span className="text-[#555555]">→</span>
                          <span>{record.endDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="font-display text-lg text-white font-bold">₹{record.amount.toLocaleString("en-IN")}</div>
                        <div className={cn(
                          "text-[9px] uppercase tracking-wider font-bold",
                          record.status === "Paid" ? "text-emerald-400" : "text-amber-400"
                        )}>
                          {record.status}
                        </div>
                      </div>
                      <ChevronRight className={cn(
                        "h-4 w-4 text-[#555555] transition-transform duration-200",
                        isExpanded && "rotate-90"
                      )} />
                    </div>
                  </button>

                  {/* Expandable detail section */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-[#1A1A1A]"
                    >
                      <div className="px-4 sm:px-5 py-4 space-y-4">
                        {/* Detail grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <DetailCell label="Invoice No" value={record.invoiceNo} mono />
                          <DetailCell label="Payment Method" value={record.method} />
                          <DetailCell
                            label="Amount"
                            value={`₹${record.amount.toLocaleString("en-IN")}`}
                            highlight
                          />
                          <DetailCell
                            label="Status"
                            value={record.status}
                            statusColor={record.status === "Paid" ? "emerald" : "amber"}
                          />
                        </div>

                        {/* GST breakdown */}
                        <div className="rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 space-y-1.5 text-xs text-[#8A8A8A]">
                          <div className="text-[9px] uppercase tracking-widest font-bold text-[#555555] mb-2">GST Breakdown</div>
                          {(() => {
                            const base = Math.round(record.amount / 1.18);
                            const tax = record.amount - base;
                            const half = Math.round(tax / 2);
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span>Base subscription</span>
                                  <span className="text-white font-medium">₹{base.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>CGST @ 9%</span>
                                  <span className="text-white font-medium">₹{half.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>SGST @ 9%</span>
                                  <span className="text-white font-medium">₹{(tax - half).toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between border-t border-[#1A1A1A] pt-1.5 font-bold text-white">
                                  <span>Total (incl. GST)</span>
                                  <span className="text-[#E02020]">₹{record.amount.toLocaleString("en-IN")}</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Download button */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            onClick={() => handleDownload(record)}
                            variant="outline"
                            className="flex-1 border-[#333333] bg-transparent text-white hover:bg-[#1A1A1A] h-9 text-xs font-bold"
                          >
                            <Download className="h-3.5 w-3.5 mr-2 text-[#E02020]" />
                            Download GST Invoice
                          </Button>
                          {record.isCurrent && (
                            <Link to="/dashboard/renew" className="flex-1">
                              <Button className="w-full bg-[#E02020] hover:bg-[#C41818] h-9 text-xs font-bold">
                                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                                Renew Plan
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="rounded-xl border border-[#222222] bg-[#111111] p-5 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-[#E02020]/10 flex items-center justify-center shrink-0">
              <RefreshCw className="h-6 w-6 text-[#E02020]" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Ready to renew?</div>
              <div className="text-xs text-[#8A8A8A] mt-0.5">Keep your streak going — renew before your plan expires.</div>
            </div>
          </div>
          <Link to="/dashboard/renew" className="w-full sm:w-auto shrink-0">
            <Button className="w-full bg-[#E02020] hover:bg-[#C41818] h-10 px-6 font-bold">
              Renew Membership
            </Button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#222222] bg-[#111111] px-4 py-3.5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        {icon}
      </div>
      <div>
        <div className="font-display text-xl sm:text-2xl text-white tracking-wide">{value}</div>
        <div className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function DetailCell({
  label,
  value,
  mono,
  highlight,
  statusColor,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  statusColor?: "emerald" | "amber";
}) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-widest text-[#555555] font-bold mb-1">{label}</div>
      <div className={cn(
        "text-xs font-semibold",
        mono && "font-mono",
        highlight && "text-[#E02020] font-display text-sm",
        statusColor === "emerald" && "text-emerald-400",
        statusColor === "amber" && "text-amber-400",
        !highlight && !statusColor && "text-white"
      )}>
        {value}
      </div>
    </div>
  );
}
