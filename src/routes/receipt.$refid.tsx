import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Printer, ArrowLeft, Clock, MapPin, User, CreditCard, AlertTriangle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/receipt/$refid")({
  head: () => ({
    meta: [
      { title: "Cash Payment Reference — IronForge Gym" },
      { name: "description", content: "Pay at Gym Reference invoice and receipt details." },
    ],
  }),
  component: CashReceipt,
});

interface ReceiptData {
  name: string;
  plan: string;
  amount: number;
  mobile: string;
  referenceId: string;
}

function CashReceipt() {
  const { refid } = Route.useParams();

  // Dynamically calculate the 48-hour validity expiration date
  const formattedExpiry = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 48);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  // Look up receipt details
  const receipt = useMemo<ReceiptData>(() => {
    const normalized = refid.toUpperCase();

    // Check localStorage
    if (typeof window !== "undefined") {
      const usersStr = localStorage.getItem("registered_users");
      if (usersStr) {
        try {
          const users = JSON.parse(usersStr);
          if (Array.isArray(users)) {
            const u = users.find(
              (usr: any) =>
                usr.referenceId === normalized ||
                (usr.referenceId && usr.referenceId.toUpperCase() === normalized) ||
                usr.memberId === normalized
            );
            if (u) {
              const isAnnual = u.plan === "annual";
              const isMonthly = u.plan === "monthly";
              return {
                name: u.fullName,
                plan: isAnnual ? "Annual Elite Plan" : isMonthly ? "Monthly Standard Plan" : "Quarterly Premium Plan",
                amount: isAnnual ? 16518 : isMonthly ? 1499 : 3999,
                mobile: u.mobile.startsWith("+91") ? u.mobile : `+91 ${u.mobile}`,
                referenceId: u.referenceId || normalized
              };
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Default Fallback matching the requested details
    return {
      name: "Rahul Sharma",
      plan: "Quarterly Premium Plan",
      amount: 3999,
      mobile: "+91 98765 43210",
      referenceId: normalized.startsWith("IG-REF-") ? normalized : "IG-REF-284751"
    };
  }, [refid]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center items-center p-4 md:p-8 font-sans antialiased relative">
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card-only {
            background: white !important;
            color: black !important;
            border: 2px solid black !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: 450px !important;
            padding: 1.5rem !important;
            margin: 0 auto !important;
            position: absolute !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
          }
          .print-card-only * {
            color: black !important;
            border-color: #ddd !important;
          }
          .print-card-only .print-accent-red {
            color: #E02020 !important;
          }
          .print-card-only .print-svg-black svg path {
            stroke: black !important;
          }
          .print-card-only .print-qr-code rect {
            fill: black !important;
          }
        }
      `}</style>

      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-[#E02020] opacity-5 blur-[100px] pointer-events-none z-0" />

      {/* Navigation link */}
      <Link 
        to="/" 
        className="no-print absolute top-6 left-6 text-xs text-[#8A8A8A] hover:text-white flex items-center gap-1.5 transition-colors font-semibold uppercase tracking-wider z-10"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Main Site
      </Link>

      {/* Main card */}
      <div className="print-card-only w-full max-w-md rounded-2xl bg-[#111111] border border-[#222222] p-6 md:p-8 shadow-2xl relative space-y-6 z-10">
        
        {/* Card Header */}
        <div className="text-center pb-4 border-b border-[#222222] space-y-1">
          <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold block print-accent-red">Pay at Gym Checkout Receipt</span>
          <h2 className="font-display text-3xl tracking-wide uppercase text-white font-bold">IronForge Gym</h2>
        </div>

        {/* Reference ID Showcase */}
        <div className="rounded-xl bg-[#0A0A0A] border border-[#222222] p-4 text-center space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Payment Reference ID</span>
          <div className="font-display text-4xl text-[#E02020] font-black tracking-wider uppercase print-accent-red">{receipt.referenceId}</div>
        </div>

        {/* Receipt details */}
        <div className="space-y-3.5 text-xs border-b border-[#222222] pb-5">
          <div className="flex justify-between items-center bg-[#181818]/40 p-2.5 rounded-lg border border-[#222222]">
            <div className="flex items-center gap-2 text-[#8A8A8A]">
              <User className="h-4 w-4 shrink-0 text-[#E02020] print-accent-red" />
              <span className="font-semibold">Member Name</span>
            </div>
            <span className="font-bold text-white text-right">{receipt.name}</span>
          </div>

          <div className="flex justify-between items-center bg-[#181818]/40 p-2.5 rounded-lg border border-[#222222]">
            <div className="flex items-center gap-2 text-[#8A8A8A]">
              <CreditCard className="h-4 w-4 shrink-0 text-[#E02020] print-accent-red" />
              <span className="font-semibold">Active Plan</span>
            </div>
            <span className="font-bold text-white text-right">{receipt.plan}</span>
          </div>

          <div className="flex justify-between items-center bg-[#181818]/40 p-2.5 rounded-lg border border-[#222222]">
            <div className="flex items-center gap-2 text-[#8A8A8A]">
              <AlertTriangle className="h-4 w-4 shrink-0 text-[#E02020] print-accent-red" />
              <span className="font-semibold">Amount Due</span>
            </div>
            <span className="font-display text-base font-bold text-[#E02020] text-right print-accent-red">₹{receipt.amount.toLocaleString("en-IN")}</span>
          </div>

          <div className="flex justify-between items-center bg-[#181818]/40 p-2.5 rounded-lg border border-[#222222]">
            <div className="flex items-center gap-2 text-[#8A8A8A]">
              <Clock className="h-4 w-4 shrink-0 text-[#E02020] print-accent-red" />
              <span className="font-semibold">Validity Period</span>
            </div>
            <span className="font-bold text-white text-right text-[11px]">48 Hours</span>
          </div>
        </div>

        {/* QR Code Scan Placeholder */}
        <div className="space-y-3 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold text-center">Scan at Desk to Clear</span>
          <div className="h-32 w-32 bg-white rounded-xl p-2.5 flex items-center justify-center relative shadow-lg group">
            {/* Styled QR placeholder */}
            <svg className="h-full w-full text-black print-qr-code" viewBox="0 0 100 100" fill="currentColor">
              {/* Corner position markers */}
              <rect x="0" y="0" width="28" height="28" rx="2" />
              <rect x="6" y="6" width="16" height="16" fill="white" />
              <rect x="10" y="10" width="8" height="8" />

              <rect x="72" y="0" width="28" height="28" rx="2" />
              <rect x="78" y="6" width="16" height="16" fill="white" />
              <rect x="82" y="10" width="8" height="8" />

              <rect x="0" y="72" width="28" height="28" rx="2" />
              <rect x="6" y="78" width="16" height="16" fill="white" />
              <rect x="10" y="82" width="8" height="8" />

              {/* Dynamic looking QR grids */}
              <rect x="36" y="4" width="8" height="12" />
              <rect x="48" y="8" width="16" height="8" />
              <rect x="36" y="24" width="16" height="4" />
              
              <rect x="4" y="36" width="12" height="8" />
              <rect x="20" y="36" width="8" height="8" />
              <rect x="32" y="32" width="12" height="16" />
              <rect x="52" y="36" width="16" height="8" />
              <rect x="76" y="36" width="12" height="12" />
              
              <rect x="8" y="52" width="16" height="12" />
              <rect x="32" y="52" width="8" height="8" />
              <rect x="44" y="56" width="24" height="4" />
              <rect x="72" y="52" width="8" height="16" />

              <rect x="36" y="72" width="12" height="8" />
              <rect x="52" y="76" width="8" height="16" />
              <rect x="64" y="72" width="8" height="8" />
              <rect x="76" y="76" width="20" height="8" />
              <rect x="88" y="88" width="8" height="8" />
            </svg>
            
            {/* Glowing neon alignment lines */}
            <div className="no-print absolute inset-0 border border-[#E02020]/45 rounded-xl pointer-events-none group-hover:scale-105 transition-transform" />
          </div>
          <span className="text-[9px] text-[#8A8A8A] text-center font-mono leading-relaxed max-w-xs">
            Valid until: <strong className="text-white font-semibold">{formattedExpiry}</strong>
          </span>
        </div>

        {/* Address Footer info */}
        <div className="border-t border-[#222222] pt-4 text-center space-y-1 text-[10px] text-[#8A8A8A] leading-relaxed">
          <div className="flex items-center justify-center gap-1">
            <MapPin className="h-3 w-3 text-[#E02020] print-accent-red" />
            <span>Plot 42, Road 5, Banjara Hills, Hyderabad</span>
          </div>
          <p>Please complete payment at the gym registration desk before the expiry date to activate your keycard access.</p>
        </div>

        {/* Print button */}
        <div className="no-print pt-2">
          <Button 
            onClick={handlePrint}
            className="w-full bg-[#E02020] hover:bg-[#C41818] text-white text-xs font-bold uppercase h-11 flex items-center justify-center gap-2 border-0 tracking-wider"
          >
            <Printer className="h-4.5 w-4.5" /> Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}
