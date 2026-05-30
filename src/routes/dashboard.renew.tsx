import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft, Check, ChevronRight, Dumbbell, Zap, Shield, Star,
  CreditCard, Smartphone, Building2, Loader2, CheckCircle2, Copy,
  RefreshCw, AlertCircle, Clock, CalendarDays, Receipt, Sparkles,
  TrendingUp, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/renew")({
  head: () => ({
    meta: [
      { title: "Renew Membership — IronForge Gym" },
      { name: "description", content: "Renew your IronForge gym membership. Choose a plan, select add-ons and pay online or at the gym counter." },
    ],
  }),
  component: RenewPage,
});

// ─── Types & Constants ────────────────────────────────────────────────────────

type PlanId = "monthly" | "quarterly" | "annual";
type PayStep = "select" | "processing" | "success";

interface Plan {
  id: PlanId;
  name: string;
  price: number;
  base: number;
  gst: number;
  period: string;
  months: number;
  badge: string | null;
  saving: string | null;
  perks: string[];
}

interface AddOn {
  id: string;
  label: string;
  price: number;
  icon: string;
}

const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Monthly Standard",
    price: 1499,
    base: 1270,
    gst: 229,
    period: "/month",
    months: 1,
    badge: null,
    saving: null,
    perks: ["Unlimited gym access", "Locker & shower", "1 trainer consult"],
  },
  {
    id: "quarterly",
    name: "Quarterly Premium",
    price: 3999,
    base: 3389,
    gst: 610,
    period: "/3 months",
    months: 3,
    badge: "Most Popular",
    saving: "Save 11%",
    perks: ["All Monthly perks", "4 group classes/week", "Diet plan included"],
  },
  {
    id: "annual",
    name: "Annual Elite",
    price: 13999,
    base: 11864,
    gst: 2135,
    period: "/year",
    months: 12,
    badge: "Best Value",
    saving: "Save 22%",
    perks: ["All Quarterly perks", "Unlimited classes", "Free body scan"],
  },
];

const ADD_ONS: AddOn[] = [
  { id: "locker", label: "Premium Locker", price: 299, icon: "🔒" },
  { id: "towel", label: "Towel Service", price: 199, icon: "🏊" },
  { id: "personal", label: "2× Personal Training", price: 999, icon: "🏋️" },
  { id: "parking", label: "Reserved Parking", price: 499, icon: "🚗" },
];

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const monthsFull = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const fmt = (d: Date) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
const fmtLong = (d: Date) => `${d.getDate()} ${monthsFull[d.getMonth()]} ${d.getFullYear()}`;

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// ─── Main Component ───────────────────────────────────────────────────────────

