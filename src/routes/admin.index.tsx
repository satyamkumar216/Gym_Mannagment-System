import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import {
  LayoutDashboard, Users, Clock, UserPlus, IndianRupee, Calendar, Activity,
  Contact, Bell, TrendingUp, Settings, LogOut, Search, Filter, Check, X,
  AlertCircle, Download, FileText, Send, Plus, CheckCircle2, UserCheck, Edit,
  Trash2, ShieldAlert, ShieldCheck, Printer, Eye, EyeOff, MessageSquare, Share2,
  ChevronDown, ChevronUp, CheckSquare, Square, Lock, Key, Smartphone, Dumbbell, Receipt, Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Staff Control Portal — IronForge Gym" },
      { name: "description", content: "Manage members, verify payments, check attendance statistics, and adjust parameters." },
    ],
  }),
  component: AdminIndex,
});

type AdminTab = "overview" | "members" | "pending" | "pending-payments" | "manual" | "payments" | "attendance" | "occupancy" | "staff" | "notifications" | "reports" | "settings";

interface Member {
  name: string;
  memberId: string;
  plan: string;
  status: "Active" | "Expiring" | "Expired" | "Suspended" | "Pending Approval" | "Pending Payment";
  statusText?: string;
  location: string;
  mobile: string;
  email: string;
  joined: string;
  expiry: string;
  biometric?: "Registered" | "Not Set";
}

interface Application {
  id: string;
  name: string;
  date: string;
  plan: string;
  paymentMode: string;
  amount: number;
  mobile: string;
  email: string;
  height?: string;
  weight?: string;
  bmi?: number;
  bloodGroup?: string;
  goals?: string[];
  conditions?: string[];
  signature?: string;
}

interface Transaction {
  id: string;
  date: string;
  name: string;
  amount: number;
  plan: string;
  method: string;
  status: "Paid" | "Pending Verify";
}

interface SystemNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: "warning" | "announcement" | "achievement" | "alert" | "info";
  read?: boolean;
}

// Initial dummy members database
const initialMembers: Member[] = [
  { name: "Rahul Sharma", memberId: "IG-2024-0042", plan: "Quarterly Premium", status: "Active", location: "Banjara Hills, Hyderabad", mobile: "+91 98765 43210", email: "rahul@gmail.com", joined: "12 Feb 2024", expiry: "15 Aug 2025", biometric: "Registered" },
  { name: "Priya Patel", memberId: "IG-2024-0071", plan: "Annual Elite", status: "Active", location: "Secunderabad, Hyderabad", mobile: "+91 98765 43211", email: "priya@example.com", joined: "18 Mar 2024", expiry: "15 Mar 2026", biometric: "Registered" },
  { name: "Arjun Mehta", memberId: "IG-2024-0089", plan: "Monthly Standard", status: "Expiring", statusText: "Expiring in 3 days", location: "Gachibowli, Hyderabad", mobile: "+91 98765 43212", email: "arjun@example.com", joined: "10 Apr 2024", expiry: "31 May 2026", biometric: "Not Set" },
  { name: "Sneha Reddy", memberId: "IG-2024-0103", plan: "Quarterly Premium", status: "Active", location: "Madhapur, Hyderabad", mobile: "+91 98765 43213", email: "sneha@example.com", joined: "05 May 2024", expiry: "05 Aug 2026", biometric: "Not Set" },
  { name: "Vikram Singh", memberId: "IG-2024-0118", plan: "Annual Elite", status: "Active", location: "Jubilee Hills, Hyderabad", mobile: "+91 98765 43214", email: "vikram@example.com", joined: "15 May 2024", expiry: "15 May 2027", biometric: "Not Set" },
  { name: "Kavya Nambiar", memberId: "IG-2024-0134", plan: "Monthly Standard", status: "Expired", statusText: "Expired 5 days ago", location: "Begumpet, Hyderabad", mobile: "+91 98765 43215", email: "kavya@example.com", joined: "12 Jan 2024", expiry: "23 May 2026", biometric: "Registered" },
  { name: "Rohit Gupta", memberId: "IG-2024-0156", plan: "Quarterly Premium", status: "Pending Approval", location: "Kondapur, Hyderabad", mobile: "+91 98765 43216", email: "rohit@example.com", joined: "28 May 2025", expiry: "28 Aug 2025", biometric: "Not Set" },
  { name: "Meera Joshi", memberId: "IG-2024-0167", plan: "Annual Elite", status: "Pending Payment", location: "Kukatpally, Hyderabad", mobile: "+91 98765 43217", email: "meera@example.com", joined: "27 May 2025", expiry: "27 May 2026", biometric: "Not Set" },
];

// Initial dummy applications ( रोहित & मीरा )
const initialApplications: Application[] = [
  { 
    id: "app-1", 
    name: "Rohit Gupta", 
    date: "28 May", 
    plan: "Quarterly", 
    paymentMode: "Online Payment Pending", 
    amount: 4718, 
    mobile: "+91 98765 43216", 
    email: "rohit@example.com",
    height: "176 cm",
    weight: "88 kg",
    bmi: 28.4,
    bloodGroup: "B+",
    goals: ["Weight Loss", "Strength"],
    conditions: ["High BP"],
    signature: "Rohit Gupta"
  },
  { 
    id: "app-2", 
    name: "Meera Joshi", 
    date: "27 May", 
    plan: "Annual", 
    paymentMode: "Cash Payment Desk", 
    amount: 16518, 
    mobile: "+91 98765 43217", 
    email: "meera@example.com",
    height: "160 cm",
    weight: "50 kg",
    bmi: 19.5,
    bloodGroup: "A-",
    goals: ["General Fitness", "Flexibility"],
    conditions: [],
    signature: "Meera Joshi"
  },
];

// Initial dummy transactions ledger (10 entries)
const initialTransactions: Transaction[] = [
  { id: "tx-1", date: "28 May", name: "Priya Patel", amount: 13999, plan: "Annual", method: "UPI-GPay", status: "Paid" },
  { id: "tx-2", date: "27 May", name: "Vikram Singh", amount: 3999, plan: "Quarterly", method: "Card", status: "Paid" },
  { id: "tx-3", date: "26 May", name: "Rahul Sharma", amount: 3999, plan: "Quarterly", method: "UPI-PhonePe", status: "Paid" },
  { id: "tx-4", date: "26 May", name: "Kavya Nambiar", amount: 1499, plan: "Monthly", method: "Cash", status: "Pending Verify" },
  { id: "tx-5", date: "25 May", name: "Sneha Reddy", amount: 3999, plan: "Quarterly", method: "UPI-Paytm", status: "Paid" },
  { id: "tx-6", date: "24 May", name: "Arjun Mehta", amount: 1499, plan: "Monthly", method: "Card", status: "Paid" },
  { id: "tx-7", date: "23 May", name: "Rohan Verma", amount: 1499, plan: "Monthly", method: "Cash", status: "Paid" },
  { id: "tx-8", date: "22 May", name: "Sunita Sharma", amount: 3999, plan: "Quarterly", method: "UPI-GPay", status: "Paid" },
  { id: "tx-9", date: "21 May", name: "Meera Joshi", amount: 13999, plan: "Annual", method: "Cash", status: "Pending Verify" },
  { id: "tx-10", date: "20 May", name: "Rohit Gupta", amount: 3999, plan: "Quarterly", method: "UPI", status: "Pending Verify" }
];

// Initial dummy notifications
const initialNotifications: SystemNotification[] = [
  { id: "n-1", title: "Monthly Cleaning Schedule", desc: "Facility maintenance planned for Sunday, 1st June. All check-in logs will be suspended.", time: "1 day ago", type: "alert", read: false },
  { id: "n-2", title: "New HIIT trainer onboarded", desc: "Trainer Divya Nair added to system. Shift scheduled for 5:30 PM slots.", time: "2 days ago", type: "info", read: false },
  { id: "n-3", title: "Peak Occupancy Reached", desc: "Occupancy hit 76 members at 7:15 PM on Wednesday. Recommended crowd alerts sent.", time: "3 days ago", type: "warning", read: false },
];

