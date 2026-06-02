import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard, User, Calendar, Receipt, Activity, QrCode, Bell, PhoneCall,
  Dumbbell, LogOut, X, Flame, ShieldAlert, Award, TrendingUp,
  Printer, Download, Share2, MessageCircle, AlertTriangle, CheckCircle2, ChevronRight,
  TrendingDown, MapPin, Eye, FileText, Fingerprint, Check, UserCheck, Lock, History, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Member Dashboard — IronForge Gym" },
      { name: "description", content: "Manage your workouts, view live gym occupancy, download digital pass and manage subscriptions." },
    ],
  }),
  component: MemberDashboard,
});

type TabId = "overview" | "profile" | "attendance" | "billing" | "status" | "idcard" | "notifications" | "support";

interface InvoiceData {
  date: string;
  amount: string;
  plan: string;
  method: string;
  status: string;
  invoiceNo: string;
}

const invoices: InvoiceData[] = [
  { date: "12 Feb 2025", amount: "₹3,999", plan: "Quarterly", method: "UPI (GPay)", status: "Paid", invoiceNo: "INV-2025-0182" },
  { date: "12 Nov 2024", amount: "₹3,999", plan: "Quarterly", method: "UPI (PhonePe)", status: "Paid", invoiceNo: "INV-2024-0842" },
  { date: "12 Aug 2024", amount: "₹1,499", plan: "Monthly", method: "Cash", status: "Paid", invoiceNo: "INV-2024-0417" },
];

const formatDate = (date: Date) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const formatDateLong = (date: Date) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

function MemberDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  const [member, setMember] = useState<any>(null);
  const [firstLoginModal, setFirstLoginModal] = useState(false);

  const [renewalModalOpen, setRenewalModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<"monthly" | "quarterly" | "annual">("quarterly");
  const [renewalStep, setRenewalStep] = useState<"select" | "processing" | "success">("select");
  const [generatedRefId, setGeneratedRefId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "gym" | null>(null);

  const [bellOpen, setBellOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Membership renews in 12 days",
      time: "2 hours ago",
      desc: "Your Quarterly Premium plan expires on 15 August 2025. Clear renewal dues to avoid interruption.",
      color: "border-red-500/20 bg-red-500/5 text-red-400",
      icon: Receipt,
      read: false,
      action: { label: "Renew Now", tab: "billing" as TabId }
    },
    {
      id: 2,
      title: "New Morning HIIT batch starts 2 June",
      time: "1 day ago",
      desc: "Book your slot in the Morning HIIT conditioning batch starting Monday at 6:30 AM. Coach Karan.",
      color: "border-blue-500/20 bg-blue-500/5 text-blue-400",
      icon: Dumbbell,
      read: false,
      action: { label: "Support Ticket", tab: "support" as TabId }
    },
    {
      id: 3,
      title: "You've hit a 5-day streak! Keep going 🔥",
      time: "2 days ago",
      desc: "Incredible consistency! Hit the gym today to lock down day 6. You are in the top 10% of active members this week.",
      color: "border-amber-500/20 bg-amber-500/5 text-amber-500",
      icon: Flame,
      read: false
    },
    {
      id: 4,
      title: "Gym closed on 1 June (Sunday) for maintenance",
      time: "4 days ago",
      desc: "Our facility will remain closed on Sunday, 1st June 2025, for monthly deep cleaning and equipment safety maintenance.",
      color: "border-[#222222] bg-[#111111] text-[#8A8A8A]",
      icon: AlertTriangle,
      read: false
    },
    {
      id: 5,
      title: "Payment of ₹3,999 received on 12 Feb",
      time: "3 months ago",
      desc: "Thank you! We received your Quarterly Premium subscription fee of ₹3,999. Invoice INV-2025-0182 generated.",
      color: "border-emerald-500/20 bg-emerald-500/5 text-emerald-400",
      icon: CheckCircle2,
      read: true,
      action: { label: "View Invoice", tab: "billing" as TabId }
    }
  ]);

  const handleRenewClick = () => {
    navigate({ to: "/dashboard/renew" });
  };

  const handlePayOnline = () => {
    setPaymentMethod("razorpay");
    setRenewalStep("processing");
    setTimeout(() => {
      const priceFormatted = selectedPlanId === "monthly" ? "₹1,499" : selectedPlanId === "annual" ? "₹13,999" : "₹3,999";
      
      const currentExpiry = member?.expiry || member?.validUntil || "15 Aug 2025";
      let expiryDate = new Date(currentExpiry);
      if (isNaN(expiryDate.getTime())) {
        expiryDate = new Date();
      }
      const now = new Date();
      const baseDate = expiryDate > now ? expiryDate : now;
      
      if (selectedPlanId === "monthly") {
        baseDate.setMonth(baseDate.getMonth() + 1);
      } else if (selectedPlanId === "quarterly") {
        baseDate.setMonth(baseDate.getMonth() + 3);
      } else {
        baseDate.setFullYear(baseDate.getFullYear() + 1);
      }
      
      const newExpiryStr = formatDate(baseDate);
      const newExpiryLongStr = formatDateLong(baseDate);
      
      const updated = {
        ...member,
        plan: selectedPlanId,
        planCode: selectedPlanId,
        expiry: newExpiryStr,
        validUntil: newExpiryLongStr,
        paymentMode: "online",
        totalPriceFormatted: priceFormatted,
        status: "Active"
      };
      
      setMember(updated);
      localStorage.setItem("logged_in_member", JSON.stringify(updated));
      
      const usersStr = localStorage.getItem("registered_users");
      if (usersStr) {
        try {
          const users = JSON.parse(usersStr);
          const idx = users.findIndex((u: any) => u.memberId === member.memberId);
          if (idx !== -1) {
            users[idx] = {
              ...users[idx],
              plan: selectedPlanId,
              expiry: newExpiryStr,
              validUntil: newExpiryLongStr,
              paymentMode: "online",
              totalPriceFormatted: priceFormatted,
              status: "Active"
            };
            localStorage.setItem("registered_users", JSON.stringify(users));
          }
        } catch (e) {
          console.error(e);
        }
      }
      
      setRenewalStep("success");
      toast.success("Payment successful! Membership renewed.");
    }, 1500);
  };

  const handlePayAtGym = () => {
    setPaymentMethod("gym");
    const refId = `IG-REF-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedRefId(refId);
    
    const priceFormatted = selectedPlanId === "monthly" ? "₹1,499" : selectedPlanId === "annual" ? "₹13,999" : "₹3,999";
    
    const currentExpiry = member?.expiry || member?.validUntil || "15 Aug 2025";
    let expiryDate = new Date(currentExpiry);
    if (isNaN(expiryDate.getTime())) {
      expiryDate = new Date();
    }
    const now = new Date();
    const baseDate = expiryDate > now ? expiryDate : now;
    
    if (selectedPlanId === "monthly") {
      baseDate.setMonth(baseDate.getMonth() + 1);
    } else if (selectedPlanId === "quarterly") {
      baseDate.setMonth(baseDate.getMonth() + 3);
    } else {
      baseDate.setFullYear(baseDate.getFullYear() + 1);
    }
    
    const newExpiryStr = formatDate(baseDate);
    const newExpiryLongStr = formatDateLong(baseDate);
    
    const updated = {
      ...member,
      plan: selectedPlanId,
      planCode: selectedPlanId,
      expiry: newExpiryStr,
      validUntil: newExpiryLongStr,
      paymentMode: "gym",
      referenceId: refId,
      totalPriceFormatted: priceFormatted,
      status: "Pending Payment"
    };
    
    setMember(updated);
    localStorage.setItem("logged_in_member", JSON.stringify(updated));
    
    const usersStr = localStorage.getItem("registered_users");
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        const idx = users.findIndex((u: any) => u.memberId === member.memberId);
        if (idx !== -1) {
          users[idx] = {
            ...users[idx],
            plan: selectedPlanId,
            expiry: newExpiryStr,
            validUntil: newExpiryLongStr,
            paymentMode: "gym",
            referenceId: refId,
            totalPriceFormatted: priceFormatted,
            status: "Pending Payment"
          };
          localStorage.setItem("registered_users", JSON.stringify(users));
        }
      } catch (e) {
        console.error(e);
      }
    }
    
    setRenewalStep("success");
    toast.success("Reference ID generated! Please pay at the gym reception.");
  };

  useEffect(() => {
    // Check if member is logged in
    const isLoggedIn = localStorage.getItem("is_member_logged_in");
    if (!isLoggedIn) {
      navigate({ to: "/login" });
      return;
    }

    const memberStr = localStorage.getItem("logged_in_member");
    const usersStr = localStorage.getItem("registered_users");
    
    if (memberStr) {
      try {
        let data = JSON.parse(memberStr);
        
        // Sync from registered_users dynamically if found
        if (usersStr) {
          const users = JSON.parse(usersStr);
          const dbUser = users.find((u: any) => u.memberId === data.memberId || u.mobile === data.mobile);
          if (dbUser) {
            data = {
              ...data,
              status: dbUser.status,
              rejectionReason: dbUser.rejectionReason,
              suspensionReason: dbUser.suspensionReason,
              expiry: dbUser.expiry || dbUser.validUntil || data.expiry,
              validUntil: dbUser.validUntil || dbUser.expiry || data.validUntil
            };
            localStorage.setItem("logged_in_member", JSON.stringify(data));
          }
        }

        setMember(data);
        if (data.isFirstLogin) {
          setFirstLoginModal(true);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, [navigate]);

  const closeWelcomeModal = () => {
    setFirstLoginModal(false);
    if (member) {
      const updated = { ...member, isFirstLogin: false };
      setMember(updated);
      localStorage.setItem("logged_in_member", JSON.stringify(updated));
    }
    setActiveTab("profile");
    toast.success("Let's complete your profile details!");
  };

  // Quick stats
  const stats = useMemo(() => {
    if (!member) {
      return {
        name: "Rahul Sharma",
        memberId: "IG-2024-0042",
        plan: "Quarterly Premium",
        validUntil: "15 August 2025",
        joined: "12 February 2024",
        mobile: "+91 98765 43210",
        daysActiveThisMonth: 18,
        streak: 5,
        totalSessions: 68,
        avgSessionTime: "1h 35m",
        bestStreak: 12
      };
    }
    return {
      name: member.fullName || "Rahul Sharma",
      memberId: member.memberId || "IG-2024-0042",
      plan: member.plan === "quarterly" ? "Quarterly Premium" : member.plan === "annual" ? "Annual Elite" : member.plan === "monthly" ? "Monthly Standard" : member.plan,
      validUntil: member.validUntil || "15 August 2025",
      joined: member.joined || "12 February 2024",
      mobile: member.mobile || "+91 98765 43210",
      daysActiveThisMonth: 18,
      streak: 5,
      totalSessions: 68,
      avgSessionTime: "1h 35m",
      bestStreak: 12
    };
  }, [member]);

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "profile", label: "My Profile", icon: User },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "billing", label: "Membership & Billing", icon: Receipt },
    { id: "renewals", label: "Renewal History", icon: History, navTo: "/dashboard/renewals" as const },
    { id: "status", label: "Live Gym Status", icon: Activity },
    { id: "idcard", label: "Digital ID Card", icon: QrCode },
    { id: "notifications", label: "Notifications", icon: Bell, badge: notifications.filter(n => !n.read).length },
    { id: "support", label: "Contact & Support", icon: PhoneCall },
  ] as const;

  const handleLogout = () => {
    localStorage.removeItem("is_member_logged_in");
    localStorage.removeItem("logged_in_member");
    toast.success("Successfully logged out");
    navigate({ to: "/login" });
  };

  const handleInvoiceDownload = (invoice: InvoiceData) => {
    const cgst = Math.floor((parseInt(invoice.amount.replace(/\D/g, "")) * 0.09));
    const sgst = cgst;
    const baseAmount = parseInt(invoice.amount.replace(/\D/g, "")) - (cgst + sgst);
    
    const invoiceText = `================================================
IRONFORGE GYM HYDERABAD - TAX INVOICE
================================================
Invoice No: ${invoice.invoiceNo}
Date: ${invoice.date}
Payment Status: ${invoice.status.toUpperCase()}

BILL TO:
Name: ${stats.name}
Member ID: ${stats.memberId}
Mobile: ${stats.mobile}

DESCRIPTION:
IronForge Gym ${invoice.plan} Access Subscription

BREAKDOWN:
Base Subscription Cost: ₹${baseAmount.toLocaleString("en-IN")}
CGST (9%):              ₹${cgst.toLocaleString("en-IN")}
SGST (9%):              ₹${sgst.toLocaleString("en-IN")}
------------------------------------------------
TOTAL INCLUSIVE OF GST: ${invoice.amount}
------------------------------------------------
Payment Method:         ${invoice.method}

COMPANY DETAILS:
IronForge Gym, Plot 42, Road 5,
Banjara Hills, Hyderabad - 500034.
GSTIN: 36AAAAI4284P1Z3
================================================
Thank you for training with us!
`;
    const blob = new Blob([invoiceText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `IronForge_Invoice_${invoice.invoiceNo}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("GST Invoice downloaded successfully!");
  };

  const graceInfo = useMemo(() => {
    if (!member || !member.expiry) {
      return { expired: false, graceActive: false, daysElapsed: 0, daysLeft: 0, daysSinceGraceEnded: 0 };
    }
    const expiryDate = new Date(member.expiry);
    if (isNaN(expiryDate.getTime())) {
      return { expired: false, graceActive: false, daysElapsed: 0, daysLeft: 0, daysSinceGraceEnded: 0 };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - expiry.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return { expired: false, graceActive: false, daysElapsed: 0, daysLeft: 0, daysSinceGraceEnded: 0 };
    }

    const gracePeriodDays = 7;
    const graceActive = diffDays <= gracePeriodDays;
    return {
      expired: true,
      graceActive,
      daysElapsed: diffDays,
      daysLeft: Math.max(0, gracePeriodDays - diffDays),
      daysSinceGraceEnded: Math.max(0, diffDays - gracePeriodDays),
    };
  }, [member]);

  if (member) {
    if (member.status === "Suspended") {
      return <SuspendedScreen member={member} handleLogout={handleLogout} />;
    }
    if (member.status === "Rejected") {
      return <RejectedScreen member={member} handleLogout={handleLogout} />;
    }
    if (member.status === "Expired" || (graceInfo.expired && !graceInfo.graceActive)) {
      return (
        <ExpiredScreen
          member={member}
          grace={graceInfo}
          handleLogout={handleLogout}
          onRenewClick={handleRenewClick}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row relative overflow-x-hidden">
      
      <header className="md:hidden flex items-center justify-between bg-[#0A0A0A] border-b border-[#1A1A1A] px-4 py-4 shrink-0 z-20">
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-[#E02020] flex items-center justify-center shrink-0">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg tracking-wide uppercase truncate">IronForge</span>
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setBellOpen(!bellOpen)}
            className="relative touch-target flex items-center justify-center text-[#8A8A8A] hover:text-white transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-2 right-2 h-4 w-4 rounded-full bg-[#E02020] text-white text-[8px] flex items-center justify-center font-bold">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          <Link to="/dashboard/settings" className="relative touch-target flex items-center justify-center text-[#8A8A8A] hover:text-white transition-colors">
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </header>

      {/* Sidebar navigation — desktop only; mobile uses bottom nav */}
      <aside className="hidden md:flex md:flex-col inset-y-0 left-0 w-64 bg-[#0A0A0A] border-r border-[#1A1A1A] justify-between p-6 shrink-0 z-30">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-[#E02020] flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl tracking-wide uppercase">IronForge Gym</span>
            </Link>
          </div>

          <nav className="space-y-1.5 pt-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              const navTo = (item as any).navTo as string | undefined;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (navTo) {
                      navigate({ to: navTo as any });
                    } else {
                      setActiveTab(item.id as any);
                    }
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    active
                      ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                      : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {("badge" in item) && (item as any).badge && !active && (
                    <span className="h-5 w-5 rounded-full bg-[#E02020]/20 border border-[#E02020]/30 text-[#E02020] text-[10px] flex items-center justify-center font-bold">
                      {(item as any).badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-[#1A1A1A] pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-9 w-9 rounded-full bg-[#E02020]/10 border border-[#E02020]/30 flex items-center justify-center text-sm font-bold text-[#E02020]">
              RS
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate">{stats.name}</div>
              <div className="text-xs text-[#8A8A8A] truncate">{stats.memberId}</div>
            </div>
          </div>
          <Link to="/dashboard/settings" className="block mb-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-[#8A8A8A] hover:text-white hover:bg-[#1A1A1A] p-2 h-9 text-xs font-semibold"
            >
              <Settings className="h-4 w-4 mr-2 text-[#E02020]" /> Settings
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-[#8A8A8A] hover:text-white hover:bg-[#1A1A1A] p-2 h-9 text-xs font-semibold"
          >
            <LogOut className="h-4 w-4 mr-2 text-[#E02020]" /> Log Out
          </Button>
        </div>
      </aside>

      {/* Content wrapper */}
      <div className="flex-1 bg-[#111111] min-w-0 flex flex-col justify-between min-h-[calc(100vh-65px)] md:min-h-screen pb-[70px] md:pb-0 relative">
        
        {/* Grace Period Warning Banner */}
        {member && graceInfo.expired && graceInfo.graceActive && !bannerDismissed && (
          <div className="bg-[#E02020] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between gap-4 select-none shrink-0 z-40 animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span>⚠️ Membership expired {graceInfo.daysElapsed} {graceInfo.daysElapsed === 1 ? "day" : "days"} ago. Grace period ends in {graceInfo.daysLeft} {graceInfo.daysLeft === 1 ? "day" : "days"}. Renew now.</span>
              <button 
                onClick={handleRenewClick} 
                className="px-2.5 py-0.5 bg-white text-[#E02020] rounded font-bold text-[9px] hover:bg-white/90 transition-colors cursor-pointer uppercase tracking-wider"
              >
                Renew
              </button>
            </div>
            <button 
              onClick={() => setBannerDismissed(true)} 
              className="text-white hover:text-white/80 p-0.5 cursor-pointer bg-transparent border-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {/* Desktop Top Header */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#0A0A0A] border-b border-[#1A1A1A] shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg tracking-wide uppercase text-white font-bold">Member Workspace</span>
            <span className="text-[#E02020] text-[9px] font-bold px-2 py-0.5 rounded bg-[#E02020]/10 border border-[#E02020]/20 font-mono font-bold uppercase tracking-wider">MEMBER WORKSPACE</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setBellOpen(!bellOpen)}
              className="relative p-2 text-[#8A8A8A] hover:text-white hover:bg-[#111111] rounded-lg transition-colors cursor-pointer"
              title="System Alerts"
            >
              <Bell className="h-5 w-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-[#E02020] text-white text-[8px] flex items-center justify-center font-bold border-2 border-[#0A0A0A]">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>

            {/* Profile Info */}
            <div className="flex items-center gap-3 border-l border-[#1A1A1A] pl-6">
              <div className="text-right">
                <div className="font-semibold text-xs text-white">{stats.name}</div>
                <div className="text-[10px] text-[#8A8A8A]">{stats.memberId}</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#E02020]/10 border border-[#E02020]/30 flex items-center justify-center font-bold text-xs text-[#E02020]">
                {stats.name ? stats.name.split(" ").map((n: any) => n[0]).join("") : "RS"}
              </div>
            </div>
          </div>
        </header>

        {/* Notifications Dropdown Panel */}
        <AnimatePresence>
          {bellOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setBellOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-4 md:right-8 top-[60px] md:top-[70px] w-80 bg-[#111111] border border-[#222222] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
              >
                <div className="bg-[#0A0A0A] border-b border-[#222222] px-4 py-3 flex items-center justify-between">
                  <h3 className="font-display text-sm text-white font-bold uppercase tracking-wider">Notifications</h3>
                  <button
                    onClick={() => {
                      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                      toast.success("All notifications marked as read");
                    }}
                    className="text-[10px] text-[#E02020] hover:underline font-bold uppercase cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#222222]">
                  {notifications.slice(0, 5).map((n) => {
                    const IconComponent = n.icon;
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                          if (n.action) {
                            setActiveTab(n.action.tab);
                          }
                          setBellOpen(false);
                        }}
                        className={cn(
                          "p-3.5 space-y-1 transition-colors cursor-pointer text-left",
                          n.read ? "bg-transparent hover:bg-[#1A1A1A]/30" : "bg-[#E02020]/5 hover:bg-[#E02020]/10"
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={cn(
                            "h-7 w-7 rounded-md border flex items-center justify-center shrink-0 mt-0.5",
                            n.color ? n.color.split(" ")[0] + " " + n.color.split(" ")[1] : "border-[#222222] bg-[#111111]"
                          )}>
                            <IconComponent className={cn("h-3.5 w-3.5", n.color ? n.color.split(" ")[2] : "text-[#8A8A8A]")} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white leading-tight break-words pr-2">{n.title}</p>
                            <p className="text-[10px] text-[#8A8A8A] mt-0.5 line-clamp-2 leading-relaxed">{n.desc}</p>
                            <span className="text-[9px] text-[#555555] block mt-1">{n.time}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {notifications.length === 0 && (
                    <div className="p-8 text-center text-xs text-[#555555]">
                      No notifications
                    </div>
                  )}
                </div>

                <div className="bg-[#0A0A0A] border-t border-[#222222] px-4 py-2.5 text-center">
                  <button
                    onClick={() => {
                      setActiveTab("notifications");
                      setBellOpen(false);
                    }}
                    className="text-xs text-[#E02020] hover:underline font-bold uppercase tracking-wide cursor-pointer"
                  >
                    View all notifications
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="p-4 sm:p-6 md:p-8 space-y-6 flex-1 min-w-0 overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "overview" && <TabOverview stats={stats} setActiveTab={setActiveTab} onRenewClick={handleRenewClick} />}
              {activeTab === "profile" && <TabProfile stats={stats} />}
              {activeTab === "attendance" && <TabAttendance stats={stats} />}
              {activeTab === "billing" && (
                <TabBilling
                  stats={stats}
                  selectedInvoice={selectedInvoice}
                  setSelectedInvoice={setSelectedInvoice}
                  handleInvoiceDownload={handleInvoiceDownload}
                  onRenewClick={handleRenewClick}
                />
              )}
              {activeTab === "status" && <TabLiveStatus />}
              {activeTab === "idcard" && <TabIdCard stats={stats} />}
              {activeTab === "notifications" && (
                <TabNotifications
                  setActiveTab={setActiveTab}
                  onRenewClick={handleRenewClick}
                  notifications={notifications}
                  setNotifications={setNotifications}
                />
              )}
              {activeTab === "support" && <TabSupport />}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="border-t border-[#1A1A1A] bg-[#0A0A0A]/50 py-4 px-6 md:px-8 text-center md:text-left flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#555555]">
          <div>© {new Date().getFullYear()} IronForge Gym. All rights reserved.</div>
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-white transition-colors">About Us</Link>
            <Link to="/plans" className="hover:text-white transition-colors">Plans</Link>
            <Link to="/trainers" className="hover:text-white transition-colors">Trainers</Link>
            <Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </footer>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 inset-x-0 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-[#1A1A1A] px-2 py-2 md:hidden z-40 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2">
          <div className="flex items-center justify-between max-w-lg mx-auto w-full">
            {[
              { id: "overview", label: "Home", icon: LayoutDashboard },
              { id: "attendance", label: "Attendance", icon: Calendar },
              { id: "status", label: "Gym Status", icon: Activity },
              { id: "idcard", label: "ID Card", icon: QrCode },
              { id: "profile", label: "Profile", icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabId)}
                  className="relative flex flex-col items-center justify-center py-1 flex-1 text-center cursor-pointer select-none min-h-[44px] touch-target-inline"
                >
                  {active && (
                    <motion.div
                      layoutId="activeTabMobile"
                      className="absolute -top-2 w-12 h-1 bg-[#E02020] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={cn("h-5 w-5 transition-colors", active ? "text-[#E02020]" : "text-[#8A8A8A]")} />
                  <span className={cn("text-[9px] font-bold tracking-wide mt-1 uppercase", active ? "text-white" : "text-[#8A8A8A]")}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* First Login Welcome Modal */}
      {firstLoginModal && (
        <div className="modal-overlay z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="modal-sheet rounded-2xl"
          >
            <div className="bg-[#0A0A0A] border-b border-[#222222] px-6 py-5 text-center relative">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                <UserCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="font-display text-xl sm:text-2xl text-white tracking-wide uppercase break-words">Your membership is now ACTIVE! 🎉</h3>
              <p className="text-xs text-[#8A8A8A] mt-1">Welcome to the IronForge family</p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-3 bg-[#0A0A0A] border border-[#222222] rounded-xl p-4">
                <div className="flex justify-between pb-2 border-b border-[#1A1A1A]">
                  <span className="text-[#8A8A8A] uppercase text-[9px] tracking-wider">Member Name</span>
                  <span className="font-bold text-white">{stats.name}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#1A1A1A]">
                  <span className="text-[#8A8A8A] uppercase text-[9px] tracking-wider">Member ID</span>
                  <span className="font-mono text-white">{stats.memberId}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-[#1A1A1A]">
                  <span className="text-[#8A8A8A] uppercase text-[9px] tracking-wider">Subscription Plan</span>
                  <span className="font-semibold text-white uppercase">{stats.plan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8A8A8A] uppercase text-[9px] tracking-wider">Valid Until</span>
                  <span className="font-bold text-[#E02020]">{stats.validUntil}</span>
                </div>
              </div>

              <p className="text-[#8A8A8A] text-center leading-normal">
                Let's set up your profile and health metrics (height, weight, emergency contact, etc.) to get you onboarded with our coaches.
              </p>
            </div>

            <div className="bg-[#0A0A0A] border-t border-[#222222] px-6 py-4">
              <Button
                onClick={closeWelcomeModal}
                className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-11 text-xs uppercase"
              >
                Let's set up your profile
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Renewal Modal */}
      {renewalModalOpen && (
        <div className="modal-overlay z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="modal-sheet max-w-lg rounded-2xl text-xs"
          >
            {/* Modal Header */}
            <div className="bg-[#0A0A0A] border-b border-[#222222] px-6 py-5 flex items-center justify-between flex-shrink-0">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">Membership Portal</span>
                <h3 className="font-display text-2xl text-white tracking-wide uppercase mt-0.5">Renew Membership</h3>
              </div>
              {renewalStep !== "processing" && (
                <button
                  onClick={() => setRenewalModalOpen(false)}
                  className="text-[#8A8A8A] hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Modal Body */}
            {renewalStep === "select" && (
              <div className="p-6 space-y-6">
                {/* Current Plan Status */}
                <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Current Active Plan</span>
                    <div className="font-display text-base text-white font-bold uppercase mt-0.5">{stats.plan}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Expiry Date</span>
                    <div className="text-xs text-[#E02020] font-bold mt-0.5">{stats.validUntil}</div>
                  </div>
                </div>

                {/* Plan Selection */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold block">Select Plan Duration</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "monthly", name: "Monthly", price: 1499, desc: "Standard access" },
                      { id: "quarterly", name: "Quarterly", price: 3999, desc: "Save 11%" },
                      { id: "annual", name: "Annual", price: 13999, desc: "Save 22%" }
                    ].map((p) => {
                      const selected = selectedPlanId === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => setSelectedPlanId(p.id as any)}
                          className={cn(
                            "rounded-xl border p-4 text-center cursor-pointer transition-all hover:scale-[1.02]",
                            selected
                              ? "bg-[#E02020]/10 border-[#E02020] shadow-md shadow-[#E02020]/5"
                              : "bg-[#0A0A0A] border-[#222222] hover:border-[#444444]"
                          )}
                        >
                          <span className="font-bold text-xs block text-white">{p.name}</span>
                          <span className="font-display text-base font-bold text-white block mt-1">₹{p.price.toLocaleString("en-IN")}</span>
                          <span className="text-[9px] text-[#8A8A8A] mt-0.5 block">{p.desc}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl p-4 space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold block pb-1 border-b border-[#1A1A1A]">Payment Summary</span>
                  <div className="flex justify-between text-[#8A8A8A]">
                    <span>Base Membership Cost</span>
                    <span>₹{(selectedPlanId === "monthly" ? 1270 : selectedPlanId === "annual" ? 11864 : 3389).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-[#8A8A8A]">
                    <span>Integrated GST @ 18%</span>
                    <span>₹{(selectedPlanId === "monthly" ? 229 : selectedPlanId === "annual" ? 2135 : 610).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="border-t border-[#1A1A1A] pt-2 flex justify-between font-bold text-sm text-white">
                    <span className="uppercase text-xs tracking-wider">Total Amount Due</span>
                    <span className="text-[#E02020]">
                      ₹{(selectedPlanId === "monthly" ? 1499 : selectedPlanId === "annual" ? 13999 : 3999).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-[#1A1A1A]">
                  <Button
                    onClick={handlePayOnline}
                    className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-11 text-xs uppercase"
                  >
                    Pay via Razorpay
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handlePayAtGym}
                    className="w-full border-[#222222] bg-[#0A0A0A] text-white hover:bg-[#1A1A1A] font-bold h-11 text-xs uppercase"
                  >
                    Pay cash at Gym
                  </Button>
                </div>
              </div>
            )}

            {renewalStep === "processing" && (
              <div className="p-12 text-center space-y-4">
                <div className="h-12 w-12 rounded-full border-2 border-t-[#E02020] border-[#222222] animate-spin mx-auto animate-duration-1000" />
                <div className="space-y-1">
                  <h4 className="font-bold text-white uppercase tracking-wider text-xs">Processing Payment</h4>
                  <p className="text-[#8A8A8A]">Please do not refresh the page or close the browser window.</p>
                </div>
              </div>
            )}

            {renewalStep === "success" && (
              <div className="p-6 space-y-6 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-display text-2xl text-white tracking-wide uppercase">Renewal Successful! 🎉</h3>
                  {paymentMethod === "gym" ? (
                    <div className="space-y-3 pt-2">
                      <p className="text-[#8A8A8A] leading-relaxed">
                        A cash renewal reference has been generated. Please present this code to the receptionist during check-in to activate your extension.
                      </p>
                      <div className="rounded-xl border border-dashed border-[#E02020]/40 bg-[#E02020]/5 p-4 inline-block font-mono text-lg font-bold text-white tracking-wider select-all cursor-pointer">
                        {generatedRefId}
                      </div>
                      <p className="text-[10px] text-[#555555]">
                        Reference ID updated in dashboard profile storage. Dues: ₹{(selectedPlanId === "monthly" ? 1499 : selectedPlanId === "annual" ? 13999 : 3999).toLocaleString("en-IN")}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[#8A8A8A]">
                      Your payment has been verified. Your membership has been successfully extended. Thank you for training with IronForge!
                    </p>
                  )}
                </div>

                <div className="space-y-3 bg-[#0A0A0A] border border-[#222222] rounded-xl p-4 text-left">
                  <div className="flex justify-between pb-2 border-b border-[#1A1A1A]">
                    <span className="text-[#8A8A8A] uppercase text-[9px] tracking-wider">New Subscription Plan</span>
                    <span className="font-bold text-white uppercase">{selectedPlanId === "monthly" ? "Monthly Standard" : selectedPlanId === "annual" ? "Annual Elite" : "Quarterly Premium"}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-[#1A1A1A]">
                    <span className="text-[#8A8A8A] uppercase text-[9px] tracking-wider">Amount Paid/Due</span>
                    <span className="font-bold text-white">₹{(selectedPlanId === "monthly" ? 1499 : selectedPlanId === "annual" ? 13999 : 3999).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8A8A8A] uppercase text-[9px] tracking-wider">New Expiry Date</span>
                    <span className="font-bold text-[#E02020]">{member?.validUntil}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    onClick={() => setRenewalModalOpen(false)}
                    className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-11 text-xs uppercase"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

    </div>
  );
}

// ================= TAB 1: OVERVIEW =================
function TabOverview({ stats, setActiveTab, onRenewClick }: { stats: any; setActiveTab: (t: TabId) => void; onRenewClick: () => void }) {
  const attendanceMock = Array.from({ length: 30 }, (_, i) => {
    const isWeekend = i % 7 === 0 || i % 7 === 6;
    const value = isWeekend ? (Math.random() > 0.85 ? 40 : 0) : Math.floor(Math.random() * 45) + 60;
    return { day: i + 1, mins: value };
  });

  const biometricStatus = useMemo(() => {
    const usersStr = localStorage.getItem("registered_users");
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        const matched = users.find((u: any) => u.memberId === stats.memberId);
        if (matched && matched.biometric) {
          return matched.biometric;
        }
      } catch (e) {
        console.error(e);
      }
    }
    const notSetNames = ["Sneha Reddy", "Vikram Singh", "Arjun Mehta", "Rohit Gupta", "Meera Joshi"];
    if (notSetNames.includes(stats.name)) {
      return "Not Set";
    }
    return "Registered";
  }, [stats.memberId, stats.name]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl tracking-wide uppercase text-white break-words">Welcome back, {stats.name.split(" ")[0]} 💪</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">Consistency is key. Ready for today's lift?</p>
        </div>
        <Badge className="bg-[#E02020]/10 text-[#E02020] border border-[#E02020]/20 hover:bg-[#E02020]/10 px-2.5 py-1 text-xs uppercase tracking-wider font-bold">
          Active Member
        </Badge>
      </div>

      {biometricStatus === "Not Set" ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3 animate-pulse text-xs">
          <div className="h-9 w-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">⚠️ Fingerprint Not Registered</h4>
            <p className="text-[#CFCFCF]">You cannot enter the gym until you register your fingerprint at reception.</p>
            <p className="text-[#8A8A8A]">Visit reception and ask staff to register your biometric.</p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3 text-xs">
          <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">✅ Gym Access Active</h4>
            <p className="text-[#CFCFCF]">Your fingerprint is registered. Walk in anytime during gym hours.</p>
            <p className="text-[#8A8A8A]">Last entry: Today 6:14 AM</p>
          </div>
        </div>
      )}

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Active This Month</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-bold text-white">{stats.daysActiveThisMonth}</span>
            <span className="text-xs text-[#8A8A8A]">days</span>
          </div>
          <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> +15% vs last month
          </div>
        </div>

        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Current Streak</span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-bold text-white">{stats.streak}</span>
            <span className="text-xs text-[#8A8A8A]">days</span>
          </div>
          <div className="text-[10px] text-amber-500 font-medium flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> Keep crushing it!
          </div>
        </div>

        <Link
          to="/dashboard/renew"
          className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 space-y-1 hover:border-[#E02020]/50 transition-colors group relative block"
        >
          <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold group-hover:text-white transition-colors">Valid Until</span>
          <div className="font-display text-3xl font-bold text-white tracking-wide truncate">{stats.validUntil ? String(stats.validUntil).toUpperCase() : "15 AUG 2025"}</div>
          <div className="text-[10px] text-red-500 font-medium flex items-center justify-between">
            <span>Renews soon</span>
            <span className="text-[#E02020] opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase text-[9px]">Renew Now &rarr;</span>
          </div>
        </Link>

        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Active Plan</span>
          <div className="font-display text-2xl font-bold text-white tracking-wide truncate uppercase pt-1">{stats.plan}</div>
          <div className="text-[10px] text-[#8A8A8A]">
            Joined {stats.joined}
          </div>
        </div>
      </div>

      {/* Biometric Status Card */}
      <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 flex items-center gap-3.5">
        <div className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border",
          biometricStatus === "Not Set" ? "bg-red-500/10 border-red-500/25 text-red-500" : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
        )}>
          <Fingerprint className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold block">Biometric Access</span>
          {biometricStatus === "Not Set" ? (
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>❌ Not registered — Visit reception to register</span>
              </div>
              <p className="text-xs text-red-500/80">Without biometric you cannot enter the gym</p>
            </div>
          ) : (
            <div className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>✅ Fingerprint registered — Gym entry enabled</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Card */}
        <div className="lg:col-span-2 rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg tracking-wide uppercase text-white">Daily Workout Duration</h3>
              <p className="text-xs text-[#8A8A8A]">Minutes spent in gym over the last 30 days</p>
            </div>
            <Badge variant="outline" className="border-[#222222] text-[#8A8A8A] font-normal text-[10px]">
              Avg: {stats.avgSessionTime}
            </Badge>
          </div>

          {/* Simple custom HTML/CSS bar graph */}
          <div className="h-28 sm:h-36 md:h-44 w-full flex items-end justify-between gap-0.5 sm:gap-1.5 pt-4 overflow-hidden">
            {attendanceMock.map((item) => (
              <div key={item.day} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#111111] border border-[#222222] rounded px-2 py-0.5 text-[9px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  Day {item.day}: {item.mins > 0 ? `${item.mins} mins` : "Rest"}
                </div>
                
                <div
                  className={cn(
                    "w-full rounded-t-[2px] transition-all duration-300",
                    item.mins > 0 ? "bg-[#E02020] hover:bg-white" : "bg-[#222222] h-[4px]"
                  )}
                  style={{ height: item.mins > 0 ? `${(item.mins / 120) * 100}%` : "4px" }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-[#555555] uppercase tracking-widest font-bold pt-1">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>

        {/* Notifications Preview */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg tracking-wide uppercase text-white">Updates</h3>
              <Bell className="h-4 w-4 text-[#8A8A8A]" />
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-[#E02020]/5 border border-[#E02020]/20 p-3.5 space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-[#E02020] font-bold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E02020] animate-pulse" />
                  Subscription Expiry
                </div>
                <p className="text-xs text-white font-medium">Your Quarterly Premium membership renews in 12 days.</p>
              </div>

              <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-3.5 space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">New Batch Announcement</div>
                <p className="text-xs text-[#CFCFCF]">Morning HIIT workouts start this Monday at 6:30 AM.</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("notifications")}
            className="text-xs text-[#E02020] hover:underline font-semibold flex items-center gap-1 mt-4 group"
          >
            Go to Notifications <ChevronRight className="h-3 w.3 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ================= TAB 2: ATTENDANCE =================
function TabAttendance({ stats }: { stats: any }) {
  // Generate mock dates for heat map
  // Feb-May 2025: Let's lay out 17 weeks.
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  
  // Custom mock data representing workout density (0 to 3 scale)
  // 17 weeks x 7 days = 119 boxes
  const heatMapData = useMemo(() => {
    return Array.from({ length: 119 }, (_, i) => {
      // Create gaps and realistic distribution
      const isWeekend = i % 7 === 0 || i % 7 === 6;
      if (isWeekend) {
        return Math.random() > 0.9 ? 2 : 0;
      }
      const rand = Math.random();
      if (rand > 0.8) return 3; // Red hot session
      if (rand > 0.5) return 2; // Mid session
      if (rand > 0.25) return 1; // Light session
      return 0; // Missed day
    });
  }, []);

  const historyRows = [
    { date: "28 May 2025", checkIn: "6:14 AM", checkOut: "7:52 AM", duration: "1h 38m" },
    { date: "26 May 2025", checkIn: "6:02 AM", checkOut: "7:45 AM", duration: "1h 43m" },
    { date: "24 May 2025", checkIn: "5:58 AM", checkOut: "7:30 AM", duration: "1h 32m" },
    { date: "23 May 2025", checkIn: "6:10 AM", checkOut: "7:40 AM", duration: "1h 30m" },
    { date: "21 May 2025", checkIn: "6:05 AM", checkOut: "7:38 AM", duration: "1h 33m" },
    { date: "19 May 2025", checkIn: "5:55 AM", checkOut: "7:42 AM", duration: "1h 47m" },
    { date: "17 May 2025", checkIn: "6:00 AM", checkOut: "7:35 AM", duration: "1h 35m" },
    { date: "16 May 2025", checkIn: "6:12 AM", checkOut: "7:45 AM", duration: "1h 33m" },
    { date: "14 May 2025", checkIn: "6:03 AM", checkOut: "7:48 AM", duration: "1h 45m" },
    { date: "12 May 2025", checkIn: "5:59 AM", checkOut: "7:32 AM", duration: "1h 33m" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white">Attendance Logs</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Review check-in history, heatmaps, and session benchmarks.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Total Sessions</div>
          <div className="font-display text-3xl font-bold text-white mt-1">{stats.totalSessions}</div>
          <div className="text-[10px] text-[#8A8A8A] mt-0.5">lifetime visits</div>
        </div>

        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Average Session</div>
          <div className="font-display text-3xl font-bold text-white mt-1">{stats.avgSessionTime}</div>
          <div className="text-[10px] text-[#8A8A8A] mt-0.5">time spent / visit</div>
        </div>

        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Best Streak</div>
          <div className="font-display text-3xl font-bold text-white mt-1">{stats.bestStreak}</div>
          <div className="text-[10px] text-[#8A8A8A] mt-0.5">days in a row</div>
        </div>

        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Visits This Month</div>
          <div className="font-display text-3xl font-bold text-white mt-1">{stats.daysActiveThisMonth}</div>
          <div className="text-[10px] text-[#8A8A8A] mt-0.5">sessions in May</div>
        </div>
      </div>

      {/* GitHub Heatmap Card */}
      <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
        <div>
          <h3 className="font-display text-lg tracking-wide uppercase text-white">Activity Heatmap</h3>
          <p className="text-xs text-[#8A8A8A]">Workout density map from February to May 2025</p>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 pt-2 scrollbar-thin">
          {/* Calendar Labels */}
          <div className="grid grid-rows-7 gap-1 text-[9px] text-[#555555] font-semibold uppercase justify-center pt-5">
            {daysOfWeek.map((d, idx) => (
              <span key={idx} className="h-[12px] flex items-center">{d}</span>
            ))}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex text-[9px] text-[#8A8A8A] uppercase font-bold justify-between max-w-[400px]">
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
            </div>

            {/* Grid layout containing 17 columns of 7 elements */}
            <div className="grid grid-flow-col grid-rows-7 gap-1 auto-cols-max">
              {heatMapData.map((val, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "w-[12px] h-[12px] rounded-[1px] transition-colors hover:scale-110",
                    val === 0 && "bg-[#1A1A1A] hover:bg-[#252525]",
                    val === 1 && "bg-[#6A1515] hover:bg-red-900",
                    val === 2 && "bg-[#A81A1A] hover:bg-red-700",
                    val === 3 && "bg-[#E02020] hover:bg-white"
                  )}
                  title={`Workout level ${val}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5 text-[9px] text-[#555555] uppercase font-semibold">
          <span>Less</span>
          <div className="w-[10px] h-[10px] bg-[#1A1A1A] rounded-[1px]" />
          <div className="w-[10px] h-[10px] bg-[#6A1515] rounded-[1px]" />
          <div className="w-[10px] h-[10px] bg-[#A81A1A] rounded-[1px]" />
          <div className="w-[10px] h-[10px] bg-[#E02020] rounded-[1px]" />
          <span>More</span>
        </div>
      </div>

      {/* History table */}
      <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1A1A1A] flex justify-between items-center bg-[#0C0C0C]">
          <h3 className="font-display text-lg tracking-wide uppercase text-white">Recent Workouts</h3>
          <Badge variant="outline" className="border-[#222222] text-[#8A8A8A] font-normal text-[10px]">Showing latest 10</Badge>
        </div>

        <div className="overflow-x-auto -mx-px">
          <table className="w-full min-w-[480px] text-left border-collapse text-xs text-[#CFCFCF] table-sticky-first">
            <thead>
              <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
                <th className="px-4 sm:px-6 py-3.5 whitespace-nowrap">Date</th>
                <th className="px-4 sm:px-6 py-3.5 whitespace-nowrap">Check In</th>
                <th className="px-4 sm:px-6 py-3.5 whitespace-nowrap hide-col-mobile">Check Out</th>
                <th className="px-4 sm:px-6 py-3.5 whitespace-nowrap">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {historyRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#111111]/80 transition-colors">
                  <td className="px-4 sm:px-6 py-3.5 font-medium text-white whitespace-nowrap">{row.date}</td>
                  <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">{row.checkIn}</td>
                  <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap hide-col-mobile">{row.checkOut}</td>
                  <td className="px-4 sm:px-6 py-3.5 whitespace-nowrap">
                    <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/5 py-0.5">
                      {row.duration}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ================= TAB 3: MEMBERSHIP & BILLING =================
function TabBilling({
  stats, selectedInvoice, setSelectedInvoice, handleInvoiceDownload, onRenewClick
}: {
  stats: any;
  selectedInvoice: InvoiceData | null;
  setSelectedInvoice: (i: InvoiceData | null) => void;
  handleInvoiceDownload: (i: InvoiceData) => void;
  onRenewClick: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white">Membership & Billing</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Manage active plans, billing statements, and print tax invoices.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active plan card */}
        <div className="lg:col-span-2 rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-6 relative overflow-hidden flex flex-col justify-between">
          {/* Ambient red border accent */}
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-[#E02020] opacity-5 blur-[80px]" />
          
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">Active Gym Plan</span>
                <h2 className="font-display text-3xl text-white tracking-wide mt-1 uppercase">{stats.plan}</h2>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 text-xs px-2.5 py-0.5">
                Paid
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <div className="text-[10px] text-[#8A8A8A] uppercase font-semibold">Price</div>
                <div className="font-display text-2xl text-white font-semibold mt-0.5">
                  {stats.plan === "Monthly Standard" ? "₹1,499" : stats.plan === "Annual Elite" ? "₹13,999" : "₹3,999"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#8A8A8A] uppercase font-semibold">Start Date</div>
                <div className="text-sm font-semibold text-white mt-1">12 Feb 2025</div>
              </div>
              <div>
                <div className="text-[10px] text-[#8A8A8A] uppercase font-semibold">Expires On</div>
                <div className="text-sm font-semibold text-white mt-1">{stats.validUntil}</div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1A1A1A] pt-4 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="text-xs text-[#8A8A8A]">
              GST (18%) inclusive. Auto-renews next cycle.
            </div>
            <Button
              onClick={onRenewClick}
              className="bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-10 px-6 uppercase text-xs shrink-0 w-full sm:w-auto"
            >
              Renew Membership Now
            </Button>
          </div>
        </div>

        {/* Support Plan Details */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-display text-lg tracking-wide uppercase text-white">Important Notes</h3>
            <ul className="space-y-2 text-xs text-[#CFCFCF] list-disc list-inside">
              <li>Upgrades to Annual plan automatically save an additional 22%.</li>
              <li>Subscriptions can be paused for up to 30 days once a year.</li>
              <li>GST invoices are generated automatically on completion.</li>
            </ul>
          </div>
          <Link to="/plans" className="block mt-4">
            <Button variant="outline" className="w-full border-[#222222] bg-transparent text-white hover:bg-[#1A1A1A] text-xs h-10 font-bold uppercase">
              View Other Plans
            </Button>
          </Link>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1A1A1A] bg-[#0C0C0C]">
          <h3 className="font-display text-lg tracking-wide uppercase text-white">Payment Statements</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left border-collapse text-xs text-[#CFCFCF] table-sticky-first">
            <thead>
              <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
                <th className="px-6 py-3.5">Payment Date</th>
                <th className="px-6 py-3.5">Plan Title</th>
                <th className="px-6 py-3.5">Method</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5 text-center">Invoice Option</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {invoices.map((inv) => (
                <tr key={inv.invoiceNo} className="hover:bg-[#111111]/80 transition-colors">
                  <td className="px-6 py-3.5 font-medium text-white">{inv.date}</td>
                  <td className="px-6 py-3.5">{inv.plan}</td>
                  <td className="px-6 py-3.5 text-[#8A8A8A]">{inv.method}</td>
                  <td className="px-6 py-3.5 font-semibold text-white">{inv.amount}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedInvoice(inv)}
                        variant="ghost"
                        className="text-[#8A8A8A] hover:text-white h-8 text-[11px]"
                      >
                        <FileText className="h-3.5 w-3.5 mr-1 text-[#E02020]" /> View GST
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleInvoiceDownload(inv)}
                        className="bg-[#1A1A1A] border border-[#222222] hover:bg-[#E02020] hover:text-white h-8 text-[11px]"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GST Invoice Details Modal */}
      {selectedInvoice && (
        <div className="modal-overlay z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="modal-sheet max-w-lg rounded-xl"
          >
            <div className="bg-[#0A0A0A] border-b border-[#222222] px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">Tax Receipt Invoice</span>
                <div className="font-display text-xl text-white mt-0.5">{selectedInvoice.invoiceNo}</div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-[#8A8A8A] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between pb-3 border-b border-[#222222]">
                <div>
                  <div className="text-[#8A8A8A]">Bill From</div>
                  <div className="font-semibold text-white mt-1">IronForge Gym Private Ltd</div>
                  <div className="text-[#8A8A8A] mt-0.5">Banjara Hills, Hyderabad</div>
                  <div className="text-[10px] text-[#8A8A8A] mt-0.5">GSTIN: 36AAAAI4284P1Z3</div>
                </div>
                <div className="text-right">
                  <div className="text-[#8A8A8A]">Bill To</div>
                  <div className="font-semibold text-white mt-1">{stats.name}</div>
                  <div className="text-[#8A8A8A] mt-0.5">Member ID: {stats.memberId}</div>
                  <div className="text-[#8A8A8A] mt-0.5">Mobile: {stats.mobile}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[#8A8A8A] font-bold uppercase text-[9px] tracking-wider pb-1">
                  <span>Description</span>
                  <span>Amount</span>
                </div>
                <div className="flex justify-between font-semibold text-white">
                  <span>Gym Membership — {selectedInvoice.plan} Access</span>
                  <span>
                    ₹{(parseInt(selectedInvoice.amount.replace(/\D/g, "")) - Math.floor(parseInt(selectedInvoice.amount.replace(/\D/g, "")) * 0.18)).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-[#8A8A8A]">
                  <span>CGST (9%)</span>
                  <span>₹{Math.floor(parseInt(selectedInvoice.amount.replace(/\D/g, "")) * 0.09).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[#8A8A8A]">
                  <span>SGST (9%)</span>
                  <span>₹{Math.floor(parseInt(selectedInvoice.amount.replace(/\D/g, "")) * 0.09).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="border-t border-[#222222] pt-3 flex justify-between font-bold text-sm">
                <span className="uppercase">Total Amount Due</span>
                <span className="text-[#E02020]">{selectedInvoice.amount}</span>
              </div>

              <div className="pt-2 text-[10px] text-[#555555]">
                Transaction Method: {selectedInvoice.method} | Status: PAID (Verified)
              </div>
            </div>

            <div className="bg-[#0A0A0A] border-t border-[#222222] px-6 py-4 flex gap-3 justify-end items-center">
              <Link
                to="/invoice/$id"
                params={{ id: selectedInvoice.invoiceNo }}
                target="_blank"
                className="inline-flex items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold h-9 bg-white text-black hover:bg-gray-100 border border-gray-300 font-bold uppercase transition-colors"
              >
                <FileText className="h-4 w-4" /> View Invoice Page
              </Link>
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="border-[#222222] bg-transparent text-white hover:bg-[#1A1A1A] h-9 text-xs"
              >
                <Printer className="h-4 w-4 mr-1.5" /> Print
              </Button>
              <Button
                onClick={() => { handleInvoiceDownload(selectedInvoice); setSelectedInvoice(null); }}
                className="bg-[#E02020] hover:bg-[#C41818] text-white h-9 text-xs"
              >
                <Download className="h-4 w-4 mr-1.5" /> Save File
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ================= TAB 4: LIVE GYM STATUS =================
function TabLiveStatus() {
  const peakHours = [
    { label: "5 - 6 AM", level: "LOW", height: "h-[10%]", color: "bg-[#222222]" },
    { label: "6 - 8 AM", level: "HIGH", height: "h-[90%]", color: "bg-[#E02020]" },
    { label: "8 - 10 AM", level: "MED", height: "h-[60%]", color: "bg-amber-500" },
    { label: "10 - 12 PM", level: "LOW", height: "h-[25%]", color: "bg-emerald-500" },
    { label: "12 - 1 PM", level: "LOW", height: "h-[15%]", color: "bg-emerald-500" },
    { label: "1 - 3 PM", level: "LOW", height: "h-[20%]", color: "bg-[#222222]" },
    { label: "3 - 5 PM", level: "LOW", height: "h-[30%]", color: "bg-emerald-500" },
    { label: "5 - 6 PM", level: "MED", height: "h-[60%]", color: "bg-amber-500" },
    { label: "6 - 9 PM", level: "HIGH", height: "h-[95%]", color: "bg-[#E02020]" },
    { label: "9 - 11 PM", level: "LOW", height: "h-[20%]", color: "bg-[#222222]" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white">Live Gym Status</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Monitor occupancy grids, peak traffic metrics, and safe workout windows.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy Indicator */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-6 text-center flex flex-col items-center justify-center space-y-4">
          <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Live Occupancy</span>
          
          {/* circular graph */}
          <div className="relative h-44 w-44 flex items-center justify-center">
            {/* SVG circle */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#1C1C1C" strokeWidth="6" fill="transparent" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="url(#yellowGlow)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * (34 / 80))}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="yellowGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F59E0B" />
                  <stop offset="100%" stopColor="#E02020" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Inner details */}
            <div className="text-center space-y-0.5">
              <div className="font-display text-5xl font-bold text-white">34</div>
              <div className="text-[10px] uppercase tracking-wider text-[#8A8A8A] font-bold">/ 80 Active</div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold uppercase tracking-widest text-amber-500">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
              Moderate Crowd
            </div>
            <p className="text-[10px] text-[#555555]">Updated 2 minutes ago</p>
          </div>
        </div>

        {/* peak hours graph */}
        <div className="lg:col-span-2 rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
          <div>
            <h3 className="font-display text-lg tracking-wide uppercase text-white">Hourly Traffic Analysis</h3>
            <p className="text-xs text-[#8A8A8A]">Gym attendance patterns across segments</p>
          </div>

          {/* simple horizontal/vertical distribution */}
          <div className="h-32 sm:h-44 flex items-end justify-between gap-2 pt-4">
            {peakHours.map((hour, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#111111] border border-[#222222] rounded px-1.5 py-0.5 text-[8px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                  {hour.level}
                </div>
                <div className={cn("w-full rounded-t-[2px] transition-all", hour.color, hour.height)} />
              </div>
            ))}
          </div>

          <div className="flex justify-between text-[8px] text-[#8A8A8A] uppercase font-bold tracking-wider pt-1 border-t border-[#1A1A1A] mt-2">
            <span>5 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>11 PM</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-xs uppercase tracking-widest text-emerald-400 font-bold">Recommended Window</div>
          <p className="text-xs text-[#CFCFCF]">
            The best time to visit today is between <strong>10:00 AM - 12:00 PM</strong> or <strong>2:00 PM - 5:00 PM</strong>. Gym equipment is highly accessible and wait times are minimal.
          </p>
        </div>
      </div>
    </div>
  );
}

// ================= TAB 5: DIGITAL ID CARD =================
function TabIdCard({ stats }: { stats: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white">Digital Pass ID</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Keep your ID card accessible on mobile. Scan at turnstiles to check in.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-6 space-y-8">
        
        {/* Landscape Digital Wallet Pass Card */}
        <div className="relative w-full max-w-md h-56 rounded-2xl overflow-hidden border border-[#E02020]/30 shadow-2xl bg-gradient-to-br from-[#E02020]/20 via-[#1C0505] to-[#0A0A0A] p-6 flex flex-col justify-between select-none">
          {/* Red glow details */}
          <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#E02020] opacity-20 blur-[50px]" />
          
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#E02020] flex items-center justify-center">
                <Dumbbell className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-display text-lg tracking-widest uppercase text-white">IronForge Gym</span>
            </div>
            
            <Badge variant="outline" className="border-[#E02020]/30 text-[#E02020] bg-[#E02020]/5 uppercase font-bold text-[9px] tracking-wider px-2 py-0.5">
              Premium
            </Badge>
          </div>

          <div className="flex justify-between items-end">
            <div className="space-y-1.5 max-w-[240px]">
              <div className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Member Pass</div>
              <h2 className="font-display text-3xl text-white tracking-wide uppercase leading-tight font-bold">{stats.name}</h2>
              
              <div className="flex gap-4 pt-1 text-[9px] text-[#CFCFCF] font-medium">
                <div>
                  <span className="text-[#8A8A8A] uppercase block">ID Number</span>
                  <span>{stats.memberId}</span>
                </div>
                <div>
                  <span className="text-[#8A8A8A] uppercase block">Expires</span>
                  <span>15 Aug 2025</span>
                </div>
              </div>
            </div>

            {/* QR Pass */}
            <div className="p-2 bg-white rounded-lg border border-[#222222] shrink-0">
              <svg className="w-14 h-14 text-black" viewBox="0 0 100 100">
                <rect x="0" y="0" width="25" height="25" fill="currentColor" />
                <rect x="3" y="3" width="19" height="19" fill="white" />
                <rect x="7" y="7" width="11" height="11" fill="currentColor" />

                <rect x="75" y="0" width="25" height="25" fill="currentColor" />
                <rect x="78" y="3" width="19" height="19" fill="white" />
                <rect x="82" y="7" width="11" height="11" fill="currentColor" />

                <rect x="0" y="75" width="25" height="25" fill="currentColor" />
                <rect x="3" y="78" width="19" height="19" fill="white" />
                <rect x="7" y="82" width="11" height="11" fill="currentColor" />
                
                <rect x="40" y="40" width="20" height="20" fill="currentColor" />
                <rect x="45" y="45" width="10" height="10" fill="white" />
                
                <path d="M35,5 L45,5 M35,15 L60,15" stroke="currentColor" strokeWidth="4" />
                <path d="M5,35 L5,60 M15,35 L15,50" stroke="currentColor" strokeWidth="4" />
                <path d="M75,35 L90,35 M75,45 L100,45" stroke="currentColor" strokeWidth="4" />
                <path d="M65,85 L85,85 M70,95 L95,95" stroke="currentColor" strokeWidth="4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="border-[#222222] bg-transparent text-white hover:bg-[#1A1A1A] h-10 px-5 text-xs font-semibold uppercase"
          >
            <Printer className="h-4 w-4 mr-2" /> Print Pass
          </Button>
          <Button
            onClick={() => {
              const passUrl = `https://ironforge.in/pass/${stats.memberId}`;
              navigator.clipboard.writeText(passUrl);
              toast.success("Pass link copied! Share with wallet app.");
            }}
            className="bg-[#E02020] hover:bg-[#C41818] text-white h-10 px-5 text-xs font-semibold uppercase"
          >
            <Share2 className="h-4 w-4 mr-2" /> Share Pass
          </Button>
        </div>
      </div>
    </div>
  );
}

// ================= TAB 6: NOTIFICATIONS =================
function TabNotifications({
  setActiveTab,
  onRenewClick,
  notifications,
  setNotifications
}: {
  setActiveTab: (t: TabId) => void;
  onRenewClick: () => void;
  notifications: any[];
  setNotifications: React.Dispatch<React.SetStateAction<any[]>>;
}) {

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-3">
        <div>
          <h1 className="font-display text-4xl tracking-wide uppercase text-white">Notifications</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">Review alerts, batch announcements, and billing confirmations.</p>
        </div>
        <button
          onClick={() => {
            setNotifications([]);
            toast.success("Cleared all notifications");
          }}
          className="text-xs text-[#8A8A8A] hover:text-white underline font-semibold shrink-0 cursor-pointer"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = n.icon;
          return (
            <div key={n.id} className={cn("rounded-xl border p-4 flex gap-4 transition-all hover:translate-x-0.5", n.color)}>
              <div className="h-9 w-9 rounded-lg bg-[#0A0A0A] border border-[#222222] flex items-center justify-center shrink-0">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-bold text-sm text-white">{n.title}</span>
                  <span className="text-[10px] text-[#555555] font-semibold uppercase">{n.time}</span>
                </div>
                <p className="text-xs text-[#8A8A8A] leading-relaxed">{n.desc}</p>
                {n.action && (
                  <div className="pt-2">
                    {n.action.label === "Renew Now" ? (
                      <Link to="/dashboard/renew">
                        <Button
                          size="sm"
                          className="bg-[#1A1A1A] hover:bg-[#E02020] text-white border border-[#222222] h-7 px-3 text-[10px] font-bold uppercase"
                        >
                          {n.action.label}
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setActiveTab(n.action.tab)}
                        className="bg-[#1A1A1A] hover:bg-[#E02020] text-white border border-[#222222] h-7 px-3 text-[10px] font-bold uppercase"
                      >
                        {n.action.label}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ================= TAB 7: PROFILE =================
function TabProfile({ stats }: { stats: any }) {
  const profileDetails = {
    height: "175 cm",
    weight: "78 kg",
    bmi: 25.5,
    bloodGroup: "B+",
    goals: ["Weight Loss", "Muscle Gain"],
    aadhaar: "XXXX-XXXX-4521",
    emergencyName: "Sunita Sharma",
    emergencyMobile: "+91 98760 11111"
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white">My Profile</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Manage personal bio, health metrics, and emergency contacts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-6 text-center space-y-4">
          <div className="relative inline-block">
            <div className="h-24 w-24 rounded-full bg-[#E02020]/10 border-2 border-[#E02020] flex items-center justify-center mx-auto text-3xl font-bold text-[#E02020] shadow-xl">
              RS
            </div>
            <div className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-emerald-500 border-2 border-[#0A0A0A] flex items-center justify-center" title="Active Membership">
              <Check className="h-4 w-4 text-black" />
            </div>
          </div>
          
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold uppercase tracking-wide">{stats.name}</h2>
            <span className="text-xs text-[#8A8A8A]">{stats.memberId} | Active Premium</span>
          </div>

          <div className="border-t border-[#1A1A1A] pt-4 grid grid-cols-2 gap-3 text-left text-xs">
            <div>
              <span className="text-[#555555] font-semibold uppercase block text-[9px] tracking-wider">Joined On</span>
              <span className="font-medium text-white">{stats.joined}</span>
            </div>
            <div>
              <span className="text-[#555555] font-semibold uppercase block text-[9px] tracking-wider">Mobile</span>
              <span className="font-medium text-white">{stats.mobile}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[#555555] font-semibold uppercase block text-[9px] tracking-wider">Email Address</span>
              <span className="font-medium text-white">rahul@example.com</span>
            </div>
          </div>
        </div>

        {/* Bio & Health Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Health Profile */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
            <h3 className="font-display text-lg tracking-wide uppercase text-[#E02020] pb-2 border-b border-[#1A1A1A]">Health & Fitness Profile</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-[#8A8A8A] uppercase font-semibold">Height</span>
                <div className="text-sm font-bold text-white">{profileDetails.height}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#8A8A8A] uppercase font-semibold">Weight</span>
                <div className="text-sm font-bold text-white">{profileDetails.weight}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#8A8A8A] uppercase font-semibold">BMI Status</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white">{profileDetails.bmi}</span>
                  <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/10 text-[9px] py-0 px-1 font-bold">
                    Overweight
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-[#8A8A8A] uppercase font-semibold">Blood Group</span>
                <div className="text-sm font-bold text-white">{profileDetails.bloodGroup}</div>
              </div>
            </div>

            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#8A8A8A] uppercase font-semibold block">Fitness Goals</span>
                <div className="flex flex-wrap gap-1.5">
                  {profileDetails.goals.map((g) => (
                    <Badge key={g} className="bg-[#E02020]/15 text-[#E02020] border border-[#E02020]/30 hover:bg-[#E02020]/15 text-[10px] py-0.5">
                      {g}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-[#8A8A8A] uppercase font-semibold block">Identity Check (Aadhaar KYC)</span>
                <div className="text-xs text-[#CFCFCF] font-mono">{profileDetails.aadhaar}</div>
              </div>
            </div>
          </div>

          {/* Emergency Card */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
            <h3 className="font-display text-lg tracking-wide uppercase text-white pb-2 border-b border-[#1A1A1A]">Emergency Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[#8A8A8A] uppercase block text-[9px] tracking-wider">Contact Person</span>
                <span className="font-semibold text-white">{profileDetails.emergencyName}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#8A8A8A] uppercase block text-[9px] tracking-wider">Relationship / Mobile</span>
                <span className="font-semibold text-white">{profileDetails.emergencyMobile}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= TAB 8: CONTACT & SUPPORT =================
function TabSupport() {
  const [subject, setSubject] = useState("");
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubject("");
      setMsg("");
      toast.success("Support ticket created! Staff will respond within 4 hours.");
    }, 800);
  };

  const trainers = [
    { name: "Rohan Verma", role: "Strength & Conditioning", schedule: "Mon / Wed / Fri (All Day)", specialty: "Weightlifting, Barbells" },
    { name: "Anita Desai", role: "Yoga & Flexibility Coach", schedule: "Tue / Thu / Sat (All Day)", specialty: "Asanas, Meditation" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white">Contact & Support</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Connect with head trainers, support reception, or submit a help ticket.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Support details / trainers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Assigned Coaches */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
            <h3 className="font-display text-lg tracking-wide uppercase text-white pb-2 border-b border-[#1A1A1A]">My Training Coaches</h3>
            
            <div className="space-y-4 divide-y divide-[#1A1A1A]">
              {trainers.map((t, idx) => (
                <div key={t.name} className={cn("pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0")}>
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-white">{t.name}</div>
                    <div className="text-xs text-[#E02020] font-semibold">{t.role}</div>
                    <p className="text-[11px] text-[#8A8A8A]">{t.specialty}</p>
                  </div>
                  
                  <div className="shrink-0 text-right sm:text-right">
                    <Badge variant="outline" className="border-[#222222] text-[#8A8A8A] font-normal text-[10px]">
                      {t.schedule}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick reception links */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
            <h3 className="font-display text-lg tracking-wide uppercase text-white pb-2 border-b border-[#1A1A1A]">Reception Desk</h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="text-[#8A8A8A]">Reception Hotline</div>
                <div className="font-bold text-white text-base">+91 98765 43210</div>
              </div>

              <div className="flex gap-2">
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent("Hi IronForge Gym, I need assistance with my membership dashboard.")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block"
                >
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 px-5 text-xs uppercase">
                    <MessageCircle className="h-4.5 w-4.5 mr-1.5" /> WhatsApp Support
                  </Button>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Message support form */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5">
          <h3 className="font-display text-lg tracking-wide uppercase text-white mb-4">Submit Help Ticket</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Subject / Area</Label>
              <Input
                id="subject"
                placeholder="Billing, Locker issue, Workout change..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="bg-[#111111] border-[#222222] h-10 text-xs focus-visible:ring-[#E02020]"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="msg" className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Message Detail</Label>
              <textarea
                id="msg"
                rows={4}
                placeholder="Briefly describe your request or issue..."
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                required
                className="w-full rounded-md border border-[#222222] bg-[#111111] p-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:ring-1 focus:ring-[#E02020] focus:border-[#E02020]"
              />
            </div>

            <Button
              type="submit"
              disabled={sending}
              className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold text-xs h-10 uppercase"
            >
              {sending ? "Sending..." : "Send Support Request"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ================= STATUS & BLOCKING ERROR SCREENS =================

function RejectedScreen({ member, handleLogout }: { member: any; handleLogout: () => void }) {
  const navigate = useNavigate();

  const handleApplyAgain = () => {
    const usersStr = localStorage.getItem("registered_users");
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        const filtered = users.filter((u: any) => u.memberId !== member.memberId && u.mobile !== member.mobile);
        localStorage.setItem("registered_users", JSON.stringify(filtered));
      } catch (e) {}
    }
    localStorage.removeItem("is_member_logged_in");
    localStorage.removeItem("logged_in_member");
    toast.success("Ready to submit a new application!");
    navigate({ to: "/join" });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#E02020] opacity-[0.03] blur-[120px] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl bg-[#111111] border border-[#222222] p-8 shadow-2xl space-y-6 text-center"
      >
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <ShieldAlert className="h-8 w-8" />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">Registration Status</span>
          <h1 className="font-display text-2xl uppercase tracking-wide font-bold text-white">Application Not Approved</h1>
          <p className="text-xs text-[#8A8A8A]">
            Please contact us to understand why your registration request could not be processed.
          </p>
        </div>

        <div className="rounded-xl bg-[#0A0A0A] border border-[#222222] p-4 text-left text-xs space-y-1.5">
          <span className="text-[#555555] font-bold uppercase tracking-wider text-[8px]">Reason from Staff</span>
          <p className="text-[#CFCFCF] leading-relaxed">
            {member.rejectionReason || "Application details were incomplete or failed our background checks. Please submit a new registration or contact our staff."}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Button
            onClick={handleApplyAgain}
            className="w-full bg-[#E02020] hover:bg-[#C41818] text-white h-10 font-bold uppercase text-xs tracking-wider"
          >
            Apply Again
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:+919876543210"
              className="inline-flex items-center justify-center rounded-lg border border-[#222222] bg-[#111111] hover:bg-[#1A1A1A] hover:text-white text-xs font-bold uppercase tracking-wider h-10 transition-colors text-[#8A8A8A]"
            >
              Call Desk
            </a>
            <a
              href="https://wa.me/919876543210?text=Hello%20IronForge%20Gym,%20I'm%20writing%20about%20my%20rejected%20application."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-[#222222] bg-[#111111] hover:bg-[#1A1A1A] hover:text-white text-xs font-bold uppercase tracking-wider h-10 transition-colors text-[#8A8A8A]"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="pt-2 border-t border-[#222222]/50">
          <button onClick={handleLogout} className="text-xs text-[#8A8A8A] hover:text-white transition-colors cursor-pointer uppercase font-bold tracking-wider">
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function SuspendedScreen({ member, handleLogout }: { member: any; handleLogout: () => void }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#E02020] opacity-[0.03] blur-[120px] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl bg-[#111111] border border-[#222222] p-8 shadow-2xl space-y-6 text-center"
      >
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <Lock className="h-8 w-8" />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">Account Locked</span>
          <h1 className="font-display text-2xl uppercase tracking-wide font-bold text-white">Account Suspended</h1>
          <p className="text-xs text-[#8A8A8A]">
            Your access privileges have been suspended. Please contact gym staff for assistance.
          </p>
        </div>

        <div className="rounded-xl bg-[#0A0A0A] border border-[#222222] p-4 text-left text-xs space-y-1.5">
          <span className="text-[#555555] font-bold uppercase tracking-wider text-[8px]">Suspension Details</span>
          <p className="text-[#CFCFCF] leading-relaxed">
            {member.suspensionReason || "Your membership was suspended due to a code of conduct violation or administrative dues verification. Dues or behavior reviews are required."}
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:+919876543210"
              className="inline-flex items-center justify-center rounded-lg border border-[#222222] bg-[#111111] hover:bg-[#1A1A1A] hover:text-white text-xs font-bold uppercase tracking-wider h-10 transition-colors text-[#8A8A8A]"
            >
              Call Desk
            </a>
            <a
              href="https://wa.me/919876543210?text=Hello%20IronForge%20Gym,%20I'm%20writing%20about%20my%20suspended%20account."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg border border-[#222222] bg-[#111111] hover:bg-[#1A1A1A] hover:text-white text-xs font-bold uppercase tracking-wider h-10 transition-colors text-[#8A8A8A]"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="pt-2 border-t border-[#222222]/50">
          <button onClick={handleLogout} className="text-xs text-[#8A8A8A] hover:text-white transition-colors cursor-pointer uppercase font-bold tracking-wider">
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ExpiredScreen({ 
  member, 
  grace, 
  handleLogout, 
  onRenewClick 
}: { 
  member: any; 
  grace: any; 
  handleLogout: () => void; 
  onRenewClick: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans select-none">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#E02020] opacity-[0.03] blur-[120px] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl bg-[#111111] border border-[#222222] p-8 shadow-2xl space-y-6 text-center"
      >
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <Lock className="h-8 w-8" />
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">Access Blocked</span>
          <h1 className="font-display text-2xl uppercase tracking-wide font-bold text-white">Membership Expired</h1>
          <p className="text-xs text-[#8A8A8A]">
            Your IronForge subscription expired. Renew your plan to unlock dashboard access.
          </p>
        </div>

        <div className="rounded-xl bg-[#0A0A0A] border border-[#222222] p-4 text-xs text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-[#555555]">Plan Expiry Date:</span>
            <span className="text-white font-bold">{member.expiry || "15 Aug 2025"}</span>
          </div>
          <div className="h-px bg-[#222222]/50" />
          <div className="text-center text-red-400 font-semibold pt-1">
            {grace.graceActive ? (
              <span>⚠️ You have {grace.daysLeft} days of grace period remaining.</span>
            ) : (
              <span>⚠️ Grace period ended {grace.daysSinceGraceEnded} days ago.</span>
            )}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link to="/dashboard/renew" className="block">
            <Button
              className="w-full bg-[#E02020] hover:bg-[#C41818] text-white h-10 font-bold uppercase text-xs tracking-wider"
            >
              Renew Now
            </Button>
          </Link>

          <a
            href="tel:+919876543210"
            className="inline-flex items-center justify-center w-full rounded-lg border border-[#222222] bg-[#111111] hover:bg-[#1A1A1A] hover:text-white text-xs font-bold uppercase tracking-wider h-10 transition-colors text-[#8A8A8A]"
          >
            Contact Gym Desk
          </a>
        </div>

        <div className="pt-2 border-t border-[#222222]/50">
          <button onClick={handleLogout} className="text-xs text-[#8A8A8A] hover:text-white transition-colors cursor-pointer uppercase font-bold tracking-wider">
            Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}