function RenewPage() {
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);

  // Step state
  const [step, setStep] = useState<PayStep>("select");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("quarterly");
  const [activeAddOns, setActiveAddOns] = useState<Set<string>>(new Set());
  const [payMethod, setPayMethod] = useState<"razorpay" | "gym" | null>(null);
  const [refId, setRefId] = useState("");
  const [copied, setCopied] = useState(false);

  // Load member from localStorage
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("is_member_logged_in");
    if (!isLoggedIn) {
      navigate({ to: "/login" });
      return;
    }
    const memberStr = localStorage.getItem("logged_in_member");
    if (memberStr) {
      try {
        const data = JSON.parse(memberStr);
        setMember(data);
        // Pre-select current plan
        const planCode: PlanId =
          data.plan === "monthly" || String(data.plan).toLowerCase().includes("monthly")
            ? "monthly"
            : data.plan === "annual" || String(data.plan).toLowerCase().includes("annual")
            ? "annual"
            : "quarterly";
        setSelectedPlan(planCode);
      } catch {}
    }
  }, [navigate]);

  // Derived membership dates
  const dates = useMemo(() => {
    const rawExpiry = member?.expiry || member?.validUntil;
    let expiry = rawExpiry ? new Date(rawExpiry) : new Date();
    if (isNaN(expiry.getTime())) expiry = new Date();

    const now = new Date();
    const isExpired = expiry < now;
    // Renewal starts day after current expiry (or today if already expired)
    const renewalStart = isExpired ? now : addDays(expiry, 1);

    const plan = PLANS.find((p) => p.id === selectedPlan)!;
    const renewalEnd = addMonths(renewalStart, plan.months);
    renewalEnd.setDate(renewalEnd.getDate() - 1);

    return {
      currentExpiry: rawExpiry ? fmt(expiry) : "15 Aug 2025",
      isExpired,
      renewalStart: fmt(renewalStart),
      renewalEnd: fmt(renewalEnd),
      renewalEndLong: fmtLong(renewalEnd),
      renewalEndDate: renewalEnd,
    };
  }, [member, selectedPlan]);

  // Current plan metadata
  const currentPlanLabel = useMemo(() => {
    if (!member) return "Quarterly Premium";
    const p = member.plan;
    if (p === "monthly" || String(p).toLowerCase().includes("monthly")) return "Monthly Standard";
    if (p === "annual" || String(p).toLowerCase().includes("annual")) return "Annual Elite";
    return "Quarterly Premium";
  }, [member]);

  // Price calculation
  const plan = PLANS.find((p) => p.id === selectedPlan)!;
  const addOnTotal = Array.from(activeAddOns).reduce((sum, id) => {
    const ao = ADD_ONS.find((a) => a.id === id);
    return sum + (ao?.price || 0);
  }, 0);
  const addOnGst = Math.round(addOnTotal * 0.18);
  const totalBase = plan.base + addOnTotal;
  const totalGst = plan.gst + addOnGst;
  const grandTotal = plan.price + addOnTotal + addOnGst;

  // Toggle add-on
  const toggleAddOn = (id: string) => {
    setActiveAddOns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Pay online (Razorpay placeholder)
  const handlePayOnline = () => {
    setPayMethod("razorpay");
    setStep("processing");
    setTimeout(() => {
      const updated = {
        ...member,
        plan: selectedPlan,
        planCode: selectedPlan,
        expiry: fmt(dates.renewalEndDate),
        validUntil: fmtLong(dates.renewalEndDate),
        paymentMode: "online",
        status: "Active",
        totalPriceFormatted: `₹${grandTotal.toLocaleString("en-IN")}`,
      };
      setMember(updated);
      localStorage.setItem("logged_in_member", JSON.stringify(updated));
      syncToUsers(updated);
      setStep("success");
      toast.success("Payment successful! Membership renewed.");
    }, 2000);
  };

  // Pay at gym — generate ref ID
  const handlePayAtGym = () => {
    setPayMethod("gym");
    const newRefId = `IG-REF-${Math.floor(100000 + Math.random() * 900000)}`;
    setRefId(newRefId);
    const updated = {
      ...member,
      plan: selectedPlan,
      planCode: selectedPlan,
      expiry: fmt(dates.renewalEndDate),
      validUntil: fmtLong(dates.renewalEndDate),
      paymentMode: "gym",
      referenceId: newRefId,
      status: "Pending Payment",
      totalPriceFormatted: `₹${grandTotal.toLocaleString("en-IN")}`,
    };
    setMember(updated);
    localStorage.setItem("logged_in_member", JSON.stringify(updated));
    syncToUsers(updated);
    setStep("success");
    toast.success("Reference ID generated! Please pay at the gym reception.");
  };

  const syncToUsers = (updated: any) => {
    const usersStr = localStorage.getItem("registered_users");
    if (!usersStr || !updated.memberId) return;
    try {
      const users = JSON.parse(usersStr);
      const idx = users.findIndex((u: any) => u.memberId === updated.memberId);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...updated };
        localStorage.setItem("registered_users", JSON.stringify(users));
      }
    } catch {}
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(refId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Reference ID copied!");
  };

  // ── Render ──────────────────────────────────────────────────────────────────

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
              <Dumbbell className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display text-base tracking-wide uppercase font-bold">IronForge Gym</span>
          </div>
          <div className="ml-auto">
            <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold px-2 py-0.5 rounded bg-[#E02020]/10 border border-[#E02020]/20">
              Membership Renewal
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 pb-20 space-y-8">
        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Page title */}
              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#E02020] font-bold mb-1">Step 1 of 2</div>
                <h1 className="font-display text-3xl sm:text-4xl tracking-wide uppercase text-white">Renew Membership</h1>
                <p className="text-sm text-[#8A8A8A] mt-1">Continue your fitness journey — choose a plan to renew.</p>
              </div>

              {/* Current plan status card */}
              <CurrentPlanCard
                planLabel={currentPlanLabel}
                expiry={dates.currentExpiry}
                isExpired={dates.isExpired}
              />

              {/* Plan selector */}
              <section className="space-y-4">
                <h2 className="font-display text-lg tracking-wide uppercase text-white flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-[#E02020]" />
                  Select Plan Duration
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {PLANS.map((p, i) => {
                    const isSelected = selectedPlan === p.id;
                    const isCurrent = p.name === currentPlanLabel;
                    return (
                      <motion.button
                        key={p.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.06 }}
                        onClick={() => setSelectedPlan(p.id)}
                        className={cn(
                          "relative rounded-xl border p-5 text-left transition-all hover:scale-[1.01] focus:outline-none cursor-pointer",
                          isSelected
                            ? "border-[#E02020] bg-[#E02020]/5 shadow-lg shadow-[#E02020]/10"
                            : "border-[#222222] bg-[#111111] hover:border-[#444444]"
                        )}
                      >
                        {p.badge && (
                          <span className={cn(
                            "absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full",
                            p.id === "quarterly" ? "bg-[#E02020] text-white" : "bg-amber-500 text-black"
                          )}>
                            {p.badge}
                          </span>
                        )}
                        {isCurrent && !isSelected && (
                          <span className="absolute top-2 right-2 text-[8px] uppercase tracking-wider font-bold text-[#8A8A8A] bg-[#1A1A1A] px-1.5 py-0.5 rounded">
                            Current
                          </span>
                        )}
                        {isSelected && (
                          <span className="absolute top-2 right-2 h-5 w-5 rounded-full bg-[#E02020] flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </span>
                        )}
                        <div className="font-bold text-xs text-white uppercase tracking-wider mb-2">{p.name}</div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-display text-3xl text-white">₹{p.price.toLocaleString("en-IN")}</span>
                          <span className="text-[#8A8A8A] text-xs">{p.period}</span>
                        </div>
                        {p.saving && (
                          <span className="inline-block mt-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            {p.saving}
                          </span>
                        )}
                        <ul className="mt-3 space-y-1.5">
                          {p.perks.map((perk) => (
                            <li key={perk} className="flex items-center gap-1.5 text-[11px] text-[#CFCFCF]">
                              <Check className="h-3 w-3 text-[#E02020] shrink-0" />
                              {perk}
                            </li>
                          ))}
                        </ul>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Upgrade banner */}
                {selectedPlan === "annual" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-lg bg-amber-500/5 border border-amber-500/20 px-4 py-3 flex items-start gap-2"
                  >
                    <TrendingUp className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">Great choice — Annual saves most!</div>
                      <div className="text-[11px] text-[#CFCFCF] mt-0.5">
                        Upgrading from Quarterly to Annual saves you <strong className="text-amber-300">₹1,997</strong> over the year.
                      </div>
                    </div>
                  </motion.div>
                )}
              </section>

              {/* Add-ons */}
              <section className="space-y-4">
                <h2 className="font-display text-lg tracking-wide uppercase text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#E02020]" />
                  Add-Ons <span className="text-[11px] text-[#8A8A8A] font-normal normal-case tracking-normal">optional</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ADD_ONS.map((ao) => {
                    const active = activeAddOns.has(ao.id);
                    return (
                      <button
                        key={ao.id}
                        onClick={() => toggleAddOn(ao.id)}
                        className={cn(
                          "flex items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all cursor-pointer",
                          active
                            ? "border-[#E02020] bg-[#E02020]/5"
                            : "border-[#222222] bg-[#111111] hover:border-[#333333]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{ao.icon}</span>
                          <div>
                            <div className="text-xs font-semibold text-white">{ao.label}</div>
                            <div className="text-[10px] text-[#8A8A8A]">+₹{ao.price}/period</div>
                          </div>
                        </div>
                        <div className={cn(
                          "h-5 w-5 rounded border flex items-center justify-center transition-all shrink-0",
                          active ? "border-[#E02020] bg-[#E02020]" : "border-[#444444] bg-transparent"
                        )}>
                          {active && <Check className="h-3 w-3 text-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Price summary + renewal dates */}
              <section className="rounded-xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#1A1A1A] flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-[#E02020]" />
                  <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Price Summary</span>
                </div>
                <div className="p-5 space-y-3 text-sm">
                  <div className="flex justify-between text-[#8A8A8A]">
                    <span>{plan.name} base cost</span>
                    <span>₹{plan.base.toLocaleString("en-IN")}</span>
                  </div>
                  {activeAddOns.size > 0 && (
                    <div className="flex justify-between text-[#8A8A8A]">
                      <span>Add-ons ({activeAddOns.size})</span>
                      <span>₹{addOnTotal.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#8A8A8A]">
                    <span>GST @ 18%</span>
                    <span>₹{totalGst.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-[#1A1A1A] pt-3 flex justify-between font-bold text-base text-white">
                    <span className="uppercase text-xs tracking-wider">Total Amount Due</span>
                    <span className="text-[#E02020] font-display text-xl">₹{grandTotal.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Renewal dates */}
                <div className="border-t border-[#1A1A1A] px-5 py-4 bg-[#0C0C0C] grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <DateInfo icon={<CalendarDays className="h-3.5 w-3.5 text-[#E02020]" />} label="Renewal Starts" value={dates.renewalStart} />
                  <DateInfo icon={<CalendarDays className="h-3.5 w-3.5 text-emerald-400" />} label="New Expiry" value={dates.renewalEnd} />
                  <DateInfo icon={<Clock className="h-3.5 w-3.5 text-amber-400" />} label="Duration" value={`${plan.months} ${plan.months === 1 ? "month" : "months"}`} />
                </div>
              </section>

              {/* Payment buttons */}
              <section className="space-y-3">
                <h2 className="font-display text-lg tracking-wide uppercase text-white flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#E02020]" />
                  Payment Method
                </h2>
                <motion.button
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.998 }}
                  onClick={handlePayOnline}
                  className="w-full flex items-center justify-between rounded-xl bg-[#E02020] hover:bg-[#C41818] px-5 py-4 text-white font-bold transition-colors cursor-pointer min-h-[60px]"
                >
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 shrink-0" />
                    <div className="text-left">
                      <div className="text-sm font-bold">Pay via UPI / Card</div>
                      <div className="text-[11px] text-white/70 font-normal">Razorpay · Secure checkout</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base">₹{grandTotal.toLocaleString("en-IN")}</span>
                    <ChevronRight className="h-4 w-4 text-white/70" />
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.998 }}
                  onClick={handlePayAtGym}
                  className="w-full flex items-center justify-between rounded-xl border border-[#333333] bg-[#111111] hover:border-[#555555] px-5 py-4 text-white font-bold transition-colors cursor-pointer min-h-[60px]"
                >
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 shrink-0 text-[#E02020]" />
                    <div className="text-left">
                      <div className="text-sm font-bold">Pay at Gym Counter</div>
                      <div className="text-[11px] text-[#8A8A8A] font-normal">Cash · Generates reference ID</div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#8A8A8A]" />
                </motion.button>

                <div className="flex items-start gap-2 px-1">
                  <Shield className="h-3.5 w-3.5 text-[#8A8A8A] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#8A8A8A]">All payments are 256-bit SSL encrypted. Your payment data is never stored on our servers.</p>
                </div>
              </section>
            </motion.div>
          )}

          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center py-20"
            >
              <div className="relative">
                <div className="h-24 w-24 rounded-full border-4 border-[#E02020]/20 border-t-[#E02020] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dumbbell className="h-8 w-8 text-[#E02020]" />
                </div>
              </div>
              <div>
                <div className="font-display text-2xl text-white tracking-wide">Processing Payment</div>
                <div className="text-sm text-[#8A8A8A] mt-2">Please wait — connecting to Razorpay...</div>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#8A8A8A]">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Secure connection established
              </div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center gap-8 py-12 text-center"
            >
              {/* Success icon */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="h-24 w-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center"
                >
                  <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="h-7 w-7 text-amber-400" />
                </motion.div>
              </div>

              {payMethod === "razorpay" ? (
                <div className="space-y-2 max-w-sm">
                  <div className="font-display text-3xl sm:text-4xl text-white tracking-wide">Payment Successful! 🎉</div>
                  <p className="text-[#8A8A8A] text-sm leading-relaxed">
                    Your membership has been renewed and is now active.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-w-sm">
                  <div className="font-display text-3xl sm:text-4xl text-white tracking-wide">Reference Generated!</div>
                  <p className="text-[#8A8A8A] text-sm leading-relaxed">
                    Show this ID at the gym reception to complete your payment and activate your plan.
                  </p>
                </div>
              )}

              {/* Renewal card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full max-w-sm rounded-2xl border border-[#222222] bg-[#111111] overflow-hidden"
              >
                {/* Card header */}
                <div className="bg-[#E02020] px-5 py-4">
                  <div className="text-[9px] uppercase tracking-widest text-white/70 font-bold">Active Membership</div>
                  <div className="font-display text-xl text-white mt-0.5 tracking-wide">{plan.name}</div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Valid From</div>
                      <div className="text-xs font-semibold text-white mt-0.5">{dates.renewalStart}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Valid Until</div>
                      <div className="text-xs font-semibold text-[#E02020] mt-0.5">{dates.renewalEnd}</div>
                    </div>
                  </div>

                  <div className="border-t border-[#1A1A1A] pt-3">
                    <div className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Amount Paid</div>
                    <div className="font-display text-2xl text-white mt-0.5">₹{grandTotal.toLocaleString("en-IN")}</div>
                  </div>

                  {payMethod === "gym" && refId && (
                    <div className="border-t border-[#1A1A1A] pt-3">
                      <div className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold mb-2">Reference ID</div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-[#E02020] font-bold bg-[#E02020]/10 px-2 py-1 rounded flex-1">
                          {refId}
                        </span>
                        <button
                          onClick={handleCopyRef}
                          className="h-8 w-8 flex items-center justify-center rounded bg-[#1A1A1A] hover:bg-[#222222] border border-[#333333] transition-colors cursor-pointer text-[#8A8A8A] hover:text-white"
                        >
                          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div className="flex items-start gap-1.5 mt-2">
                        <Info className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-[#8A8A8A]">
                          Your membership activates immediately after payment is verified at reception. Your plan shows "Pending" until then.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Action buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-3 w-full max-w-sm"
              >
                <Link to="/dashboard" className="flex-1">
                  <Button className="w-full bg-[#E02020] hover:bg-[#C41818] h-11 font-bold">
                    Back to Dashboard
                  </Button>
                </Link>
                <Link to="/dashboard/renewals" className="flex-1">
                  <Button variant="outline" className="w-full border-[#333333] bg-transparent text-white hover:bg-[#1A1A1A] h-11">
                    View History
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CurrentPlanCard({
  planLabel,
  expiry,
  isExpired,
}: {
  planLabel: string;
  expiry: string;
  isExpired: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
        isExpired
          ? "border-[#E02020]/30 bg-[#E02020]/5"
          : "border-[#222222] bg-[#111111]"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
          isExpired ? "bg-[#E02020]/10" : "bg-[#E02020]/10"
        )}>
          <Dumbbell className={cn("h-6 w-6", isExpired ? "text-[#E02020]" : "text-[#E02020]")} />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Current Plan</div>
          <div className="font-display text-lg text-white tracking-wide mt-0.5">{planLabel}</div>
          <div className={cn("text-xs font-medium mt-0.5", isExpired ? "text-[#E02020]" : "text-[#8A8A8A]")}>
            {isExpired ? `Expired ${expiry}` : `Expires ${expiry}`}
          </div>
        </div>
      </div>
      <Badge className={cn(
        "text-[9px] uppercase tracking-wider font-bold px-2.5 py-1 self-start sm:self-center",
        isExpired
          ? "bg-[#E02020]/10 text-[#E02020] border border-[#E02020]/30"
          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
      )}>
        {isExpired ? "Expired" : "Expiring Soon"}
      </Badge>
    </motion.div>
  );
}

function DateInfo({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">{label}</div>
        <div className="text-xs font-semibold text-white mt-0.5">{value}</div>
      </div>
    </div>
  );
}
