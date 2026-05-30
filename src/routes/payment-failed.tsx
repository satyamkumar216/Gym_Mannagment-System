import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { XCircle, ArrowLeft, RefreshCw, Smartphone, CreditCard, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";

export const Route = createFileRoute("/payment-failed")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      refId: (search.refId as string) || `IG-REF-${Math.floor(100000 + Math.random() * 900000)}`,
      plan: (search.plan as string) || "quarterly",
      amount: (search.amount as string) || "₹3,999",
    };
  },
  component: PaymentFailedPage,
});

function PaymentFailedPage() {
  const { refId, plan, amount } = Route.useSearch();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState(false);

  const handleSwitchToGym = () => {
    setSwitching(true);
    setTimeout(() => {
      const usersStr = localStorage.getItem("registered_users");
      const memberStr = localStorage.getItem("logged_in_member");
      
      let updatedUserObj: any = null;

      // 1. Try to update logged_in_member
      if (memberStr) {
        try {
          const memberObj = JSON.parse(memberStr);
          memberObj.paymentMode = "gym";
          memberObj.status = "Pending Payment";
          memberObj.referenceId = refId;
          localStorage.setItem("logged_in_member", JSON.stringify(memberObj));
          updatedUserObj = memberObj;
        } catch (e) {}
      }

      // 2. Try to update in registered_users list
      if (usersStr) {
        try {
          const users = JSON.parse(usersStr);
          // Find matching member or fallback to last registered user
          let index = users.findIndex((u: any) => u.referenceId === refId || u.memberId === refId);
          if (index === -1 && updatedUserObj) {
            index = users.findIndex((u: any) => u.memberId === updatedUserObj.memberId || u.mobile === updatedUserObj.mobile);
          }
          if (index === -1 && users.length > 0) {
            // fallback to last registration if nothing else matched
            index = users.length - 1;
          }

          if (index !== -1) {
            users[index].paymentMode = "gym";
            users[index].status = "Pending Payment";
            users[index].referenceId = refId;
            localStorage.setItem("registered_users", JSON.stringify(users));
            if (!updatedUserObj) {
              updatedUserObj = users[index];
              localStorage.setItem("is_member_logged_in", "true");
              localStorage.setItem("logged_in_member", JSON.stringify(users[index]));
            }
          }
        } catch (e) {}
      }

      setSwitching(false);
      toast.success("Successfully switched to Pay at Gym! Show reference ID at reception.");
      navigate({ to: "/dashboard" });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans select-none">
      
      {/* Red ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-[#E02020] opacity-[0.04] blur-[120px] pointer-events-none" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm rounded-2xl bg-[#111111] border border-[#222222] p-8 shadow-2xl space-y-6 text-center"
      >
        {/* Red X Pulsing Icon */}
        <div className="flex justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.1, 1], opacity: 1 }}
            transition={{ repeat: Infinity, repeatType: "reverse", duration: 2 }}
            className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500"
          >
            <XCircle className="h-9 w-9" />
          </motion.div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] uppercase tracking-widest text-red-500 font-bold">Transaction Failed</span>
          <h1 className="font-display text-2xl uppercase tracking-wide font-bold text-white">Payment Failed</h1>
          <p className="text-xs text-[#8A8A8A]">
            Don't worry — your application is saved. We just couldn't process the transaction charge.
          </p>
        </div>

        {/* Payment Summary Box */}
        <div className="rounded-xl bg-[#0A0A0A] border border-[#222222] p-4 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-[#555555] font-bold uppercase tracking-wider text-[8px]">Reference ID</span>
            <span className="text-white font-mono font-bold tracking-wider">{refId}</span>
          </div>
          <div className="h-px bg-[#222222]/50" />
          <div className="flex justify-between">
            <span className="text-[#555555] font-bold uppercase tracking-wider text-[8px]">Plan Duration</span>
            <span className="text-white font-bold capitalize">{plan} Standard</span>
          </div>
          <div className="h-px bg-[#222222]/50" />
          <div className="flex justify-between">
            <span className="text-[#555555] font-bold uppercase tracking-wider text-[8px]">Amount Dues</span>
            <span className="text-[#E02020] font-bold">{amount}</span>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={() => navigate({ to: "/join" })}
            className="w-full bg-[#E02020] hover:bg-[#C41818] text-white h-10 font-bold uppercase text-xs tracking-wider"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-2" /> Try Again
          </Button>

          <Button
            variant="outline"
            disabled={switching}
            onClick={handleSwitchToGym}
            className="w-full border-[#222222] text-[#CFCFCF] hover:bg-[#1A1A1A] h-10 font-bold uppercase text-xs tracking-wider"
          >
            {switching ? "Processing..." : "Switch to Pay at Gym"}
          </Button>

          <div className="flex items-center justify-between text-[10px] text-[#8A8A8A] pt-2 border-t border-[#222222]/50">
            <span>Dues transaction error</span>
            <a
              href="https://wa.me/919876543210?text=Hello%20IronForge%20Support,%20my%20payment%20failed%20for%20reference%20"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#E02020] hover:underline font-bold flex items-center gap-1.5"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" /> WhatsApp Support
            </a>
          </div>
        </div>
      </motion.div>

      {/* Back link */}
      <Link to="/" className="text-xs text-[#555] hover:text-white transition-colors mt-6 font-medium uppercase tracking-wider flex items-center gap-1">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
      </Link>
    </div>
  );
}