function AdminIndex() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [membersMenuOpen, setMembersMenuOpen] = useState(true);

  // Core lists
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [notifications, setNotifications] = useState<SystemNotification[]>(initialNotifications);

  // Form states for manual registration
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPlan, setRegPlan] = useState<"monthly" | "quarterly" | "annual">("quarterly");
  const [regMethod, setRegMethod] = useState("UPI");
  const [regStatus, setRegStatus] = useState("Paid");
  const [regLoc, setRegLoc] = useState("Banjara Hills, Hyderabad");
  // Extra Admin Fields
  const [regImmediateActive, setRegImmediateActive] = useState(true);
  const [regBypassApproval, setRegBypassApproval] = useState(true);
  const [regManualAmount, setRegManualAmount] = useState("");
  const [regStaffNotes, setRegStaffNotes] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [biometricFilter, setBiometricFilter] = useState("All");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedAppForModal, setSelectedAppForModal] = useState<Application | null>(null);

  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [modalBTitle, setModalBTitle] = useState("");
  const [modalBMsg, setModalBMsg] = useState("");
  const [modalBTarget, setModalBTarget] = useState("all");

  const [rejectAppConfirmOpen, setRejectAppConfirmOpen] = useState(false);
  const [appToReject, setAppToReject] = useState<Application | null>(null);

  const [rejectPaymentConfirmOpen, setRejectPaymentConfirmOpen] = useState(false);
  const [paymentToReject, setPaymentToReject] = useState<string | null>(null);

  const [bellOpen, setBellOpen] = useState(false);

  const handleModalBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalBTitle.trim() || !modalBMsg.trim()) return;

    const newNotif = {
      id: `n-${Math.floor(1000 + Math.random() * 9000)}`,
      title: modalBTitle,
      desc: `[Target: ${modalBTarget.toUpperCase()}] ${modalBMsg}`,
      time: "Just now",
      type: "announcement" as const,
      read: false
    };

    setNotifications(prev => [newNotif, ...prev]);
    toast.success(`Broadcast announcement successfully dispatched to ${modalBTarget} members!`);
    setModalBTitle("");
    setModalBMsg("");
    setAnnouncementModalOpen(false);
  };

  // Keyboard shortcuts event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in inputs or textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        navigate({ to: "/search", search: { q: "" } });
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        setActiveTab("manual");
        toast.info("Switched to New Member Registration");
      } else if (e.key.toLowerCase() === "a") {
        e.preventDefault();
        setActiveTab("pending");
        toast.info("Switched to Pending Approvals");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Capacity states
  const [strengthLimit, setStrengthLimit] = useState(40);
  const [cardioLimit, setCardioLimit] = useState(20);
  const [yogaLimit, setYogaLimit] = useState(20);
  const [strengthCount, setStrengthCount] = useState(22);
  const [cardioCount, setCardioCount] = useState(8);
  const [yogaCount, setYogaCount] = useState(4);

  // Sync with localStorage registered_users database
  useEffect(() => {
    const isStaff = localStorage.getItem("is_staff_logged_in");
    if (!isStaff) {
      navigate({ to: "/admin/login" });
    }
  }, [navigate]);

  // Synchronize activeTab with URL search parameter "?tab="
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam as AdminTab);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (activeTab !== "overview") {
      if (tabParam !== activeTab) {
        window.history.replaceState({}, "", `/admin?tab=${activeTab}`);
      }
    } else if (tabParam) {
      window.history.replaceState({}, "", "/admin");
    }
  }, [activeTab]);

  useEffect(() => {
    let usersStr = localStorage.getItem("registered_users");
    if (!usersStr) {
      const seedUsers = initialMembers.map(m => ({
        fullName: m.name,
        mobile: m.mobile.replace("+91 ", ""),
        email: m.email,
        password: "password123",
        memberId: m.memberId,
        plan: m.plan.includes("Quarterly") ? "quarterly" : m.plan.includes("Annual") ? "annual" : "monthly",
        paymentMode: m.status === "Active" || m.status === "Expiring" ? "online" : "gym",
        status: m.status,
        biometric: m.biometric || "Registered"
      }));
      localStorage.setItem("registered_users", JSON.stringify(seedUsers));
      usersStr = JSON.stringify(seedUsers);
    }

    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        if (Array.isArray(users)) {
          const mapped: Member[] = users.map((u: any) => ({
            name: u.fullName,
            memberId: u.memberId,
            plan: u.plan === "quarterly" ? "Quarterly Premium" : u.plan === "annual" ? "Annual Elite" : "Monthly Standard",
            status: u.status || (u.paymentMode === "online" ? "Active" : "Pending Payment"),
            location: "Hyderabad",
            mobile: u.mobile.startsWith("+91") ? u.mobile : `+91 ${u.mobile}`,
            email: u.email,
            joined: "Recently",
            expiry: u.plan === "quarterly" ? "15 Aug 2025" : u.plan === "annual" ? "15 May 2026" : "30 Jun 2025",
            biometric: u.biometric || (["Sneha Reddy", "Vikram Singh", "Arjun Mehta", "Rohit Gupta", "Meera Joshi"].includes(u.fullName) ? "Not Set" : "Registered")
          }));

          setMembers(prev => {
            const mappedMap = new Map(mapped.map(m => [m.memberId, m]));
            return prev.map(m => {
              const fromStorage = mappedMap.get(m.memberId);
              if (fromStorage) {
                return { ...m, status: fromStorage.status, biometric: fromStorage.biometric };
              }
              return m;
            });
          });

          setMembers(prev => {
            const existingIds = new Set(prev.map(m => m.memberId));
            const newUnique = mapped.filter(m => !existingIds.has(m.memberId));
            return [...prev, ...newUnique];
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("is_staff_logged_in");
    navigate({ to: "/admin/login" });
    toast.success("Logged out from Staff Control Panel");
  };

  // Shared state helpers
  const handleApproveApplication = (app: Application) => {
    const newMemberId = `IG-2024-${randomDigits(4)}`;
    const isOnline = app.paymentMode.includes("Online");
    const targetStatus = isOnline ? "Active" : "Pending Payment";
    
    // Save to State
    const newMember: Member = {
      name: app.name,
      memberId: newMemberId,
      plan: app.plan === "Quarterly" ? "Quarterly Premium" : app.plan === "Annual" ? "Annual Elite" : "Monthly Standard",
      status: targetStatus as any,
      location: "Hyderabad",
      mobile: app.mobile,
      email: app.email,
      joined: "Today",
      expiry: app.plan === "Annual" ? "12 Months" : app.plan === "Quarterly" ? "3 Months" : "1 Month",
      biometric: "Not Set"
    };

    setMembers(prev => [newMember, ...prev.filter(m => m.name !== app.name)]);
    setApplications(prev => prev.filter(a => a.id !== app.id));

    // Add transaction
    const newTx: Transaction = {
      id: `tx-${randomDigits(4)}`,
      date: "Today",
      name: app.name,
      amount: app.amount,
      plan: app.plan,
      method: isOnline ? "UPI-GPay" : "Cash",
      status: isOnline ? "Paid" : "Pending Verify"
    };
    setTransactions(prev => [newTx, ...prev]);

    // Save to LocalStorage registered_users
    const existingUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
    const newStorageUser = {
      fullName: app.name,
      mobile: app.mobile.replace("+91 ", ""),
      email: app.email,
      password: "password123",
      memberId: newMemberId,
      plan: app.plan === "Quarterly" ? "quarterly" : app.plan === "Annual" ? "annual" : "monthly",
      paymentMode: isOnline ? "online" : "gym",
      status: targetStatus,
      biometric: "Not Set",
      height: app.height || "175",
      weight: app.weight || "70",
      bloodGroup: app.bloodGroup || "O+",
      goals: app.goals || [],
      conditions: app.conditions || [],
      notes: isOnline ? "Approved online paid applicant." : "Approved offline applicant."
    };
    localStorage.setItem("registered_users", JSON.stringify([...existingUsers, newStorageUser]));

    if (isOnline) {
      toast.success(
        <div className="space-y-1 text-left">
          <div className="font-semibold text-white">✅ {app.name} is now an active member!</div>
          <div className="text-xs text-[#8A8A8A] font-normal leading-relaxed">
            Payment verified online. Remind them to visit reception to register their fingerprint before their first workout.
          </div>
        </div>,
        { duration: 6000 }
      );
    } else {
      toast.success(`Application reviewed and approved for ${app.name}! Proceed to Verify Payment.`);
    }
  };

  const handleRejectApplication = (app: Application) => {
    const reason = window.prompt(`Enter rejection reason for ${app.name} (optional):`);
    if (reason === null) return; // Cancelled
    
    const usersStr = localStorage.getItem("registered_users");
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        const updated = users.map((u: any) => u.fullName === app.name || u.mobile === app.mobile.replace("+91 ", "").replace(/\D/g, "") ? { ...u, status: "Rejected", rejectionReason: reason || undefined } : u);
        localStorage.setItem("registered_users", JSON.stringify(updated));
      } catch (e) {}
    }
    
    setAppToReject(app);
    setRejectAppConfirmOpen(true);
  };

  const confirmRejectApplication = () => {
    if (appToReject) {
      setApplications(prev => prev.filter(a => a.id !== appToReject.id));
      toast.error(`Rejected registration request for ${appToReject.name}`);
      setRejectAppConfirmOpen(false);
      setAppToReject(null);
    }
  };

  const handleVerifyPayment = (txId: string) => {
    setTransactions(prev =>
      prev.map(t => {
        if (t.id === txId) {
          toast.success(
            <div className="space-y-1">
              <div className="font-semibold text-white">✅ {t.name} is now an active member!</div>
              <div className="text-xs text-[#8A8A8A] font-normal leading-relaxed">
                Remind them to visit reception to register their fingerprint before their first workout.
              </div>
            </div>,
            { duration: 6000 }
          );
          setMembers(mList =>
            mList.map(m => {
              if (m.name === t.name) {
                return { ...m, status: "Active", biometric: "Not Set" };
              }
              return m;
            })
          );
          // Update in registered_users in localStorage
          const usersStr = localStorage.getItem("registered_users");
          if (usersStr) {
            try {
              const users = JSON.parse(usersStr);
              const updated = users.map((u: any) => u.fullName === t.name ? { ...u, status: "Active", paymentMode: "online", biometric: "Not Set" } : u);
              localStorage.setItem("registered_users", JSON.stringify(updated));
            } catch (e) {}
          }
          return { ...t, status: "Paid" };
        }
        return t;
      })
    );
  };

  const handleRejectPayment = (txId: string) => {
    setPaymentToReject(txId);
    setRejectPaymentConfirmOpen(true);
  };

  const confirmRejectPayment = () => {
    if (paymentToReject) {
      setTransactions(prev => prev.filter(t => t.id !== paymentToReject));
      toast.error(`Rejected payment record transaction ${paymentToReject}`);
      setRejectPaymentConfirmOpen(false);
      setPaymentToReject(null);
    }
  };

  // Submit manual registration
  const handleManualReg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !/^\d{10}$/.test(regPhone)) {
      toast.error("Please enter a valid Name and 10-digit Phone number");
      return;
    }

    const defaultPrice = regPlan === "monthly" ? 1499 : regPlan === "quarterly" ? 3999 : 13999;
    const finalAmount = regManualAmount ? parseFloat(regManualAmount) : defaultPrice + Math.floor(defaultPrice * 0.18);
    const newMemberId = `IG-2024-${randomDigits(4)}`;

    const newMember: Member = {
      name: regName,
      memberId: newMemberId,
      plan: regPlan === "monthly" ? "Monthly Standard" : regPlan === "quarterly" ? "Quarterly Premium" : "Annual Elite",
      status: regImmediateActive ? "Active" : "Pending Payment",
      location: regLoc,
      mobile: `+91 ${regPhone.slice(0, 5)} ${regPhone.slice(5)}`,
      email: regEmail || "walkin@ironforge.in",
      joined: "Today",
      expiry: regPlan === "annual" ? "12 Months" : regPlan === "quarterly" ? "3 Months" : "1 Month"
    };

    if (regBypassApproval) {
      setMembers(prev => [newMember, ...prev]);
      
      const newTx: Transaction = {
        id: `tx-${randomDigits(4)}`,
        date: "Today",
        name: regName,
        amount: finalAmount,
        plan: regPlan.charAt(0).toUpperCase() + regPlan.slice(1),
        method: regMethod,
        status: regImmediateActive ? "Paid" : "Pending Verify"
      };
      setTransactions(prev => [newTx, ...prev]);

      // Save to localStorage registered_users
      const existingUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
      const newStorageUser = {
        fullName: regName,
        mobile: regPhone,
        email: regEmail || "walkin@ironforge.in",
        password: "password123",
        memberId: newMemberId,
        plan: regPlan,
        paymentMode: regImmediateActive ? "online" : "gym",
        notes: regStaffNotes || "Walk-in manual registration."
      };
      localStorage.setItem("registered_users", JSON.stringify([...existingUsers, newStorageUser]));

      toast.success(`Registered ${regName} successfully! Member ID: ${newMemberId}`);
    } else {
      // Add to registration applications queue
      const newApp: Application = {
        id: `app-${randomDigits(4)}`,
        name: regName,
        date: "Today",
        plan: regPlan.charAt(0).toUpperCase() + regPlan.slice(1),
        paymentMode: regStatus === "Paid" ? "Online Verification Pending" : "Cash Payment Desk",
        amount: finalAmount,
        mobile: `+91 ${regPhone}`,
        email: regEmail || "walkin@ironforge.in",
        goals: ["General Fitness"],
        conditions: []
      };
      setApplications(prev => [newApp, ...prev]);
      toast.success(`Walk-in added to Pending applications queue!`);
    }

    // Reset Form
    setRegName("");
    setRegPhone("");
    setRegEmail("");
    setRegPlan("quarterly");
    setRegManualAmount("");
    setRegStaffNotes("");
  };

  // KPIs
  const stats = useMemo(() => {
    const totalCount = members.length + 339; // offset to match total metrics
    const activeCount = members.filter(m => m.status === "Active").length + 290;
    const pendingCount = applications.length;
    const expiredCount = members.filter(m => m.status === "Expired").length + 5;
    
    return {
      total: totalCount,
      active: activeCount,
      expiring: 12,
      expired: expiredCount,
      revenue: 482500,
      checkInsToday: 89,
      liveNow: strengthCount + cardioCount + yogaCount
    };
  }, [members, applications, strengthCount, cardioCount, yogaCount]);

  // Filters for members tab
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.mobile.includes(searchQuery) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && m.status === "Active") ||
        (statusFilter === "Suspended" && m.status === "Suspended") ||
        (statusFilter === "Expired" && m.status === "Expired") ||
        (statusFilter === "Pending" && (m.status === "Pending Payment" || m.status === "Pending Approval"));

      const matchesPlan =
        planFilter === "All" ||
        m.plan.toLowerCase().includes(planFilter.toLowerCase());

      const matchesBiometric =
        biometricFilter === "All" ||
        (biometricFilter === "Registered" && m.biometric === "Registered") ||
        (biometricFilter === "Not Set" && m.biometric === "Not Set");

      return matchesSearch && matchesStatus && matchesPlan && matchesBiometric;
    });
  }, [members, searchQuery, statusFilter, planFilter, biometricFilter]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row relative font-sans overflow-x-hidden">
      
      {/* Mobile Control Header */}
      <header className="md:hidden flex items-center justify-between bg-[#0A0A0A] border-b border-[#1A1A1A] px-5 py-4 shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#E02020] flex items-center justify-center">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg tracking-wide uppercase font-bold text-white">Staff Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setBellOpen(!bellOpen)} className="relative p-1 text-[#8A8A8A] hover:text-white transition-colors cursor-pointer">
            <Bell className="h-5 w-5" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#E02020] text-white text-[8px] flex items-center justify-center font-bold">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="touch-target flex items-center justify-center rounded-md text-[#8A8A8A] hover:text-white"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Staff Sidebar (260px wide, #0A0A0A) */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-[260px] bg-[#0A0A0A] border-r border-[#1A1A1A] flex flex-col justify-between p-6 shrink-0 transition-transform duration-300 md:translate-x-0 md:static z-30",
        menuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="space-y-6 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-[#E02020] flex items-center justify-center shadow-lg shadow-[#E02020]/20">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl tracking-wide uppercase font-bold text-white">IronForge Gym</span>
            </div>
            <button className="md:hidden text-[#8A8A8A] hover:text-white" onClick={() => setMenuOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1.5 pt-4 overflow-y-auto flex-1 scrollbar-none">
            {/* Dashboard Overview */}
            <button
              onClick={() => { setActiveTab("overview"); setMenuOpen(false); }}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === "overview"
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <LayoutDashboard className="h-4 w-4 mr-3 shrink-0" />
              <span>Dashboard Overview</span>
            </button>

            {/* Members Section (Collapsible Submenu) */}
            <div className="space-y-1">
              <button
                onClick={() => setMembersMenuOpen(!membersMenuOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#8A8A8A] hover:text-white hover:bg-[#111111] transition-all"
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-3 shrink-0" />
                  <span>Members Directory</span>
                </div>
                {membersMenuOpen ? <ChevronUp className="h-3.5 w-3.5 text-[#555555]" /> : <ChevronDown className="h-3.5 w-3.5 text-[#555555]" />}
              </button>

              {membersMenuOpen && (
                <div className="pl-6 space-y-1 border-l border-[#1F1F1F] ml-[22px] mt-0.5">
                  <button
                    onClick={() => { setActiveTab("members"); setMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                      activeTab === "members" ? "text-[#E02020]" : "text-[#8A8A8A] hover:text-white"
                    )}
                  >
                    All Members
                  </button>
                  <button
                    onClick={() => { setActiveTab("pending"); setMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                      activeTab === "pending" ? "text-[#E02020]" : "text-[#8A8A8A] hover:text-white"
                    )}
                  >
                    <span>New Applications</span>
                    {applications.length > 0 && (
                      <span className="bg-[#E02020] text-white text-[8px] h-4 px-1.5 rounded-full flex items-center justify-center font-bold">
                        {applications.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => { setActiveTab("pending-payments"); setMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                      activeTab === "pending-payments" ? "text-[#E02020]" : "text-[#8A8A8A] hover:text-white"
                    )}
                  >
                    <span>Pending Payments</span>
                    {transactions.filter(t => t.status === "Pending Verify").length > 0 && (
                      <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] h-4 px-1.5 rounded-full flex items-center justify-center font-bold">
                        {transactions.filter(t => t.status === "Pending Verify").length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => { setActiveTab("manual"); setMenuOpen(false); }}
                    className={cn(
                      "w-full flex items-center px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                      activeTab === "manual" ? "text-[#E02020]" : "text-[#8A8A8A] hover:text-white"
                    )}
                  >
                    Register Walk-in
                  </button>
                </div>
              )}
            </div>

            {/* Biometric & Access */}
            <button
              onClick={() => { navigate({ to: "/admin/biometric" }); setMenuOpen(false); }}
              className="w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#8A8A8A] hover:text-white hover:bg-[#111111] transition-all"
            >
              <Fingerprint className="h-4 w-4 mr-3 shrink-0 text-[#E02020]/80" />
              <span>Biometric & Access</span>
            </button>

            {/* Attendance & Access */}
            <button
              onClick={() => { setActiveTab("attendance"); setMenuOpen(false); }}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === "attendance"
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <Calendar className="h-4 w-4 mr-3 shrink-0" />
              <span>Attendance & Access</span>
            </button>

            {/* Payments & Revenue */}
            <button
              onClick={() => { setActiveTab("payments"); setMenuOpen(false); }}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === "payments"
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <IndianRupee className="h-4 w-4 mr-3 shrink-0" />
              <span>Payments & Revenue</span>
            </button>

            {/* Live Occupancy */}
            <button
              onClick={() => { setActiveTab("occupancy"); setMenuOpen(false); }}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === "occupancy"
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <Activity className="h-4 w-4 mr-3 shrink-0" />
              <span>Live Occupancy</span>
            </button>

            {/* Notifications & Announcements */}
            <button
              onClick={() => { setActiveTab("notifications"); setMenuOpen(false); }}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === "notifications"
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <Bell className="h-4 w-4 mr-3 shrink-0" />
              <span>Notifications & Alerts</span>
            </button>

            {/* Staff Management */}
            <button
              onClick={() => { setActiveTab("staff"); setMenuOpen(false); }}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === "staff"
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <Contact className="h-4 w-4 mr-3 shrink-0" />
              <span>Staff Management</span>
            </button>

            {/* Grace Period Settings */}
            <button
              onClick={() => { navigate({ to: "/admin/grace" }); setMenuOpen(false); }}
              className="w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#8A8A8A] hover:text-white hover:bg-[#111111] transition-all"
            >
              <Clock className="h-4 w-4 mr-3 shrink-0 text-[#E02020]/80" />
              <span>Grace Period Settings</span>
            </button>

            {/* Bulk SMS Composer */}
            <button
              onClick={() => { navigate({ to: "/admin/sms" }); setMenuOpen(false); }}
              className="w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#8A8A8A] hover:text-white hover:bg-[#111111] transition-all"
            >
              <MessageSquare className="h-4 w-4 mr-3 shrink-0 text-[#E02020]/80" />
              <span>Bulk SMS Composer</span>
            </button>

            {/* Growth Reports */}
            <button
              onClick={() => { navigate({ to: "/admin/reports" }); setMenuOpen(false); }}
              className="w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#8A8A8A] hover:text-white hover:bg-[#111111] transition-all"
            >
              <TrendingUp className="h-4 w-4 mr-3 shrink-0 text-[#E02020]/80" />
              <span>Growth Reports</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => { setActiveTab("settings"); setMenuOpen(false); }}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === "settings"
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <Settings className="h-4 w-4 mr-3 shrink-0" />
              <span>Global Settings</span>
            </button>
          </nav>

          {/* User card bottom */}
          <div className="border-t border-[#1A1A1A] pt-4 mt-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-full bg-[#E02020]/10 border border-[#E02020]/20 flex items-center justify-center text-xs font-bold text-[#E02020]">
                GM
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-xs truncate text-white">Gaurav Mehta</div>
                <div className="text-[9px] text-[#8A8A8A] uppercase font-bold tracking-wider">Gym Manager</div>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-[#8A8A8A] hover:text-white hover:bg-[#111111] p-2 h-9 text-[10px] font-bold uppercase tracking-widest"
            >
              <LogOut className="h-4 w-4 mr-2 text-[#E02020]" /> Exit Staff Panel
            </Button>
          </div>
        </div>
      </aside>

      {/* Background shadow for mobile sidebar */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/80 md:hidden z-25" onClick={() => setMenuOpen(false)} />
      )}

      {/* Main Admin Content Container (#0D0D0D background) */}
      <div className="flex-1 bg-[#0D0D0D] min-w-0 flex flex-col justify-between min-h-[calc(100vh-65px)] md:min-h-screen">
        
        {/* Sticky Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-[#0A0A0A] border-b border-[#1A1A1A] shrink-0 z-10">
          <div className="flex items-center gap-3">
            <span className="font-display text-lg tracking-wide uppercase text-white font-bold">IronForge Gym</span>
            <span className="text-[#E02020] text-[9px] font-bold px-2 py-0.5 rounded bg-[#E02020]/10 border border-[#E02020]/20 font-mono">STAFF CONSOLE</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Notifications Bell */}
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
                <div className="font-semibold text-xs text-white">Gaurav Mehta</div>
                <div className="text-[9px] text-[#8A8A8A] uppercase font-bold tracking-wider">Gym Manager</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-[#E02020] flex items-center justify-center text-xs font-bold text-white shadow-md">
                GM
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
                className="absolute right-4 md:right-8 top-[60px] md:top-[70px] w-80 bg-[#111111] border border-[#222222] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col text-xs"
              >
                <div className="bg-[#0A0A0A] border-b border-[#222222] px-4 py-3 flex items-center justify-between">
                  <h3 className="font-display text-sm text-white font-bold uppercase tracking-wider">System Alerts</h3>
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
                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          setNotifications(prev => prev.map(item => item.id === n.id ? { ...item, read: true } : item));
                          setActiveTab("notifications");
                          setBellOpen(false);
                        }}
                        className={cn(
                          "p-3.5 space-y-1 transition-colors cursor-pointer text-left",
                          n.read ? "bg-transparent hover:bg-[#1A1A1A]/30" : "bg-[#E02020]/5 hover:bg-[#E02020]/10"
                        )}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={cn(
                            "h-7 w-7 rounded-md border flex items-center justify-center shrink-0 mt-0.5 border-[#222222] bg-[#111111]"
                          )}>
                            <Bell className="h-3.5 w-3.5 text-[#E02020]" />
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
                      No alerts
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
                    View all alerts
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Content Page wrapper */}
        <main className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {activeTab === "overview" && (
                <TabOverview
                  stats={stats}
                  applications={applications}
                  transactions={transactions}
                  handleApprove={handleApproveApplication}
                  handleReject={handleRejectApplication}
                  setActiveTab={setActiveTab}
                  strengthCount={strengthCount}
                  cardioCount={cardioCount}
                  yogaCount={yogaCount}
                  members={members}
                  setBiometricFilter={setBiometricFilter}
                  onSendAnnouncementClick={() => setAnnouncementModalOpen(true)}
                />
              )}
              {activeTab === "members" && (
                <TabAllMembers
                  filteredMembers={filteredMembers}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  planFilter={planFilter}
                  setPlanFilter={setPlanFilter}
                  biometricFilter={biometricFilter}
                  setBiometricFilter={setBiometricFilter}
                  selectedMemberIds={selectedMemberIds}
                  setSelectedMemberIds={setSelectedMemberIds}
                  setMembers={setMembers}
                />
              )}
              {activeTab === "pending" && (
                <TabPendingApplications
                  applications={applications}
                  handleApprove={handleApproveApplication}
                  handleReject={handleRejectApplication}
                  selectedAppForModal={selectedAppForModal}
                  setSelectedAppForModal={setSelectedAppForModal}
                />
              )}
              {activeTab === "pending-payments" && (
                <TabPendingPayments
                  transactions={transactions}
                  handleVerify={handleVerifyPayment}
                  handleReject={handleRejectPayment}
                />
              )}
              {activeTab === "manual" && (
                <TabManualRegistration
                  regName={regName} setRegName={setRegName}
                  regPhone={regPhone} setRegPhone={setRegPhone}
                  regEmail={regEmail} setRegEmail={setRegEmail}
                  regPlan={regPlan} setRegPlan={setRegPlan}
                  regMethod={regMethod} setRegMethod={setRegMethod}
                  regStatus={regStatus} setRegStatus={setRegStatus}
                  regLoc={regLoc} setRegLoc={setRegLoc}
                  regImmediateActive={regImmediateActive} setRegImmediateActive={setRegImmediateActive}
                  regBypassApproval={regBypassApproval} setRegBypassApproval={setRegBypassApproval}
                  regManualAmount={regManualAmount} setRegManualAmount={setRegManualAmount}
                  regStaffNotes={regStaffNotes} setRegStaffNotes={setRegStaffNotes}
                  handleSubmit={handleManualReg}
                />
              )}
              {activeTab === "payments" && (
                <TabPayments
                  transactions={transactions}
                  handleVerify={handleVerifyPayment}
                  handleReject={handleRejectPayment}
                />
              )}
              {activeTab === "attendance" && <TabAttendanceLog members={members} />}
              {activeTab === "occupancy" && (
                <TabLiveOccupancy
                  strengthCount={strengthCount} setStrengthCount={setStrengthCount}
                  cardioCount={cardioCount} setCardioCount={setCardioCount}
                  yogaCount={yogaCount} setYogaCount={setYogaCount}
                  strengthLimit={strengthLimit} setStrengthLimit={setStrengthLimit}
                  cardioLimit={cardioLimit} setCardioLimit={setCardioLimit}
                  yogaLimit={yogaLimit} setYogaLimit={setYogaLimit}
                />
              )}
              {activeTab === "notifications" && (
                <TabSystemAlerts
                  notifications={notifications}
                  setNotifications={setNotifications}
                />
              )}
              {activeTab === "reports" && <TabReports />}
              {activeTab === "settings" && <TabSettings />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Keyboard Shortcuts Floating Pill */}
        <div className="fixed bottom-4 left-4 z-40 hidden md:block">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#111111]/90 border border-[#222222] text-[#8A8A8A] text-[10px] font-mono shadow-xl backdrop-blur-md select-none hover:border-[#E02020]/25 transition-colors">
            <span className="flex items-center gap-1">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[#0A0A0A] border border-[#333] text-white text-[9px] font-bold font-sans">/</kbd> to search
            </span>
            <span className="text-[#333]">|</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#0A0A0A] border border-[#333] text-white text-[9px] font-bold font-sans">N</kbd> New
            </span>
            <span className="text-[#333]">|</span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-[#0A0A0A] border border-[#333] text-white text-[9px] font-bold font-sans">A</kbd> Appr
            </span>
          </div>
        </div>

        <footer className="border-t border-[#1A1A1A] bg-[#0A0A0A]/30 py-4 px-8 text-xs text-[#555555] text-center md:text-left shrink-0">
          IronForge Staff Control Panel. Unauthorized access strictly prohibited. Registered IP log recorded.
        </footer>
      </div>

      <ConfirmationModal
        isOpen={rejectAppConfirmOpen}
        onClose={() => {
          setRejectAppConfirmOpen(false);
          setAppToReject(null);
        }}
        onConfirm={confirmRejectApplication}
        title="Reject Application?"
        description={appToReject ? `Are you sure you want to reject the application from ${appToReject.name}? This action cannot be undone.` : ""}
        confirmText="Reject"
        cancelText="Cancel"
      />

      <ConfirmationModal
        isOpen={rejectPaymentConfirmOpen}
        onClose={() => {
          setRejectPaymentConfirmOpen(false);
          setPaymentToReject(null);
        }}
        onConfirm={confirmRejectPayment}
        title="Reject Payment?"
        description={paymentToReject ? `Are you sure you want to reject transaction ID ${paymentToReject}? This record will be permanently marked as rejected.` : ""}
        confirmText="Reject"
        cancelText="Cancel"
      />

      {/* Compose Announcement Modal */}
      {announcementModalOpen && (
        <div className="modal-overlay z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-xl bg-[#111111] border border-[#222222] overflow-hidden shadow-2xl text-xs"
          >
            <div className="bg-[#0A0A0A] border-b border-[#222222] px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">System Alert Broadcast</span>
                <h3 className="font-display text-xl text-white mt-0.5 uppercase font-bold">Send Announcement</h3>
              </div>
              <button onClick={() => setAnnouncementModalOpen(false)} className="text-[#8A8A8A] hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleModalBroadcast} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="modal-btitle" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Announcement Title</Label>
                <Input
                  id="modal-btitle"
                  placeholder="HIIT Morning Batch update, Facility maintenance..."
                  value={modalBTitle}
                  onChange={(e) => setModalBTitle(e.target.value)}
                  required
                  className="bg-[#111111] border-[#222222] h-10 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Audience Target</Label>
                <Select value={modalBTarget} onValueChange={setModalBTarget}>
                  <SelectTrigger className="bg-[#111111] border-[#222222] text-white text-xs h-10">
                    <SelectValue placeholder="All Members" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#222222] text-white">
                    <SelectItem value="all">All Members (Broadcast)</SelectItem>
                    <SelectItem value="active">Active Members Only</SelectItem>
                    <SelectItem value="expiring">Expiring within 7 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="modal-bmsg" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Message Details</Label>
                <textarea
                  id="modal-bmsg"
                  rows={4}
                  placeholder="Enter details visible on member dashboard boxes..."
                  value={modalBMsg}
                  onChange={(e) => setModalBMsg(e.target.value)}
                  required
                  className="w-full rounded-md border border-[#222222] bg-[#111111] p-3 text-white placeholder-[#555555] focus:outline-none focus:ring-1 focus:ring-[#E02020]"
                />
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setAnnouncementModalOpen(false)}
                  className="text-[#8A8A8A] hover:text-white h-10 text-xs font-bold uppercase"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-10 uppercase text-xs px-6"
                >
                  <Send className="h-4 w-4 mr-2" /> Dispatch
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}

// Helper: Custom Menu Icon component to avoid Lucide import collisions
function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

// Helpers
function randomDigits(n: number) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
}

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

// ================= PAGE 1: OVERVIEW DASHBOARD =================
function TabOverview({
  stats, applications, transactions, handleApprove, handleReject, setActiveTab,
  strengthCount, cardioCount, yogaCount, members, setBiometricFilter, onSendAnnouncementClick
}: {
  stats: any;
  applications: Application[];
  transactions: Transaction[];
  handleApprove: (a: Application) => void;
  handleReject: (a: Application) => void;
  setActiveTab: (t: AdminTab) => void;
  strengthCount: number;
  cardioCount: number;
  yogaCount: number;
  members: Member[];
  setBiometricFilter: (s: string) => void;
  onSendAnnouncementClick: () => void;
}) {
  const unregisteredActiveCount = useMemo(() => {
    return members.filter(m => (m.status === "Active" || m.status === "Expiring") && m.biometric === "Not Set").length;
  }, [members]);

  const pendingPaymentsCount = useMemo(() => {
    return transactions.filter(t => t.status === "Pending Verify").length;
  }, [transactions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">Manager Dashboard</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Hello, Gaurav. Review real-time performance grids.</p>
      </div>

      {unregisteredActiveCount > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in text-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-white">⚠️ {unregisteredActiveCount} active members have not registered their biometric yet</p>
              <p className="text-[#8A8A8A] mt-0.5">Members cannot pass turnstile gate check-in without fingerprint credentials.</p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab("members");
              setBiometricFilter("Not Set");
            }}
            className="text-amber-500 hover:text-amber-400 font-bold uppercase tracking-wider transition-colors hover:underline shrink-0"
          >
            View Members &rarr;
          </button>
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 text-center min-w-0">
          <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Total Members</span>
          <div className="font-display text-3xl font-bold text-white mt-1">{stats.total}</div>
        </div>
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 text-center">
          <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Active Members</span>
          <div className="font-display text-3xl font-bold text-emerald-400 mt-1">{stats.active}</div>
        </div>
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 text-center">
          <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Expiring 7d</span>
          <div className="font-display text-3xl font-bold text-amber-500 mt-1">{stats.expiring}</div>
        </div>
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 text-center">
          <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Revenue This Month</span>
          <div className="font-display text-2xl font-bold text-white mt-2">{formatINR(stats.revenue)}</div>
        </div>
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 text-center">
          <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-semibold">Today's Attendance</span>
          <div className="font-display text-3xl font-bold text-white mt-1">{stats.checkInsToday}</div>
        </div>
        <div className="rounded-xl border border-[#222222] bg-[#E02020]/5 border-dashed p-4 text-center">
          <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">Live Occupancy</span>
          <div className="font-display text-3xl font-bold text-[#E02020] mt-1">{stats.liveNow}</div>
        </div>
      </div>

      {/* Dashboard Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-display text-xs tracking-widest text-[#8A8A8A] uppercase font-bold">Dashboard Quick Actions</h3>
        <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Add New Member */}
          <div
            onClick={() => setActiveTab("manual")}
            className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 flex flex-col justify-between cursor-pointer hover:border-[#E02020]/50 transition-all hover:scale-[1.02] active:scale-[0.98] select-none h-28 group"
          >
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-[#E02020] shrink-0 border border-red-500/15 group-hover:bg-[#E02020] group-hover:text-white transition-all">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-sm font-bold text-white tracking-wide uppercase group-hover:text-[#E02020] transition-colors">+ Add New Member</div>
              <p className="text-[10px] text-[#8A8A8A] mt-0.5">Register manual walk-in member</p>
            </div>
          </div>

          {/* Pending Approvals */}
          <div
            onClick={() => setActiveTab("pending")}
            className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 flex flex-col justify-between cursor-pointer hover:border-[#E02020]/50 transition-all hover:scale-[1.02] active:scale-[0.98] select-none h-28 group relative"
          >
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/15 group-hover:bg-amber-500 group-hover:text-[#0A0A0A] transition-all">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            {applications.length > 0 && (
              <span className="absolute top-4 right-4 bg-[#E02020] text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                {applications.length}
              </span>
            )}
            <div>
              <div className="font-display text-sm font-bold text-white tracking-wide uppercase group-hover:text-amber-500 transition-colors">
                ✓ Pending Approvals ({applications.length})
              </div>
              <p className="text-[10px] text-[#8A8A8A] mt-0.5">Approve pending memberships</p>
            </div>
          </div>

          {/* Verify Cash Payments */}
          <div
            onClick={() => setActiveTab("pending-payments")}
            className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 flex flex-col justify-between cursor-pointer hover:border-[#E02020]/50 transition-all hover:scale-[1.02] active:scale-[0.98] select-none h-28 group relative"
          >
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-500/15 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <Receipt className="h-5 w-5" />
            </div>
            {pendingPaymentsCount > 0 && (
              <span className="absolute top-4 right-4 bg-amber-500 text-[#0A0A0A] text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold">
                {pendingPaymentsCount}
              </span>
            )}
            <div>
              <div className="font-display text-sm font-bold text-white tracking-wide uppercase group-hover:text-blue-400 transition-colors">
                💳 Verify Cash Payments ({pendingPaymentsCount})
              </div>
              <p className="text-[10px] text-[#8A8A8A] mt-0.5">Confirm manual payment receipts</p>
            </div>
          </div>

          {/* Send Announcement */}
          <div
            onClick={onSendAnnouncementClick}
            className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 flex flex-col justify-between cursor-pointer hover:border-[#E02020]/50 transition-all hover:scale-[1.02] active:scale-[0.98] select-none h-28 group"
          >
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/15 group-hover:bg-emerald-500 group-hover:text-[#0A0A0A] transition-all">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-sm font-bold text-white tracking-wide uppercase group-hover:text-emerald-400 transition-colors">📢 Send Announcement</div>
              <p className="text-[10px] text-[#8A8A8A] mt-0.5">Broadcast alert to member dashboards</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 12-Month Revenue line chart */}
        <div className="lg:col-span-2 rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
          <h3 className="font-display text-base tracking-wide uppercase text-white font-bold">12-Month Revenue Growth</h3>
          
          <div className="h-48 w-full pt-4">
            <svg className="w-full h-full" viewBox="0 0 500 150">
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E02020" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#E02020" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="120" x2="500" y2="120" stroke="#1A1A1A" strokeWidth="1" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#1A1A1A" strokeWidth="1" />
              <line x1="0" y1="40" x2="500" y2="40" stroke="#1A1A1A" strokeWidth="1" />
              
              {/* Glow Area */}
              <path d="M 10 110 L 50 105 L 90 102 L 130 95 L 170 88 L 210 82 L 250 75 L 290 70 L 330 62 L 370 52 L 410 42 L 450 30 L 450 140 L 10 140 Z" fill="url(#chartGlow)" />
              
              {/* Red Line */}
              <path d="M 10 110 L 50 105 L 90 102 L 130 95 L 170 88 L 210 82 L 250 75 L 290 70 L 330 62 L 370 52 L 410 42 L 450 30" fill="none" stroke="#E02020" strokeWidth="3" strokeLinecap="round" />
              
              {/* Data points */}
              {[
                {cx: 10, cy: 110}, {cx: 50, cy: 105}, {cx: 90, cy: 102}, {cx: 130, cy: 95},
                {cx: 170, cy: 88}, {cx: 210, cy: 82}, {cx: 250, cy: 75}, {cx: 290, cy: 70},
                {cx: 330, cy: 62}, {cx: 370, cy: 52}, {cx: 410, cy: 42}, {cx: 450, cy: 30}
              ].map((pt, i) => (
                <circle key={i} cx={pt.cx} cy={pt.cy} r="4" fill="#E02020" stroke="white" strokeWidth="1.5" />
              ))}
              
              {/* Labels */}
              <text x="10" y="140" fill="#555555" fontSize="8" textAnchor="middle">Jun</text>
              <text x="90" y="140" fill="#555555" fontSize="8" textAnchor="middle">Aug</text>
              <text x="170" y="140" fill="#555555" fontSize="8" textAnchor="middle">Oct</text>
              <text x="250" y="140" fill="#555555" fontSize="8" textAnchor="middle">Dec</text>
              <text x="330" y="140" fill="#555555" fontSize="8" textAnchor="middle">Feb</text>
              <text x="410" y="140" fill="#555555" fontSize="8" textAnchor="middle">Apr</text>
              <text x="450" y="140" fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">May (4.82L)</text>
            </svg>
          </div>
        </div>

        {/* Membership split Donut chart */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4 flex flex-col justify-between">
          <h3 className="font-display text-base tracking-wide uppercase text-white font-bold">Membership Split</h3>

          <div className="relative h-28 w-28 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="35" stroke="#E02020" strokeWidth="12" fill="transparent" strokeDasharray="219.9" strokeDashoffset="0" />
              <circle cx="50" cy="50" r="35" stroke="#F59E0B" strokeWidth="12" fill="transparent" strokeDasharray="219.9" strokeDashoffset={219.9 * 0.45} />
              <circle cx="50" cy="50" r="35" stroke="#10B981" strokeWidth="12" fill="transparent" strokeDasharray="219.9" strokeDashoffset={219.9 * (0.45 + 0.28)} />
            </svg>
            <div className="absolute text-center space-y-0.5">
              <div className="text-[9px] text-[#8A8A8A] font-bold">TOTAL</div>
              <div className="font-display text-lg font-bold text-white">347</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 text-center text-[9px] font-bold">
            <div className="space-y-1">
              <span className="block h-2 w-2 rounded-full bg-[#10B981] mx-auto" />
              <div className="text-[#8A8A8A]">MONTHLY</div>
              <div className="text-white">28%</div>
            </div>
            <div className="space-y-1">
              <span className="block h-2 w-2 rounded-full bg-[#E02020] mx-auto" />
              <div className="text-[#8A8A8A]">QUARTERLY</div>
              <div className="text-white">45%</div>
            </div>
            <div className="space-y-1">
              <span className="block h-2 w-2 rounded-full bg-[#F59E0B] mx-auto" />
              <div className="text-[#8A8A8A]">ANNUAL</div>
              <div className="text-white">27%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Applications + Recent Payments + Live Occupancy Mini */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Applications & Recent Payments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Applications table */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1A1A1A] flex justify-between items-center bg-[#0C0C0C]">
              <h3 className="font-display text-base tracking-wide uppercase text-white font-bold">Latest Registrants</h3>
              <button
                onClick={() => setActiveTab("pending")}
                className="text-xs text-[#E02020] hover:underline font-semibold"
              >
                Full Queue ({applications.length})
              </button>
            </div>

            {applications.length > 0 ? (
              <div className="overflow-x-auto -mx-px">
                <table className="w-full min-w-[540px] text-left border-collapse text-xs text-[#CFCFCF]">
                  <thead>
                    <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
                      <th className="px-6 py-3.5">Name</th>
                      <th className="px-6 py-3.5">Plan</th>
                      <th className="px-6 py-3.5">Verification Mode</th>
                      <th className="px-6 py-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161616]">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-[#111111]/80 transition-colors">
                        <td className="px-6 py-3.5 font-semibold text-white">{app.name}</td>
                        <td className="px-6 py-3.5 uppercase font-medium">{app.plan}</td>
                        <td className="px-6 py-3.5">
                          <span className="text-amber-500 font-semibold">{app.paymentMode}</span>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(app)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-3 text-[10px] font-bold uppercase"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReject(app)}
                              className="bg-red-600/10 border border-red-600/20 text-red-400 hover:bg-red-600/25 h-7 px-3 text-[10px] font-bold uppercase"
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#555555]">
                No pending registration requests in queue.
              </div>
            )}
          </div>

          {/* Recent Payments (Last 10 transactions) */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1A1A1A] flex justify-between items-center bg-[#0C0C0C]">
              <h3 className="font-display text-base tracking-wide uppercase text-white font-bold">Recent Payments</h3>
              <button
                onClick={() => setActiveTab("payments")}
                className="text-xs text-[#8A8A8A] hover:text-white font-semibold"
              >
                View Ledger
              </button>
            </div>
            <div className="overflow-x-auto -mx-px">
              <table className="w-full min-w-[600px] text-left border-collapse text-xs text-[#CFCFCF]">
                <thead>
                  <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Member</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Method</th>
                    <th className="px-6 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616]">
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#111111]/80 transition-colors">
                      <td className="px-6 py-2.5 text-[#8A8A8A]">{tx.date}</td>
                      <td className="px-6 py-2.5 font-semibold text-white">{tx.name}</td>
                      <td className="px-6 py-2.5 font-bold text-white">{formatINR(tx.amount)}</td>
                      <td className="px-6 py-2.5 text-[#8A8A8A] font-mono">{tx.method}</td>
                      <td className="px-6 py-2.5">
                        <div className="flex justify-center">
                          <Badge
                            className={cn(
                              "text-[8px] uppercase tracking-wider py-0.5",
                              tx.status === "Paid" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            )}
                          >
                            {tx.status}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right side: Live Occupancy Mini Widget */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4 h-fit">
          <div className="flex justify-between items-center pb-2 border-b border-[#1A1A1A]">
            <h3 className="font-display text-base tracking-wide uppercase text-white font-bold">Gate Monitor</h3>
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10">ONLINE</Badge>
          </div>

          <div className="text-center py-4 space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Live Inside Facility</span>
            <div className="font-display text-5xl font-black text-white">{stats.liveNow}</div>
            <div className="text-xs text-[#8A8A8A]">
              Capacity Filled: <strong className="text-white">{Math.round((stats.liveNow / 80) * 100)}%</strong>
            </div>
            
            <div className="h-2 w-full bg-[#1A1A1A] rounded-full overflow-hidden mt-3 border border-[#222] max-w-[200px] mx-auto">
              <div 
                className="h-full bg-[#E02020] transition-all duration-500" 
                style={{ width: `${(stats.liveNow / 80) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3 pt-3 border-t border-[#1A1A1A] text-xs">
            <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">Zone Distribution</span>
            
            <div className="flex justify-between items-center bg-[#111111] p-2.5 rounded-lg border border-[#1A1A1A]">
              <span className="font-semibold text-white">Strength Section</span>
              <span className="font-bold text-[#E02020]">{strengthCount} / 40</span>
            </div>
            <div className="flex justify-between items-center bg-[#111111] p-2.5 rounded-lg border border-[#1A1A1A]">
              <span className="font-semibold text-white">Cardio Zone</span>
              <span className="font-bold text-emerald-400">{cardioCount} / 20</span>
            </div>
            <div className="flex justify-between items-center bg-[#111111] p-2.5 rounded-lg border border-[#1A1A1A]">
              <span className="font-semibold text-white">Yoga/CrossFit Room</span>
              <span className="font-bold text-emerald-400">{yogaCount} / 20</span>
            </div>
          </div>

          <Button
            onClick={() => setActiveTab("occupancy")}
            className="w-full bg-[#1A1A1A] hover:bg-[#252525] border border-[#222222] text-[#CFCFCF] text-xs font-bold uppercase py-4"
          >
            Override Gate Controls
          </Button>
        </div>

      </div>
    </div>
  );
}

// ================= PAGE 2: ALL MEMBERS =================
function TabAllMembers({
  filteredMembers, searchQuery, setSearchQuery, statusFilter, setStatusFilter,
  planFilter, setPlanFilter, biometricFilter, setBiometricFilter,
  selectedMemberIds, setSelectedMemberIds, setMembers
}: {
  filteredMembers: Member[];
  searchQuery: string;
  setSearchQuery: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  planFilter: string;
  setPlanFilter: (s: string) => void;
  biometricFilter: string;
  setBiometricFilter: (s: string) => void;
  selectedMemberIds: string[];
  setSelectedMemberIds: React.Dispatch<React.SetStateAction<string[]>>;
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
}) {
  const navigate = useNavigate();
  const [activeDropdownMemberId, setActiveDropdownMemberId] = useState<string | null>(null);
  const [biometricModalMember, setBiometricModalMember] = useState<Member | null>(null);

  const handleRemoveBiometric = (memberId: string) => {
    setMembers(prev => prev.map(m => m.memberId === memberId ? { ...m, biometric: "Not Set" } : m));
    const usersStr = localStorage.getItem("registered_users");
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        const updated = users.map((u: any) => u.memberId === memberId ? { ...u, biometric: "Not Set" } : u);
        localStorage.setItem("registered_users", JSON.stringify(updated));
      } catch (e) {}
    }

    // Write activity log
    const logsStr = localStorage.getItem(`activity_logs_${memberId}`);
    let logs = [];
    if (logsStr) {
      try { logs = JSON.parse(logsStr); } catch (e) {}
    } else {
      logs = [
        { title: "Membership renewed by Admin Gaurav", date: "12 Feb 2025", desc: "Approved cycle of Quarterly Premium (INV-2025-0182)" },
        { title: "SMS sent - renewal reminder", date: "5 Feb 2025", desc: "Automated alert sent to member mobile +91 98765 43210" },
        { title: "Biometric registered", date: "14 Feb 2024", desc: "Turnstile gate fingerprint and camera credentials synchronized" },
        { title: "Account approved by Admin", date: "13 Feb 2024", desc: "Verified initial cash receipt and created Member pass ID" },
        { title: "Application submitted", date: "12 Feb 2024", desc: "Registrant signup completed via ironforge.in/join" },
      ];
    }
    const newEntry = {
      title: "Biometric removed",
      date: "29 May 2025",
      desc: "Biometric access removed — 29 May 2025 — by Gaurav Mehta"
    };
    localStorage.setItem(`activity_logs_${memberId}`, JSON.stringify([newEntry, ...logs]));

    toast.error("Biometric access removed");
  };

  // Toggle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMemberIds(filteredMembers.map(m => m.memberId));
    } else {
      setSelectedMemberIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedMemberIds(prev => [...prev, id]);
    } else {
      setSelectedMemberIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkAction = (action: "csv" | "sms" | "suspend") => {
    if (selectedMemberIds.length === 0) return;
    
    if (action === "csv") {
      toast.success(`Exported CSV for ${selectedMemberIds.length} selected members.`);
    } else if (action === "sms") {
      toast.success(`Mock SMS notification dispatched to ${selectedMemberIds.length} members.`);
    } else if (action === "suspend") {
      setMembers(prev => 
        prev.map(m => selectedMemberIds.includes(m.memberId) ? { ...m, status: "Suspended" } : m)
      );
      toast.error(`Suspended ${selectedMemberIds.length} selected members.`);
    }
    setSelectedMemberIds([]);
  };

  // Row operations
  const handleRowAction = (id: string, action: "suspend" | "renew" | "edit" | "approve" | "verify_payment") => {
    if (action === "suspend") {
      setMembers(prev => prev.map(m => m.memberId === id ? { ...m, status: "Suspended" } : m));
      // Update in registered_users in localStorage
      const usersStr = localStorage.getItem("registered_users");
      if (usersStr) {
        try {
          const users = JSON.parse(usersStr);
          const updated = users.map((u: any) => u.memberId === id ? { ...u, status: "Suspended" } : u);
          localStorage.setItem("registered_users", JSON.stringify(updated));
        } catch (e) {}
      }
      toast.error(`Suspended member ${id}`);
    } else if (action === "renew") {
      setMembers(prev => prev.map(m => m.memberId === id ? { ...m, status: "Active", expiry: "31 Dec 2026" } : m));
      // Update in registered_users in localStorage
      const usersStr = localStorage.getItem("registered_users");
      if (usersStr) {
        try {
          const users = JSON.parse(usersStr);
          const updated = users.map((u: any) => u.memberId === id ? { ...u, status: "Active" } : u);
          localStorage.setItem("registered_users", JSON.stringify(updated));
        } catch (e) {}
      }
      toast.success(`Renewed member ${id} until 31 Dec 2026`);
    } else if (action === "edit") {
      toast.info(`Profile editor for ${id} loaded (Simulation)`);
    } else if (action === "approve" || action === "verify_payment") {
      setMembers(prev => prev.map(m => m.memberId === id ? { ...m, status: "Active", biometric: "Not Set" } : m));
      // Update in registered_users in localStorage
      const usersStr = localStorage.getItem("registered_users");
      let memberName = id;
      if (usersStr) {
        try {
          const users = JSON.parse(usersStr);
          const updated = users.map((u: any) => {
            if (u.memberId === id) {
              memberName = u.fullName;
              return { ...u, status: "Active", biometric: "Not Set" };
            }
            return u;
          });
          localStorage.setItem("registered_users", JSON.stringify(updated));
        } catch (e) {}
      }
      toast.success(
        <div className="space-y-1 text-left">
          <div className="font-semibold text-white">✅ {memberName} is now active!</div>
          <div className="text-xs text-[#8A8A8A] font-normal leading-relaxed">
            Status updated to Active. Ask them to place their finger on the device to register biometric.
          </div>
        </div>,
        { duration: 6000 }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">All Gym Members</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Audit, edit, suspend or renew full subscription cards.</p>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A8A]" />
          <Input
            id="admin-search-input"
            placeholder="Search name, member ID, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#0A0A0A] border-[#222222] h-11 text-xs focus-visible:ring-[#E02020]"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-44">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-[#0A0A0A] border-[#222222] h-11 text-white text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-[#111111] border-[#222222] text-white">
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Active">Active Only</SelectItem>
              <SelectItem value="Suspended">Suspended</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
              <SelectItem value="Pending">Pending verify</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plan Filter */}
        <div className="w-full sm:w-44">
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="bg-[#0A0A0A] border-[#222222] h-11 text-white text-xs">
              <SelectValue placeholder="All Plans" />
            </SelectTrigger>
            <SelectContent className="bg-[#111111] border-[#222222] text-white">
              <SelectItem value="All">All Plans</SelectItem>
              <SelectItem value="Standard">Monthly Standard</SelectItem>
              <SelectItem value="Premium">Quarterly Premium</SelectItem>
              <SelectItem value="Elite">Annual Elite</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Biometric Filter */}
        <div className="w-full sm:w-44">
          <Select value={biometricFilter} onValueChange={setBiometricFilter}>
            <SelectTrigger className="bg-[#0A0A0A] border-[#222222] h-11 text-white text-xs">
              <SelectValue placeholder="All Biometric" />
            </SelectTrigger>
            <SelectContent className="bg-[#111111] border-[#222222] text-white">
              <SelectItem value="All">All Biometric</SelectItem>
              <SelectItem value="Registered">✅ Registered</SelectItem>
              <SelectItem value="Not Set">❌ Not Set</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedMemberIds.length > 0 && (
        <div className="p-3 bg-[#161616] border border-[#E02020]/20 rounded-xl flex items-center justify-between text-xs text-[#CFCFCF] animate-fade-in">
          <span className="font-semibold text-white">
            {selectedMemberIds.length} members selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleBulkAction("csv")}
              className="bg-[#1A1A1A] border border-[#222222] hover:bg-[#E02020] h-8 text-[10px] uppercase font-bold"
            >
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => handleBulkAction("sms")}
              className="bg-[#1A1A1A] border border-[#222222] hover:bg-[#E02020] h-8 text-[10px] uppercase font-bold"
            >
              Send SMS
            </Button>
            <Button
              size="sm"
              onClick={() => handleBulkAction("suspend")}
              className="bg-red-950 border border-red-500/20 hover:bg-red-900 text-red-400 h-8 text-[10px] uppercase font-bold"
            >
              Suspend Selected
            </Button>
          </div>
        </div>
      )}

      {/* Directory Data Table */}
      <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
        <div className="overflow-x-auto -mx-px">
          <table className="w-full min-w-[520px] text-left border-collapse text-xs text-[#CFCFCF] table-sticky-first">
            <thead>
              <tr className="border-b border-[#1A1A1A] bg-[#0C0C0C] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
                <th className="px-4 sm:px-6 py-4 w-12 text-center hide-col-mobile">
                  <input
                    type="checkbox"
                    checked={filteredMembers.length > 0 && selectedMemberIds.length === filteredMembers.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="accent-[#E02020] h-3.5 w-3.5 rounded border-[#222] bg-[#111]"
                  />
                </th>
                <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Name / Contact</th>
                <th className="px-4 sm:px-6 py-4 hide-col-mobile whitespace-nowrap">Member ID</th>
                <th className="px-4 sm:px-6 py-4 hide-col-mobile whitespace-nowrap">Plan</th>
                <th className="px-4 sm:px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-4 sm:px-6 py-4 hide-col-mobile whitespace-nowrap">Joined</th>
                <th className="px-4 sm:px-6 py-4 hide-col-mobile whitespace-nowrap">Expiry</th>
                <th className="px-4 sm:px-6 py-4 hide-col-mobile whitespace-nowrap">Biometric</th>
                <th className="px-4 sm:px-6 py-4 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {filteredMembers.map((m) => {
                const isSelected = selectedMemberIds.includes(m.memberId);
                const initials = m.name.split(" ").map(n => n[0]).slice(0, 2).join("");
                return (
                  <tr key={m.memberId} className={cn("hover:bg-[#111111]/80 transition-colors", isSelected && "bg-[#E02020]/5")}>
                    <td className="px-4 sm:px-6 py-3.5 text-center hide-col-mobile">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(m.memberId, e.target.checked)}
                        className="accent-[#E02020] h-3.5 w-3.5 rounded border-[#222] bg-[#111]"
                      />
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 min-w-[160px]">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[#E02020] flex items-center justify-center font-bold text-white text-xs">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{m.name}</div>
                          <div className="text-[10px] text-[#555555] mt-0.5">{m.email} · {m.mobile}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 font-mono text-white font-semibold cursor-pointer hide-col-mobile" onClick={() => navigate({ to: `/admin/members/${m.memberId}` })}>
                      {m.memberId}
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 uppercase font-medium hide-col-mobile">{m.plan}</td>
                    <td className="px-4 sm:px-6 py-3.5">
                      <Badge
                        className={cn(
                          "text-[9px] font-bold uppercase tracking-wider py-0.5 px-2",
                          m.status === "Active" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                          m.status === "Expiring" && "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                          m.status === "Expired" && "bg-red-500/10 text-red-500 border border-red-500/20",
                          m.status === "Suspended" && "bg-[#222222] text-[#8A8A8A] border border-[#333]",
                          (m.status === "Pending Payment" || m.status === "Pending Approval") && "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        )}
                      >
                        {m.statusText || m.status}
                      </Badge>
                    </td>
                    <td className="px-4 sm:px-6 py-3.5 text-[#8A8A8A] hide-col-mobile">{m.joined}</td>
                    <td className="px-4 sm:px-6 py-3.5 text-[#8A8A8A] hide-col-mobile">{m.expiry}</td>
                    <td className="px-4 sm:px-6 py-3.5 relative hide-col-mobile">
                      {m.biometric === "Registered" ? (
                        <div className="relative inline-block">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDropdownMemberId(activeDropdownMemberId === m.memberId ? null : m.memberId);
                            }}
                            className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full flex items-center gap-1 hover:bg-emerald-500/20 transition-all cursor-pointer"
                          >
                            <span>✅ Registered</span>
                            <ChevronDown className="h-3 w-3 text-emerald-400" />
                          </button>
                          {activeDropdownMemberId === m.memberId && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setActiveDropdownMemberId(null)} />
                              <div className="absolute left-0 mt-1 w-48 rounded-lg bg-[#111111] border border-[#222222] py-1 shadow-xl z-20 animate-fade-in text-[11px] text-left">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownMemberId(null);
                                    setBiometricModalMember(m);
                                  }}
                                  className="w-full text-left px-3 py-2 text-[#CFCFCF] hover:bg-[#E02020] hover:text-white transition-colors uppercase font-bold"
                                >
                                  Re-register Biometric
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveDropdownMemberId(null);
                                    handleRemoveBiometric(m.memberId);
                                  }}
                                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors border-t border-[#1A1A1A] uppercase font-bold"
                                >
                                  Remove Biometric Access
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBiometricModalMember(m);
                          }}
                          className="bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold uppercase tracking-wider py-1 px-2.5 rounded-full hover:bg-red-500/20 transition-all cursor-pointer"
                        >
                          ❌ Not Set
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => navigate({ to: `/admin/members/${m.memberId}` })}
                          className="bg-[#111111] hover:bg-[#E02020] text-white border border-[#222222] h-7 px-2.5 text-[9px] uppercase font-bold"
                          title="View Profile"
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleRowAction(m.memberId, "edit")}
                          className="bg-[#111111] hover:bg-[#222222] border border-[#222222] text-[#8A8A8A] hover:text-white h-7 px-2 text-[9px] font-bold"
                          title="Edit Profile"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {m.status === "Pending Approval" ? (
                          <Button
                            size="sm"
                            onClick={() => handleRowAction(m.memberId, "approve")}
                            className="bg-transparent text-emerald-400 border border-emerald-950 hover:bg-emerald-950/20 h-7 px-2.5 text-[9px] uppercase font-bold"
                            title="Approve Member"
                          >
                            Approve
                          </Button>
                        ) : m.status === "Pending Payment" ? (
                          <Button
                            size="sm"
                            onClick={() => handleRowAction(m.memberId, "verify_payment")}
                            className="bg-transparent text-blue-400 border border-blue-950 hover:bg-blue-950/20 h-7 px-2 text-[9px] uppercase font-bold"
                            title="Verify Payment"
                          >
                            Verify Payment
                          </Button>
                        ) : m.status !== "Suspended" ? (
                          <Button
                            size="sm"
                            onClick={() => handleRowAction(m.memberId, "suspend")}
                            className="bg-transparent text-red-400 border border-red-950 hover:bg-red-950/20 h-7 px-2 text-[9px]"
                            title="Suspend Member"
                          >
                            Suspend
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleRowAction(m.memberId, "renew")}
                            className="bg-transparent text-emerald-400 border border-emerald-950 hover:bg-emerald-950/20 h-7 px-2 text-[9px]"
                            title="Activate / Renew"
                          >
                            Renew
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-xs text-[#555555]">
                    No members match search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Biometric Registration Modal */}
      {biometricModalMember && (
        <div className="modal-overlay z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-xl bg-[#111111] border border-[#222222] overflow-hidden"
          >
            <div className="bg-[#0A0A0A] border-b border-[#222222] px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">ZKTeco Hardware Integration</span>
                <h3 className="font-display text-xl text-white mt-0.5 uppercase font-bold">Register Biometric — {biometricModalMember.name}</h3>
              </div>
              <button onClick={() => setBiometricModalMember(null)} className="text-[#8A8A8A] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Member card inside modal */}
              <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#222222] space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-[#1A1A1A]">
                  <span className="font-bold text-white uppercase text-sm">{biometricModalMember.name}</span>
                  <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 uppercase text-[9px] font-bold py-0">{biometricModalMember.status}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[#8A8A8A]">
                  <div>Member ID: <span className="text-white font-mono">{biometricModalMember.memberId}</span></div>
                  <div>Plan: <span className="text-white">{biometricModalMember.plan}</span></div>
                </div>
              </div>

              <div className="p-3 bg-[#E02020]/5 border border-[#E02020]/20 rounded-lg text-[#CFCFCF] space-y-2">
                <p className="font-medium text-white">Fingerprint Scanner Ready</p>
                <p className="text-[11px] leading-relaxed">
                  Ask <strong className="text-white">{biometricModalMember.name}</strong> to place their finger on the ZKTeco device at reception. Once their fingerprint is captured, click confirm below.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={() => {
                    const memberId = biometricModalMember.memberId;
                    setMembers(prev => prev.map(m => m.memberId === memberId ? { ...m, biometric: "Registered" } : m));
                    
                    const usersStr = localStorage.getItem("registered_users");
                    if (usersStr) {
                      try {
                        const users = JSON.parse(usersStr);
                        const updated = users.map((u: any) => u.memberId === memberId ? { ...u, biometric: "Registered" } : u);
                        localStorage.setItem("registered_users", JSON.stringify(updated));
                      } catch(e) {}
                    }

                    // Write activity log
                    const logsStr = localStorage.getItem(`activity_logs_${memberId}`);
                    let logs = [];
                    if (logsStr) {
                      try { logs = JSON.parse(logsStr); } catch (e) {}
                    } else {
                      logs = [
                        { title: "Membership renewed by Admin Gaurav", date: "12 Feb 2025", desc: "Approved cycle of Quarterly Premium (INV-2025-0182)" },
                        { title: "SMS sent - renewal reminder", date: "5 Feb 2025", desc: "Automated alert sent to member mobile +91 98765 43210" },
                        { title: "Biometric registered", date: "14 Feb 2024", desc: "Turnstile gate fingerprint and camera credentials synchronized" },
                        { title: "Account approved by Admin", date: "13 Feb 2024", desc: "Verified initial cash receipt and created Member pass ID" },
                        { title: "Application submitted", date: "12 Feb 2024", desc: "Registrant signup completed via ironforge.in/join" },
                      ];
                    }
                    const newEntry = {
                      title: "Biometric registered",
                      date: "29 May 2025",
                      desc: "Biometric registered — 29 May 2025 — by Gaurav Mehta"
                    };
                    localStorage.setItem(`activity_logs_${memberId}`, JSON.stringify([newEntry, ...logs]));

                    toast.success(`Biometric registered for ${biometricModalMember.name}`);
                    setBiometricModalMember(null);
                  }}
                  className="flex-1 bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-10 uppercase text-xs"
                >
                  ✓ Biometric Registered
                </Button>
                <button
                  onClick={() => setBiometricModalMember(null)}
                  className="text-[#8A8A8A] hover:text-white uppercase font-bold text-xs px-2 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ================= PAGE 3: PENDING APPLICATIONS =================
function TabPendingApplications({
  applications, handleApprove, handleReject, selectedAppForModal, setSelectedAppForModal
}: {
  applications: Application[];
  handleApprove: (a: Application) => void;
  handleReject: (a: Application) => void;
  selectedAppForModal: Application | null;
  setSelectedAppForModal: (a: Application | null) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">New Registrant queue</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Review new applications submitted online. Validate identity, biometrics, and fees.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applications.map((app) => (
          <div key={app.id} className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">New Registrant</span>
                  <h3 className="font-display text-2xl text-white tracking-wide mt-1 uppercase font-bold">{app.name}</h3>
                </div>
                <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/10 font-bold uppercase tracking-wider py-0.5 px-2">
                  Pending Payment
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-[#CFCFCF] pt-2 border-t border-[#1A1A1A]">
                <div>
                  <span className="text-[#8A8A8A] uppercase text-[9px] tracking-wider block">Plan selected</span>
                  <span className="font-semibold text-white uppercase">{app.plan} Package</span>
                </div>
                <div>
                  <span className="text-[#8A8A8A] uppercase text-[9px] tracking-wider block">Price amount</span>
                  <span className="font-semibold text-white">{formatINR(app.amount)}</span>
                </div>
                <div>
                  <span className="text-[#8A8A8A] uppercase text-[9px] tracking-wider block">Mobile</span>
                  <span className="font-medium text-white">{app.mobile}</span>
                </div>
                <div>
                  <span className="text-[#8A8A8A] uppercase text-[9px] tracking-wider block">Applied Date</span>
                  <span className="font-medium text-white">{app.date} May</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-[#151515]">
                  <span className="text-[#8A8A8A] uppercase text-[9px] tracking-wider block">Reference Mode</span>
                  <span className="text-amber-500 font-semibold">{app.paymentMode}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 border-t border-[#1A1A1A] pt-4">
              <Button
                onClick={() => setSelectedAppForModal(app)}
                className="flex-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#222222] text-[#CFCFCF] font-bold text-xs uppercase h-10"
              >
                View Details
              </Button>
              <Button
                onClick={() => handleApprove(app)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase h-10 px-4"
              >
                Approve
              </Button>
              <Button
                onClick={() => handleReject(app)}
                className="bg-red-600/10 border border-red-600/20 text-red-400 hover:bg-red-600/25 font-bold text-xs uppercase h-10 px-4"
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
        {applications.length === 0 && (
          <div className="col-span-2 py-12 text-center rounded-xl border border-dashed border-[#222222] bg-[#0A0A0A] text-[#555555] text-sm">
            All applications processed. No pending requests.
          </div>
        )}
      </div>

      {/* Registration Details Modal */}
      {selectedAppForModal && (
        <div className="modal-overlay z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xl rounded-xl bg-[#111111] border border-[#222222] overflow-hidden"
          >
            <div className="bg-[#0A0A0A] border-b border-[#222222] px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">Applicant Dossier</span>
                <h3 className="font-display text-2xl text-white mt-0.5 uppercase font-bold">{selectedAppForModal.name}</h3>
              </div>
              <button onClick={() => setSelectedAppForModal(null)} className="text-[#8A8A8A] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-[#CFCFCF] overflow-y-auto max-h-[70vh]">
              {/* Health and Biometrics */}
              <div className="space-y-3">
                <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold block">Biometric & Health Profile</span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A]">
                    <span className="text-[8px] text-[#555555] block uppercase font-bold">Height</span>
                    <span className="font-semibold text-white">{selectedAppForModal.height || "175 cm"}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A]">
                    <span className="text-[8px] text-[#555555] block uppercase font-bold">Weight</span>
                    <span className="font-semibold text-white">{selectedAppForModal.weight || "78 kg"}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A]">
                    <span className="text-[8px] text-[#555555] block uppercase font-bold">BMI</span>
                    <span className="font-semibold text-white">{selectedAppForModal.bmi || 24.2}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A]">
                    <span className="text-[8px] text-[#555555] block uppercase font-bold">Blood Group</span>
                    <span className="font-semibold text-white">{selectedAppForModal.bloodGroup || "O+"}</span>
                  </div>
                </div>
              </div>

              {/* Targets / Conditions */}
              <div className="grid grid-cols-2 gap-4 border-t border-[#1A1A1A] pt-4">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">Workout Goals</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(selectedAppForModal.goals || ["Weight Loss", "Muscle Gain"]).map((g) => (
                      <Badge key={g} className="bg-[#E02020]/10 text-[#E02020] border border-[#E02020]/20 hover:bg-[#E02020]/10 text-[9px] py-0 px-2 font-bold uppercase">{g}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">Medical Constraints</span>
                  <span className="font-semibold text-white">{(selectedAppForModal.conditions && selectedAppForModal.conditions.length > 0) ? selectedAppForModal.conditions.join(", ") : "None Registered"}</span>
                </div>
              </div>

              {/* Signature / Waiver */}
              <div className="border-t border-[#1A1A1A] pt-4 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-0.5">Signature Consent</span>
                  <span className="font-mono text-sm text-white italic tracking-wider block pt-1 border border-dashed border-[#222] p-2 bg-[#0A0A0A]/50 rounded">
                    ✍️ {selectedAppForModal.signature || selectedAppForModal.name}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-0.5">Verification Receipt Proof</span>
                  <div className="pt-2">
                    {selectedAppForModal.paymentMode.includes("Online") ? (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1.5 font-mono">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" /> Razorpay Txn ID: {randomDigits(12)}
                      </span>
                    ) : (
                      <span className="text-amber-500 font-semibold flex items-center gap-1.5 font-mono">
                        <Smartphone className="h-4 w-4 shrink-0 text-amber-500" /> Cash desk collections receipt pending
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-[#1A1A1A] pt-4 flex gap-3">
                <Button
                  onClick={() => {
                    handleApprove(selectedAppForModal);
                    setSelectedAppForModal(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 uppercase text-xs"
                >
                  Approve Registration & Sync pass
                </Button>
                <Button
                  onClick={() => {
                    handleReject(selectedAppForModal);
                    setSelectedAppForModal(null);
                  }}
                  className="bg-red-950 border border-red-500/20 text-red-400 hover:bg-red-900 h-11 px-4 text-xs font-bold uppercase"
                >
                  Reject application
                </Button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ================= PAGE 3-SUB: PENDING PAYMENTS =================
function TabPendingPayments({
  transactions, handleVerify, handleReject
}: {
  transactions: Transaction[];
  handleVerify: (id: string) => void;
  handleReject: (id: string) => void;
}) {
  const pendingTransactions = transactions.filter(t => t.status === "Pending Verify");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">Pending Payment Verifications</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Audit cash deposits and offline receipt transactions before activating accounts.</p>
      </div>

      <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1A1A1A] bg-[#0C0C0C] flex justify-between items-center">
          <h3 className="font-display text-base tracking-wide uppercase text-white font-bold">Unverified Deposits</h3>
          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">{pendingTransactions.length} Pending</Badge>
        </div>

        {pendingTransactions.length > 0 ? (
          <div className="overflow-x-auto -mx-px">
            <table className="w-full min-w-[640px] text-left border-collapse text-xs text-[#CFCFCF]">
              <thead>
                <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
                  <th className="px-6 py-4">Transaction ID</th>
                  <th className="px-6 py-4">Member Name</th>
                  <th className="px-6 py-4">Plan Billed</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Payment Method</th>
                  <th className="px-6 py-4 text-center">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161616]">
                {pendingTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-[#111111]/80 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-[#8A8A8A]">{tx.id}</td>
                    <td className="px-6 py-3.5 font-semibold text-white">{tx.name}</td>
                    <td className="px-6 py-3.5 uppercase">{tx.plan}</td>
                    <td className="px-6 py-3.5 font-bold text-white">{formatINR(tx.amount)}</td>
                    <td className="px-6 py-3.5 text-[#8A8A8A] font-medium">{tx.method}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          onClick={() => handleVerify(tx.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white h-7 px-3 text-[10px] font-bold uppercase"
                        >
                          Mark Payment Verified
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(tx.id)}
                          className="bg-red-600/10 border border-red-600/20 text-red-400 hover:bg-red-600/25 h-7 px-3 text-[10px] font-bold uppercase"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#555555]">
            No outstanding deposits pending manual cash/UPI desk verification.
          </div>
        )}
      </div>
    </div>
  );
}

// ================= PAGE 4: MANUAL MEMBER REGISTRATION =================
function TabManualRegistration({
  regName, setRegName, regPhone, setRegPhone, regEmail, setRegEmail,
  regPlan, setRegPlan, regMethod, setRegMethod, regStatus, setRegStatus, regLoc, setRegLoc,
  regImmediateActive, setRegImmediateActive, regBypassApproval, setRegBypassApproval,
  regManualAmount, setRegManualAmount, regStaffNotes, setRegStaffNotes, handleSubmit
}: {
  regName: string; setRegName: (s: string) => void;
  regPhone: string; setRegPhone: (s: string) => void;
  regEmail: string; setRegEmail: (s: string) => void;
  regPlan: "monthly" | "quarterly" | "annual"; setRegPlan: (s: any) => void;
  regMethod: string; setRegMethod: (s: string) => void;
  regStatus: string; setRegStatus: (s: string) => void;
  regLoc: string; setRegLoc: (s: string) => void;
  regImmediateActive: boolean; setRegImmediateActive: (b: boolean) => void;
  regBypassApproval: boolean; setRegBypassApproval: (b: boolean) => void;
  regManualAmount: string; setRegManualAmount: (s: string) => void;
  regStaffNotes: string; setRegStaffNotes: (s: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">Manual Walk-in Registration</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Register walk-in users directly. Generate member passes and invoices instantly.</p>
      </div>

      <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-6 max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <Label htmlFor="fullname" className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Full Name</Label>
            <Input
              id="fullname"
              placeholder="Rahul Sharma"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              required
              className="bg-[#111111] border-[#222222] h-11 focus-visible:ring-[#E02020]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="mobile" className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Mobile Number</Label>
              <div className="flex gap-2">
                <span className="flex items-center justify-center px-3 rounded-md bg-[#111111] border border-[#222222] text-sm text-[#8A8A8A] font-bold">+91</span>
                <Input
                  id="mobile"
                  placeholder="9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  required
                  className="bg-[#111111] border-[#222222] h-11 focus-visible:ring-[#E02020] flex-1"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="rahul@example.com"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="bg-[#111111] border-[#222222] h-11 focus-visible:ring-[#E02020]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Subscription Plan</Label>
              <Select value={regPlan} onValueChange={setRegPlan}>
                <SelectTrigger className="bg-[#111111] border-[#222222] h-11 text-white text-xs">
                  <SelectValue placeholder="Select Plan" />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-[#222222] text-white">
                  <SelectItem value="monthly">Monthly Standard (₹1,499)</SelectItem>
                  <SelectItem value="quarterly">Quarterly Premium (₹3,999)</SelectItem>
                  <SelectItem value="annual">Annual Elite (₹13,999)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="manualAmount" className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Manual Overriding Amount (INR)</Label>
              <Input
                id="manualAmount"
                type="number"
                placeholder="Bypass plan base calculations..."
                value={regManualAmount}
                onChange={(e) => setRegManualAmount(e.target.value)}
                className="bg-[#111111] border-[#222222] h-11 focus-visible:ring-[#E02020]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Payment Method</Label>
              <Select value={regMethod} onValueChange={setRegMethod}>
                <SelectTrigger className="bg-[#111111] border-[#222222] h-11 text-white text-xs">
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-[#222222] text-white">
                  <SelectItem value="UPI">UPI (GPay/PhonePe)</SelectItem>
                  <SelectItem value="Cash">Cash Desk</SelectItem>
                  <SelectItem value="Card">Card Terminal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Location / Branch</Label>
              <Input
                id="location"
                placeholder="Banjara Hills, Hyderabad"
                value={regLoc}
                onChange={(e) => setRegLoc(e.target.value)}
                className="bg-[#111111] border-[#222222] h-11 focus-visible:ring-[#E02020]"
              />
            </div>
          </div>

          {/* Extra Admin Fields */}
          <div className="pt-3 border-t border-[#1A1A1A] space-y-4">
            <span className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">Administrative Overrides</span>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Immediate Activation Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#111111] border border-[#222222]">
                <div>
                  <span className="font-semibold text-white text-xs block">Immediate Activation</span>
                  <span className="text-[9px] text-[#555555]">Bypass pending payment logs</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRegImmediateActive(!regImmediateActive)}
                  className={cn(
                    "w-10 h-6 rounded-full transition-colors relative shrink-0",
                    regImmediateActive ? "bg-emerald-600" : "bg-[#222222]"
                  )}
                >
                  <span className={cn("h-4 w-4 bg-white rounded-full absolute top-1 transition-all", regImmediateActive ? "left-5" : "left-1")} />
                </button>
              </div>

              {/* Bypass Approval Toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#111111] border border-[#222222]">
                <div>
                  <span className="font-semibold text-white text-xs block">Bypass Approval Queue</span>
                  <span className="text-[9px] text-[#555555]">Instantly registers member</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRegBypassApproval(!regBypassApproval)}
                  className={cn(
                    "w-10 h-6 rounded-full transition-colors relative shrink-0",
                    regBypassApproval ? "bg-[#E02020]" : "bg-[#222222]"
                  )}
                >
                  <span className={cn("h-4 w-4 bg-white rounded-full absolute top-1 transition-all", regBypassApproval ? "left-5" : "left-1")} />
                </button>
              </div>
            </div>

            {/* Staff Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="staffnotes" className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Staff & Coach Notes</Label>
              <textarea
                id="staffnotes"
                rows={2}
                placeholder="E.g., Medical alerts, trainer assigned, manual discount code justifications..."
                value={regStaffNotes}
                onChange={(e) => setRegStaffNotes(e.target.value)}
                className="w-full rounded-md border border-[#222222] bg-[#111111] p-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:ring-1 focus:ring-[#E02020]"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-11 uppercase text-xs pt-0.5 mt-4"
          >
            Create Member & Generate Invoice
          </Button>
        </form>
      </div>
    </div>
  );
}

// ================= PAGE 5: PAYMENTS & REVENUE =================
function TabPayments({
  transactions, handleVerify, handleReject
}: {
  transactions: Transaction[];
  handleVerify: (id: string) => void;
  handleReject: (id: string) => void;
}) {
  const pendingVerify = transactions.filter(t => t.status === "Pending Verify");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">Payments & Revenue</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">Audit cash receipts, invoice downloads and monthly collections.</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => toast.success("Exported full billing ledger to CSV")}
            className="bg-[#1A1A1A] border border-[#222222] text-[#CFCFCF] hover:bg-[#E02020] hover:text-white h-9 text-[10px] font-bold uppercase"
          >
            Export Ledger CSV
          </Button>
          <Button
            onClick={() => toast.success("Generated revenue statement PDF")}
            className="bg-[#1A1A1A] border border-[#222222] text-[#CFCFCF] hover:bg-[#E02020] hover:text-white h-9 text-[10px] font-bold uppercase"
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Revenue stats */}
      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 text-center">
          <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">Today Collections</span>
          <span className="font-display text-2xl font-bold text-white">₹17,998</span>
        </div>
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 text-center">
          <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">This Week Total</span>
          <span className="font-display text-2xl font-bold text-white">₹89,450</span>
        </div>
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 text-center">
          <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">This Month Collections</span>
          <span className="font-display text-2xl font-bold text-white">₹4,82,500</span>
        </div>
        <div className="rounded-xl border border-[#E02020]/20 bg-[#E02020]/5 p-4 text-center">
          <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold block mb-1">Annual Revenue Goal</span>
          <span className="font-display text-2xl font-bold text-[#E02020]">₹38,40,000</span>
        </div>
      </div>

      {/* Pending cash collections verification queue */}
      {pendingVerify.length > 0 && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-amber-500 font-bold uppercase tracking-wider">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <span>Pending Cash Collections Desk Desk ({pendingVerify.length})</span>
          </div>

          <div className="overflow-x-auto -mx-px">
            <table className="w-full min-w-[540px] text-left border-collapse text-[11px] text-[#CFCFCF]">
              <thead>
                <tr className="border-b border-[#222222] text-[#8A8A8A] font-semibold">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Member</th>
                  <th className="py-2 px-3">Plan</th>
                  <th className="py-2 px-3">Amount</th>
                  <th className="py-2 px-3 text-center">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {pendingVerify.map(tx => (
                  <tr key={tx.id} className="hover:bg-[#111]/40">
                    <td className="py-2.5 px-3 text-[#8A8A8A]">{tx.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{tx.name}</td>
                    <td className="py-2.5 px-3 uppercase text-[10px]">{tx.plan}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{formatINR(tx.amount)}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          onClick={() => handleVerify(tx.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white h-6 px-2.5 text-[9px] font-bold uppercase"
                        >
                          Mark Payment Verified
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleReject(tx.id)}
                          className="bg-red-600/10 border border-red-600/20 text-red-400 hover:bg-red-600/25 h-6 px-2.5 text-[9px] font-bold uppercase"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Main transactions list */}
      <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
        <div className="px-5 py-4 border-b border-[#1A1A1A] bg-[#0C0C0C]">
          <h3 className="font-display text-base tracking-wide uppercase text-white font-bold">Payments Ledger</h3>
        </div>

        <div className="overflow-x-auto -mx-px">
          <table className="w-full min-w-[640px] text-left border-collapse text-xs text-[#CFCFCF]">
            <thead>
              <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Member</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Plan Billed</th>
                <th className="px-6 py-3.5">Method</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#111111]/80 transition-colors">
                  <td className="px-6 py-3.5 text-[#8A8A8A] font-medium">{tx.date}</td>
                  <td className="px-6 py-3.5 font-semibold text-white">{tx.name}</td>
                  <td className="px-6 py-3.5 font-bold text-white">{formatINR(tx.amount)}</td>
                  <td className="px-6 py-3.5 uppercase">{tx.plan}</td>
                  <td className="px-6 py-3.5 text-[#8A8A8A] font-mono">{tx.method}</td>
                  <td className="px-6 py-3.5">
                    <Badge
                      className={cn(
                        "text-[8px] uppercase tracking-wider py-0.5",
                        tx.status === "Paid" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      )}
                    >
                      {tx.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex justify-center">
                      <Link
                        to="/invoice/$id"
                        params={{ id: tx.name.replace(/\s+/g, "-") }}
                        target="_blank"
                        className="inline-flex items-center justify-center rounded bg-[#1A1A1A] border border-[#222222] hover:bg-[#E02020] hover:text-white h-7 px-2.5 text-[9px] uppercase font-bold text-white font-sans transition-all"
                      >
                        <FileText className="h-3 w-3 mr-1" /> Invoice
                      </Link>
                    </div>
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

// ================= PAGE 6: ATTENDANCE & ACCESS =================
function TabAttendanceLog({ members }: { members: Member[] }) {
  const [selectedDate, setSelectedDate] = useState("2025-05-28");
  const [attendanceEntries, setAttendanceEntries] = useState([
    { name: "Rahul Sharma", id: "IG-2024-0042", time: "6:14 AM", checkout: "7:52 AM", duration: "1h 38m", method: "Biometric" },
    { name: "Vikram Singh", id: "IG-2024-0118", time: "5:58 AM", checkout: "7:30 AM", duration: "1h 32m", method: "Biometric" },
    { name: "Priya Patel", id: "IG-2024-0071", time: "8:12 AM", checkout: "Active", duration: "--", method: "Biometric" },
    { name: "Sneha Reddy", id: "IG-2024-0103", time: "7:30 AM", checkout: "8:45 AM", duration: "1h 15m", method: "Biometric" },
    { name: "Arjun Mehta", id: "IG-2024-0089", time: "9:45 AM", checkout: "Active", duration: "--", method: "Manual" }
  ]);

  // Form states for manual attendance entry
  const [manualCheckinMember, setManualCheckinMember] = useState("");
  const [manualInTime, setManualInTime] = useState("09:00 AM");
  const [manualOutTime, setManualOutTime] = useState("Active");
  const [manualMethod, setManualMethod] = useState("Manual");

  const handleManualCheckin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCheckinMember) return;
    const targetMember = members.find(m => m.memberId === manualCheckinMember);
    if (!targetMember) return;

    const newLog = {
      name: targetMember.name,
      id: targetMember.memberId,
      time: manualInTime,
      checkout: manualOutTime,
      duration: manualOutTime === "Active" ? "--" : "1h 30m",
      method: manualMethod
    };

    setAttendanceEntries(prev => [newLog, ...prev]);
    toast.success(`Manually checked in ${targetMember.name} at ${manualInTime}!`);
    setManualCheckinMember("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">Daily Attendance & Access</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Review scanned gates check-ins, anomalies, and manual overrides.</p>
      </div>

      {/* Anomalies alert warning block */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3.5 text-xs animate-pulse">
        <ShieldAlert className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-red-500">Attendance Anomalies Warning</span>
          <p className="text-[#8A8A8A] mt-0.5">
            2 members have been inside the facility for more than 3 hours. Please verify if they failed to check out:
          </p>
          <ul className="list-disc list-inside mt-2 text-[#CFCFCF] space-y-1">
            <li><strong>Rahul Sharma</strong> (Check-in: 6:14 AM) — no checkout logged.</li>
            <li><strong>Arjun Mehta</strong> (Check-in: 9:45 AM) — no checkout logged.</li>
          </ul>
        </div>
      </div>

      {/* Date picker + Manual Entry form split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Date Filter & Log Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg tracking-wide uppercase text-white font-bold">Check-in Registry</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8A8A8A]">Audit Date:</span>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#0A0A0A] border-[#222222] h-9 text-xs focus-visible:ring-[#E02020] text-white w-36"
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
            <div className="overflow-x-auto -mx-px">
              <table className="w-full min-w-[600px] text-left border-collapse text-xs text-[#CFCFCF]">
                <thead>
                  <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
                    <th className="px-6 py-3.5">Member Name</th>
                    <th className="px-6 py-3.5">Member ID</th>
                    <th className="px-6 py-3.5">Check In</th>
                    <th className="px-6 py-3.5">Check Out</th>
                    <th className="px-6 py-3.5">Duration</th>
                    <th className="px-6 py-3.5">Sensor Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161616]">
                  {attendanceEntries.map((log, idx) => (
                    <tr key={idx} className="hover:bg-[#111111]/80 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-white">{log.name}</td>
                      <td className="px-6 py-3.5 font-mono">{log.id}</td>
                      <td className="px-6 py-3.5 text-white">{log.time}</td>
                      <td className="px-6 py-3.5">{log.checkout}</td>
                      <td className="px-6 py-3.5">
                        {log.checkout === "Active" ? (
                          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 py-0.5 text-[8px] uppercase tracking-wider font-bold">Inside Gym</Badge>
                        ) : (
                          <span className="text-[#8A8A8A]">{log.duration}</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge variant="outline" className="border-[#222222] text-[#8A8A8A] text-[9px] py-0 px-2 font-normal">
                          {log.method}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Manual entry card form */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4 h-fit">
          <div className="pb-2 border-b border-[#1A1A1A]">
            <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">Edge Case Override</span>
            <h3 className="font-display text-base tracking-wide uppercase text-white font-bold mt-0.5">Manual Entry Form</h3>
          </div>

          <form onSubmit={handleManualCheckin} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Select Gym Member</Label>
              <Select value={manualCheckinMember} onValueChange={setManualCheckinMember}>
                <SelectTrigger className="bg-[#111111] border-[#222222] text-white text-xs h-10">
                  <SelectValue placeholder="Select Member Profile" />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-[#222222] text-white">
                  {members.map(m => (
                    <SelectItem key={m.memberId} value={m.memberId}>{m.name} ({m.memberId})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Check-in Time</Label>
                <Input
                  value={manualInTime}
                  onChange={(e) => setManualInTime(e.target.value)}
                  placeholder="06:30 AM"
                  className="bg-[#111111] border-[#222222] h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Check-out Time</Label>
                <Input
                  value={manualOutTime}
                  onChange={(e) => setManualOutTime(e.target.value)}
                  placeholder="Active / 08:00 AM"
                  className="bg-[#111111] border-[#222222] h-10"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Verification Mode</Label>
              <Select value={manualMethod} onValueChange={setManualMethod}>
                <SelectTrigger className="bg-[#111111] border-[#222222] text-white text-xs h-10">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent className="bg-[#111111] border-[#222222] text-white">
                  <SelectItem value="Manual">Manual Receptionist log</SelectItem>
                  <SelectItem value="Biometric">Biometric Turnstile override</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-10 uppercase text-xs mt-2"
            >
              Log Entry Session
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}

// ================= PAGE 7: LIVE OCCUPANCY ADMIN =================
function TabLiveOccupancy({
  strengthCount, setStrengthCount, cardioCount, setCardioCount, yogaCount, setYogaCount,
  strengthLimit, setStrengthLimit, cardioLimit, setCardioLimit, yogaLimit, setYogaLimit
}: {
  strengthCount: number; setStrengthCount: React.Dispatch<React.SetStateAction<number>>;
  cardioCount: number; setCardioCount: React.Dispatch<React.SetStateAction<number>>;
  yogaCount: number; setYogaCount: React.Dispatch<React.SetStateAction<number>>;
  strengthLimit: number; setStrengthLimit: (n: number) => void;
  cardioLimit: number; setCardioLimit: (n: number) => void;
  yogaLimit: number; setYogaLimit: (n: number) => void;
}) {
  const totalCount = strengthCount + cardioCount + yogaCount;
  const maxLimit = strengthLimit + cardioLimit + yogaLimit;

  const handleAdjustCount = (zone: "strength" | "cardio" | "yoga", amount: number) => {
    if (zone === "strength") {
      setStrengthCount(prev => Math.max(0, Math.min(strengthLimit, prev + amount)));
    } else if (zone === "cardio") {
      setCardioCount(prev => Math.max(0, Math.min(cardioLimit, prev + amount)));
    } else if (zone === "yoga") {
      setYogaCount(prev => Math.max(0, Math.min(yogaLimit, prev + amount)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">Live facility occupancy</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">Monitor real-time gate entry counts, capacity parameters, and zonal thresholds.</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[#8A8A8A] uppercase font-bold tracking-wider block">Aggregate Occupancy</span>
          <div className="font-display text-3xl font-bold text-white">{totalCount} / {maxLimit}</div>
        </div>
      </div>

      {/* Manual Override & Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Strength Area Card */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Strength Section</div>
          <div className="font-display text-4xl font-bold text-white">{strengthCount} / {strengthLimit}</div>
          
          <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden border border-[#222]">
            <div className="h-full bg-[#E02020]" style={{ width: `${(strengthCount / strengthLimit) * 100}%` }} />
          </div>

          {/* Override controls */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              onClick={() => handleAdjustCount("strength", 1)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-[10px] uppercase"
            >
              + Add Person
            </Button>
            <Button
              onClick={() => handleAdjustCount("strength", -1)}
              className="bg-[#1A1A1A] border border-[#222222] hover:bg-[#252525] text-red-400 font-bold h-8 text-[10px] uppercase"
            >
              - Remove
            </Button>
          </div>
        </div>

        {/* Cardio Area Card */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Cardio Zone</div>
          <div className="font-display text-4xl font-bold text-white">{cardioCount} / {cardioLimit}</div>
          
          <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden border border-[#222]">
            <div className="h-full bg-emerald-500" style={{ width: `${(cardioCount / cardioLimit) * 100}%` }} />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              onClick={() => handleAdjustCount("cardio", 1)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-[10px] uppercase"
            >
              + Add Person
            </Button>
            <Button
              onClick={() => handleAdjustCount("cardio", -1)}
              className="bg-[#1A1A1A] border border-[#222222] hover:bg-[#252525] text-red-400 font-bold h-8 text-[10px] uppercase"
            >
              - Remove
            </Button>
          </div>
        </div>

        {/* Yoga Studio Card */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4 text-center">
          <div className="text-[10px] uppercase tracking-widest text-[#8A8A8A] font-bold">Yoga/Crossfit Studio</div>
          <div className="font-display text-4xl font-bold text-white">{yogaCount} / {yogaLimit}</div>
          
          <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden border border-[#222]">
            <div className="h-full bg-emerald-500" style={{ width: `${(yogaCount / yogaLimit) * 100}%` }} />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              onClick={() => handleAdjustCount("yoga", 1)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-[10px] uppercase"
            >
              + Add Person
            </Button>
            <Button
              onClick={() => handleAdjustCount("yoga", -1)}
              className="bg-[#1A1A1A] border border-[#222222] hover:bg-[#252525] text-red-400 font-bold h-8 text-[10px] uppercase"
            >
              - Remove
            </Button>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Zonal Traffic Chart */}
        <div className="lg:col-span-2 rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
          <h3 className="font-display text-base tracking-wide uppercase text-white font-bold">Hourly Traffic distribution</h3>
          
          {/* Custom SVG Hourly Bar Chart */}
          <div className="h-44 w-full pt-4">
            <svg className="w-full h-full" viewBox="0 0 400 130">
              <line x1="0" y1="100" x2="400" y2="100" stroke="#222" strokeWidth="1.5" />
              
              {/* Traffic Bars */}
              {[
                { label: "6 AM", val: 55, h: 65 },
                { label: "8 AM", val: 78, h: 90 },
                { label: "10 AM", val: 40, h: 48 },
                { label: "12 PM", val: 20, h: 24 },
                { label: "2 PM", val: 15, h: 18 },
                { label: "4 PM", val: 45, h: 54 },
                { label: "6 PM", val: 72, h: 84 },
                { label: "8 PM", val: 60, h: 70 }
              ].map((bar, i) => {
                const xPos = 20 + i * 48;
                const barHeight = bar.h;
                const yPos = 100 - barHeight;
                return (
                  <g key={i}>
                    {/* Bar */}
                    <rect
                      x={xPos}
                      y={yPos}
                      width="20"
                      height={barHeight}
                      fill={bar.val > 70 ? "#E02020" : "#10B981"}
                      rx="2"
                    />
                    {/* Value */}
                    <text x={xPos + 10} y={yPos - 5} fill="white" fontSize="7" textAnchor="middle" fontWeight="bold">
                      {bar.val}%
                    </text>
                    {/* Label */}
                    <text x={xPos + 10} y="115" fill="#555" fontSize="8" textAnchor="middle" fontWeight="semibold">
                      {bar.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Limit Settings */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4 h-fit text-xs text-[#CFCFCF]">
          <div className="pb-2 border-b border-[#1A1A1A]">
            <h3 className="font-display text-base tracking-wide uppercase text-white font-bold">Capacity Limits</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="stLimit" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Strength Section Cap</Label>
              <Input
                id="stLimit"
                type="number"
                value={strengthLimit}
                onChange={(e) => setStrengthLimit(parseInt(e.target.value) || 40)}
                className="bg-[#111111] border-[#222222] h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="cdLimit" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Cardio Zone Cap</Label>
              <Input
                id="cdLimit"
                type="number"
                value={cardioLimit}
                onChange={(e) => setCardioLimit(parseInt(e.target.value) || 20)}
                className="bg-[#111111] border-[#222222] h-9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ygLimit" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Yoga Room Cap</Label>
              <Input
                id="ygLimit"
                type="number"
                value={yogaLimit}
                onChange={(e) => setYogaLimit(parseInt(e.target.value) || 20)}
                className="bg-[#111111] border-[#222222] h-9"
              />
            </div>
            <Button
              onClick={() => toast.success("Gym capacity parameters modified successfully!")}
              className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-9 uppercase text-xs mt-2"
            >
              Update Parameters
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

// ================= PAGE 8: NOTIFICATIONS CENTER =================
function TabSystemAlerts({
  notifications, setNotifications
}: {
  notifications: SystemNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<SystemNotification[]>>;
}) {
  const [bTitle, setBTitle] = useState("");
  const [bMsg, setBMsg] = useState("");
  const [bTarget, setBTarget] = useState("all");

  const [tplWelcome, setTplWelcome] = useState("Welcome to IronForge Gym, {{name}}! Your dynamic Member ID pass is {{memberId}}. Keep lifting! 💪");
  const [tplRenewal, setTplRenewal] = useState("Hi {{name}}, your subscription plan ({{plan}}) expires in {{days}} days. Renew at ironforge.in/plans for continuous biometric gate access. ⚡");
  const [tplExpired, setTplExpired] = useState("Action Required: Hi {{name}}, your IronForge membership expired {{days}} days ago. Biometric gate check-in has been suspended. Renew now. 🛑");

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bTitle.trim() || !bMsg.trim()) return;

    const newNotif: SystemNotification = {
      id: `n-${randomDigits(4)}`,
      title: bTitle,
      desc: `[Target: ${bTarget.toUpperCase()}] ${bMsg}`,
      time: "Just now",
      type: "announcement"
    };

    setNotifications(prev => [newNotif, ...prev]);
    toast.success(`Broadcast announcement successfully dispatched to ${bTarget} members!`);
    setBTitle("");
    setBMsg("");
  };

  const handleSaveTemplates = () => {
    toast.success("SMS notification templates saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">Notifications Center</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Compose broadcast messages, manage automated SMS templates, and audit delivery logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Broadcast Sender & Template Manager */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Broadcast Form */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
            <h3 className="font-display text-base tracking-wide uppercase text-white font-bold border-b border-[#1A1A1A] pb-2">Compose Dashboard Announcement</h3>
            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="btitle" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Announcement Title</Label>
                  <Input
                    id="btitle"
                    placeholder="HIIT Morning Batch update, Facility maintenance..."
                    value={bTitle}
                    onChange={(e) => setBTitle(e.target.value)}
                    required
                    className="bg-[#111111] border-[#222222] h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Audience Target</Label>
                  <Select value={bTarget} onValueChange={setBTarget}>
                    <SelectTrigger className="bg-[#111111] border-[#222222] text-white text-xs h-10">
                      <SelectValue placeholder="All Members" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#222222] text-white">
                      <SelectItem value="all">All Members (Broadcast)</SelectItem>
                      <SelectItem value="active">Active Members Only</SelectItem>
                      <SelectItem value="expiring">Expiring within 7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="bmsg" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Message Details</Label>
                <textarea
                  id="bmsg"
                  rows={3}
                  placeholder="Enter details visible on member dashboard boxes..."
                  value={bMsg}
                  onChange={(e) => setBMsg(e.target.value)}
                  required
                  className="w-full rounded-md border border-[#222222] bg-[#111111] p-3 text-white placeholder-[#555555] focus:outline-none focus:ring-1 focus:ring-[#E02020]"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-10 uppercase text-xs pt-0.5"
              >
                <Send className="h-4 w-4 mr-2" /> Dispatch Announcement
              </Button>
            </form>
          </div>

          {/* SMS Template Manager */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4 text-xs">
            <h3 className="font-display text-base tracking-wide uppercase text-white font-bold border-b border-[#1A1A1A] pb-2">SMS Templates Manager</h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block">Welcome SMS Template</Label>
                <textarea
                  rows={2}
                  value={tplWelcome}
                  onChange={(e) => setTplWelcome(e.target.value)}
                  className="w-full rounded-md border border-[#222222] bg-[#111111] p-3 text-white focus:outline-none focus:ring-1 focus:ring-[#E02020]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block">Renewal Reminder (Expiring) SMS Template</Label>
                <textarea
                  rows={2}
                  value={tplRenewal}
                  onChange={(e) => setTplRenewal(e.target.value)}
                  className="w-full rounded-md border border-[#222222] bg-[#111111] p-3 text-white focus:outline-none focus:ring-1 focus:ring-[#E02020]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block">Expired Account Notice SMS Template</Label>
                <textarea
                  rows={2}
                  value={tplExpired}
                  onChange={(e) => setTplExpired(e.target.value)}
                  className="w-full rounded-md border border-[#222222] bg-[#111111] p-3 text-white focus:outline-none focus:ring-1 focus:ring-[#E02020]"
                />
              </div>
              <Button
                onClick={handleSaveTemplates}
                className="bg-[#111111] hover:bg-[#222] border border-[#222222] text-white font-bold h-9 uppercase text-[10px]"
              >
                Save SMS Templates
              </Button>
            </div>
          </div>

        </div>

        {/* System Alert History & Scheduled List */}
        <div className="space-y-6">
          
          {/* Scheduled notifications */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4 text-xs text-[#CFCFCF]">
            <h3 className="font-display text-base tracking-wide uppercase text-white font-bold border-b border-[#1A1A1A] pb-2">Scheduled Alerts</h3>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#111] border border-[#222] space-y-1">
                <div className="font-semibold text-white">Facility Maintenance Alert</div>
                <div className="text-[10px] text-[#8A8A8A]">Target: ALL MEMBERS</div>
                <div className="text-[#E02020] font-bold text-[9px] uppercase">1 June 2026 at 09:00 AM</div>
              </div>
              <div className="p-3 rounded-lg bg-[#111] border border-[#222] space-y-1">
                <div className="font-semibold text-white">Morning HIIT Batch promo</div>
                <div className="text-[10px] text-[#8A8A8A]">Target: EXPIRING ONLY</div>
                <div className="text-amber-500 font-bold text-[9px] uppercase">3 June 2026 at 05:00 PM</div>
              </div>
            </div>
          </div>

          {/* System logs alerts */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
            <h3 className="font-display text-base tracking-wide uppercase text-white font-bold border-b border-[#1A1A1A] pb-2">System Alert Trail</h3>
            
            <div className="space-y-3 overflow-y-auto max-h-[300px] scrollbar-thin">
              {notifications.map((n) => (
                <div key={n.id} className="rounded-lg bg-[#111111] border border-[#222222] p-3 flex gap-3">
                  <div className="h-7 w-7 rounded-lg bg-[#0A0A0A] border border-[#222222] flex items-center justify-center shrink-0">
                    <AlertCircle className="h-4 w-4 text-[#E02020]" />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-white leading-tight">{n.title}</span>
                      <span className="text-[8px] text-[#555] shrink-0 font-semibold">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-[#8A8A8A] leading-normal">{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// ================= PAGE 9: STAFF & TRAINER MANAGEMENT =================
function TabStaff() {
  const [staffMembers, setStaffMembers] = useState([
    { name: "Rohan Verma", role: "Trainer (Strength)", mobile: "+91 98765 00001", status: "On Shift", permissions: ["Trainer", "Biometric gate override"] },
    { name: "Anita Desai", role: "Trainer (Yoga)", mobile: "+91 98765 00002", status: "Off Shift", permissions: ["Trainer"] },
    { name: "Karan Malhotra", role: "Trainer (CrossFit)", mobile: "+91 98765 00003", status: "On Shift", permissions: ["Trainer"] },
    { name: "Divya Nair", role: "Trainer (Zumba)", mobile: "+91 98765 00004", status: "On Shift", permissions: ["Trainer"] },
    { name: "Suresh Kumar", role: "Reception Desk", mobile: "+91 98765 00005", status: "On Shift", permissions: ["Reception Desk", "Manual billing entries"] },
  ]);

  // Form states to Add Staff
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("Trainer");

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffPhone.trim()) return;

    const newStaff = {
      name: newStaffName,
      role: newStaffRole === "Trainer" ? "Trainer (General)" : newStaffRole,
      mobile: `+91 ${newStaffPhone}`,
      status: "On Shift",
      permissions: [newStaffRole]
    };

    setStaffMembers(prev => [...prev, newStaff]);
    toast.success(`Onboarded new staff member: ${newStaffName}!`);
    setNewStaffName("");
    setNewStaffEmail("");
    setNewStaffPhone("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">Staff Management</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Review gym personnel lists, permissions settings, trainer availability and onboarding.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Roster & Schedule List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-display text-lg tracking-wide uppercase text-white font-bold pb-2 border-b border-[#1A1A1A]">Staff Directory Roster</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {staffMembers.map((staff, idx) => {
              const initials = staff.name.split(" ").map(n => n[0]).slice(0, 2).join("");
              return (
                <div key={idx} className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4 flex flex-col justify-between shadow-lg">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#E02020] flex items-center justify-center font-bold text-white text-xs">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-white truncate">{staff.name}</h3>
                        <span className="text-[10px] text-[#8A8A8A] font-bold uppercase tracking-wider">{staff.role}</span>
                      </div>
                      <Badge
                        className={cn(
                          "text-[8px] uppercase tracking-wider py-0.5 px-2",
                          staff.status === "On Shift" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : "bg-[#222222] text-[#8A8A8A]"
                        )}
                      >
                        {staff.status}
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-[#1A1A1A] space-y-1 text-xs text-[#CFCFCF]">
                      <div><span className="text-[#555555]">Phone:</span> {staff.mobile}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {staff.permissions.map((p, i) => (
                          <span key={i} className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#111] border border-[#222] text-[#8A8A8A] font-bold">{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-[#E02020] font-semibold cursor-pointer border-t border-[#1A1A1A] pt-2 flex justify-between items-center hover:underline">
                    <span>View Scheduled Shift slots</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Staff form */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4 h-fit text-xs">
          <div className="pb-2 border-b border-[#1A1A1A]">
            <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">Onboard Personnel</span>
            <h3 className="font-display text-base tracking-wide uppercase text-white font-bold mt-0.5">Add Staff Member</h3>
          </div>

          <form onSubmit={handleAddStaff} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="staffname" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Full Name</Label>
              <Input
                id="staffname"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
                placeholder="Rohan Verma"
                required
                className="bg-[#111111] border-[#222222] h-10"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="staffemail" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Email Address</Label>
              <Input
                id="staffemail"
                type="email"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
                placeholder="rohan@ironforge.in"
                className="bg-[#111111] border-[#222222] h-10"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="staffphone" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Phone Number</Label>
                <Input
                  id="staffphone"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="9876500001"
                  required
                  className="bg-[#111111] border-[#222222] h-10"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Roster Role</Label>
                <Select value={newStaffRole} onValueChange={setNewStaffRole}>
                  <SelectTrigger className="bg-[#111111] border-[#222222] text-white text-xs h-10">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#222222] text-white">
                    <SelectItem value="Trainer">Trainer Specialist</SelectItem>
                    <SelectItem value="Reception">Reception Desk Staff</SelectItem>
                    <SelectItem value="Manager">Gym Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-10 uppercase text-xs mt-2"
            >
              Onboard Personnel
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}

// ================= PAGE 10: GROWTH REPORTS =================
function TabReports() {
  const [reportTitle, setReportTitle] = useState("Revenue Report");
  const [reportRange, setReportRange] = useState("May 2026");

  const previewRows = useMemo(() => {
    if (reportTitle === "Revenue Report") {
      return [
        { metric: "Total Collections", val: "₹4,82,500", desc: "GST standard inclusive" },
        { metric: "Annual Elite Packages sold", val: "18", desc: "18% GST collected" },
        { metric: "Quarterly Premium packages", val: "84", desc: "Desk collections + UPI" },
        { metric: "Monthly Standard renewals", val: "112", desc: "Recurring cash + UPI desk receipts" }
      ];
    } else if (reportTitle === "Attendance Report") {
      return [
        { metric: "Unique active members", val: "298 members", desc: "Biometric gate scanning active" },
        { metric: "Average session workout time", val: "1h 35m", desc: "Based on biometric checkout logs" },
        { metric: "Peak hour traffic spikes", val: "08:00 AM / 06:00 PM", desc: "Strength and cardio areas" },
        { metric: "Manual overrides registered", val: "12 log entries", desc: "Exceptions processed by front desk" }
      ];
    } else {
      return [
        { metric: "Grace periods active", val: "4 days after expiry", desc: "Biometric access configured" },
        { metric: "Warning notification triggers", val: "7 days prior to expiry", desc: "SMS reminder triggers" },
        { metric: "Membership conversions", val: "12 pending approvals", desc: "Online registrations queue" },
        { metric: "Suspended / Suspended list", val: "4 member cards", desc: "Temporary safety holds" }
      ];
    }
  }, [reportTitle]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">Analytics & Growth Reports</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">Generate dynamic statements, check-in summaries and audit compliance.</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => toast.success(`Downloaded: ${reportTitle.replace(" ", "_")}_Preview.csv`)}
            className="bg-[#1A1A1A] border border-[#222222] text-[#CFCFCF] hover:bg-[#E02020] hover:text-white h-9 text-[10px] font-bold uppercase"
          >
            Export Preview CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Selection Cards */}
        <div className="space-y-4">
          <h3 className="font-display text-base tracking-wide uppercase text-white font-bold">Report Templates</h3>
          
          {/* Revenue Report */}
          <div
            onClick={() => setReportTitle("Revenue Report")}
            className={cn(
              "p-4 rounded-xl border cursor-pointer transition-all space-y-2",
              reportTitle === "Revenue Report" ? "border-[#E02020] bg-[#E02020]/5" : "border-[#222] bg-[#0A0A0A]"
            )}
          >
            <div className="font-semibold text-xs text-white uppercase tracking-wider">Revenue & Tax Ledger Report</div>
            <p className="text-[10px] text-[#8A8A8A]">Details about quarterly/annual package collections, CGST/SGST splits.</p>
          </div>

          {/* Attendance Report */}
          <div
            onClick={() => setReportTitle("Attendance Report")}
            className={cn(
              "p-4 rounded-xl border cursor-pointer transition-all space-y-2",
              reportTitle === "Attendance Report" ? "border-[#E02020] bg-[#E02020]/5" : "border-[#222] bg-[#0A0A0A]"
            )}
          >
            <div className="font-semibold text-xs text-white uppercase tracking-wider">Biometric Attendance & Logs Report</div>
            <p className="text-[10px] text-[#8A8A8A]">Tracks turnstile sensor scans, workout durations, anomalies and manual receptionist checks.</p>
          </div>

          {/* Membership Report */}
          <div
            onClick={() => setReportTitle("Membership Report")}
            className={cn(
              "p-4 rounded-xl border cursor-pointer transition-all space-y-2",
              reportTitle === "Membership Report" ? "border-[#E02020] bg-[#E02020]/5" : "border-[#222] bg-[#0A0A0A]"
            )}
          >
            <div className="font-semibold text-xs text-white uppercase tracking-wider">Membership & Expiry Report</div>
            <p className="text-[10px] text-[#8A8A8A]">Audit active counts, grace period accesses, suspension logs, and conversion triggers.</p>
          </div>
        </div>

        {/* Range picker & Preview Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-display text-base tracking-wide uppercase text-white font-bold">Report Preview: <span className="text-[#E02020]">{reportTitle}</span></h3>
            
            {/* Range picker selector */}
            <Select value={reportRange} onValueChange={setReportRange}>
              <SelectTrigger className="bg-[#0A0A0A] border-[#222222] text-white text-xs h-9 w-36">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent className="bg-[#111111] border-[#222222] text-white">
                <SelectItem value="May 2026">Current Month (May)</SelectItem>
                <SelectItem value="Q2 2026">Current Quarter (Q2)</SelectItem>
                <SelectItem value="YTD 2026">Year to Date (2026)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
            <table className="w-full text-left border-collapse text-xs text-[#CFCFCF]">
              <thead>
                <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
                  <th className="px-6 py-3.5">Report Parameter</th>
                  <th className="px-6 py-3.5">Aggregated Value</th>
                  <th className="px-6 py-3.5">Audit Context Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#161616]">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#111111]/80">
                    <td className="px-6 py-3.5 font-semibold text-white">{row.metric}</td>
                    <td className="px-6 py-3.5 text-white font-bold">{row.val}</td>
                    <td className="px-6 py-3.5 text-[#8A8A8A]">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Button
            onClick={() => toast.success(`Generated and dispatched PDF statement for ${reportTitle}`)}
            className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-11 uppercase text-xs pt-0.5"
          >
            <Download className="h-4 w-4 mr-2" /> Download Formatted Audit PDF
          </Button>
        </div>

      </div>
    </div>
  );
}

// ================= PAGE 11: GLOBAL SETTINGS =================
function TabSettings() {
  const [gymName, setGymName] = useState("IronForge Gym");
  const [gymAddress, setGymAddress] = useState("Plot 12, Road 3, Banjara Hills, Hyderabad, India");
  const [gymPhone, setGymPhone] = useState("+91 98765 00000");

  const [priceMonthly, setPriceMonthly] = useState(1499);
  const [priceQuarterly, setPriceQuarterly] = useState(3999);
  const [priceAnnual, setPriceAnnual] = useState(13999);

  const [gracePeriodDays, setGracePeriodDays] = useState(4);
  const [triggerDays, setTriggerDays] = useState(7);

  const [openingTime, setOpeningTime] = useState("05:00 AM");
  const [closingTime, setClosingTime] = useState("11:00 PM");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Global gym settings and brand templates updated successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">Global Gym Settings</h1>
        <p className="text-sm text-[#8A8A8A] mt-1">Configure operating parameters, billing rates, grace periods, and branding overrides.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core settings form */}
        <div className="lg:col-span-2 rounded-xl border border-[#222222] bg-[#0A0A0A] p-6 text-xs text-[#CFCFCF]">
          <h3 className="font-display text-base tracking-wide uppercase text-white font-bold border-b border-[#1A1A1A] pb-2 mb-4">Gym Profile & Operating Hours</h3>
          
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="gname" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Gym Brand Name</Label>
                <Input
                  id="gname"
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="bg-[#111111] border-[#222222] h-10 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gphone" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Phone Number</Label>
                <Input
                  id="gphone"
                  value={gymPhone}
                  onChange={(e) => setGymPhone(e.target.value)}
                  className="bg-[#111111] border-[#222222] h-10 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gaddr" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">HQ Address</Label>
              <Input
                id="gaddr"
                value={gymAddress}
                onChange={(e) => setGymAddress(e.target.value)}
                className="bg-[#111111] border-[#222222] h-10 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="opTime" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Opening Hours</Label>
                <Input
                  id="opTime"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="bg-[#111111] border-[#222222] h-10 text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="clTime" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Closing Hours</Label>
                <Input
                  id="clTime"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="bg-[#111111] border-[#222222] h-10 text-xs"
                />
              </div>
            </div>

            {/* Plan pricing editor */}
            <div className="pt-4 border-t border-[#1A1A1A] space-y-3">
              <span className="text-[10px] uppercase tracking-widest text-[#E02020] font-bold block mb-1">Membership Plan Cost Editors</span>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pMonthly" className="text-[8px] uppercase tracking-widest text-[#8A8A8A] font-bold">Monthly Plan (INR)</Label>
                  <Input
                    id="pMonthly"
                    type="number"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(parseFloat(e.target.value) || 0)}
                    className="bg-[#111111] border-[#222222] h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pQuarterly" className="text-[8px] uppercase tracking-widest text-[#8A8A8A] font-bold">Quarterly Plan (INR)</Label>
                  <Input
                    id="pQuarterly"
                    type="number"
                    value={priceQuarterly}
                    onChange={(e) => setPriceQuarterly(parseFloat(e.target.value) || 0)}
                    className="bg-[#111111] border-[#222222] h-9 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pAnnual" className="text-[8px] uppercase tracking-widest text-[#8A8A8A] font-bold">Annual Plan (INR)</Label>
                  <Input
                    id="pAnnual"
                    type="number"
                    value={priceAnnual}
                    onChange={(e) => setPriceAnnual(parseFloat(e.target.value) || 0)}
                    className="bg-[#111111] border-[#222222] h-9 text-xs"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-11 uppercase text-xs pt-0.5 mt-4"
            >
              Save Core Settings Parameters
            </Button>
          </form>
        </div>

        {/* Triggers & Branding panel */}
        <div className="space-y-6 text-xs text-[#CFCFCF]">
          
          {/* Grace and Triggers */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
            <h3 className="font-display text-base tracking-wide uppercase text-white font-bold border-b border-[#1A1A1A] pb-2">Access Rules</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="grace" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Biometric Grace Period (Days)</Label>
                <Input
                  id="grace"
                  type="number"
                  value={gracePeriodDays}
                  onChange={(e) => setGracePeriodDays(parseInt(e.target.value) || 0)}
                  className="bg-[#111111] border-[#222222] h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trigger" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">SMS Trigger Warning Days</Label>
                <Input
                  id="trigger"
                  type="number"
                  value={triggerDays}
                  onChange={(e) => setTriggerDays(parseInt(e.target.value) || 0)}
                  className="bg-[#111111] border-[#222222] h-9"
                />
              </div>
              <Button
                onClick={() => toast.success("Access and SMS schedule rules updated!")}
                className="w-full bg-[#111] border border-[#222] text-white hover:bg-[#1A1A1A] h-9 uppercase text-[10px]"
              >
                Save Access Rules
              </Button>
            </div>
          </div>

          {/* Branding controls */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
            <h3 className="font-display text-base tracking-wide uppercase text-white font-bold border-b border-[#1A1A1A] pb-2">Console Branding</h3>
            <div className="space-y-3">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">Primary Color Overrides</span>
                <div className="flex gap-2">
                  <span className="h-6 w-6 rounded bg-[#E02020] border border-white/20 cursor-pointer block" title="Default IronForge Red" />
                  <span className="h-6 w-6 rounded bg-emerald-600 border border-white/10 cursor-pointer block" title="Emerald Green" />
                  <span className="h-6 w-6 rounded bg-blue-600 border border-white/10 cursor-pointer block" title="Electric Blue" />
                  <span className="h-6 w-6 rounded bg-amber-500 border border-white/10 cursor-pointer block" title="Solar Amber" />
                </div>
              </div>

              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">Gym Logo File Upload</span>
                <div className="p-4 rounded bg-[#111] border border-dashed border-[#222] text-center text-[10px] text-[#555] cursor-pointer hover:border-[#E02020] hover:text-[#8A8A8A] transition-colors">
                  Drag and drop brand logo here (.PNG or .SVG)
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
