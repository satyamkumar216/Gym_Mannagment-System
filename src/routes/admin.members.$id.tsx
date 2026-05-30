import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft, Dumbbell, User, Calendar, Receipt, Activity, FileText, Clock,
  Phone, Mail, Check, AlertCircle, Edit, Trash2, Send, Download, Eye, EyeOff, ShieldAlert,
  UserX, Heart, Users, ShieldCheck, Printer, Plus, AlertTriangle, MessageSquare, QrCode, X,
  Fingerprint, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
const formatDate = (date: Date) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

export const Route = createFileRoute("/admin/members/$id")({
  head: () => ({
    meta: [
      { title: "Member Profiles — IronForge Gym" },
      { name: "description", content: "Review gym member health biometrics, subscription payments and biometric checkins." },
    ],
  }),
  component: MemberDetails,
});

type TabId = "overview" | "biometric" | "attendance" | "payments" | "membership" | "activity";

interface MemberDbEntry {
  name: string;
  memberId: string;
  plan: string;
  status: "Active" | "Expiring" | "Expired" | "Suspended" | "Pending Approval" | "Pending Payment";
  statusText?: string;
  location: string;
  mobile: string;
  email: string;
  joined: string;
  validUntil: string;
  height: string;
  weight: string;
  bmi: number;
  bmiCategory: string;
  bloodGroup: string;
  goals: string[];
  conditions: string;
  emergencyName: string;
  emergencyMobile: string;
  aadhaar: string;
  notes: string;
  biometric?: "Registered" | "Not Set";
  biometricDate?: string;
  biometricBy?: string;
}

const dummyMembersDb: Record<string, MemberDbEntry> = {
  "IG-2024-0042": {
    name: "Rahul Sharma",
    memberId: "IG-2024-0042",
    plan: "Quarterly Premium",
    status: "Active",
    location: "Banjara Hills, Hyderabad",
    mobile: "+91 98765 43210",
    email: "rahul@gmail.com",
    joined: "12 Feb 2024",
    validUntil: "15 Aug 2025",
    height: "175 cm",
    weight: "78 kg",
    bmi: 25.5,
    bmiCategory: "Slightly Overweight",
    bloodGroup: "B+",
    goals: ["Weight Loss", "Muscle Gain"],
    conditions: "None",
    emergencyName: "Sunita Sharma",
    emergencyMobile: "+91 98760 11111",
    aadhaar: "XXXX-XXXX-4521",
    notes: "Requires posture check on deadlifts. Focuses on conditioning."
  },
  "IG-2024-0071": {
    name: "Priya Patel",
    memberId: "IG-2024-0071",
    plan: "Annual Elite",
    status: "Active",
    location: "Secunderabad, Hyderabad",
    mobile: "+91 98765 43211",
    email: "priya@example.com",
    joined: "18 Mar 2024",
    validUntil: "15 Mar 2026",
    height: "162 cm",
    weight: "54 kg",
    bmi: 20.6,
    bmiCategory: "Healthy",
    bloodGroup: "A+",
    goals: ["Flexibility", "Endurance"],
    conditions: "None",
    emergencyName: "Dilip Patel",
    emergencyMobile: "+91 98765 11112",
    aadhaar: "XXXX-XXXX-8942",
    notes: "Mainly attends yoga flow classes on Tuesday/Thursday mornings."
  },
  "IG-2024-0089": {
    name: "Arjun Mehta",
    memberId: "IG-2024-0089",
    plan: "Monthly Standard",
    status: "Expiring",
    statusText: "Expiring in 3 days",
    location: "Gachibowli, Hyderabad",
    mobile: "+91 98765 43212",
    email: "arjun@example.com",
    joined: "10 Apr 2024",
    validUntil: "31 May 2026",
    height: "180 cm",
    weight: "85 kg",
    bmi: 26.2,
    bmiCategory: "Overweight",
    bloodGroup: "O+",
    goals: ["Strength", "Muscle Gain"],
    conditions: "Knee Issues",
    emergencyName: "Rita Mehta",
    emergencyMobile: "+91 98765 11113",
    aadhaar: "XXXX-XXXX-1084",
    notes: "Restricts squats due to ACL reconstruction. Focuses on upper body lifting."
  },
  "IG-2024-0103": {
    name: "Sneha Reddy",
    memberId: "IG-2024-0103",
    plan: "Quarterly Premium",
    status: "Active",
    location: "Madhapur, Hyderabad",
    mobile: "+91 98765 43213",
    email: "sneha@example.com",
    joined: "05 May 2024",
    validUntil: "05 Aug 2026",
    height: "168 cm",
    weight: "60 kg",
    bmi: 21.3,
    bmiCategory: "Healthy",
    bloodGroup: "AB+",
    goals: ["General Fitness", "Endurance"],
    conditions: "None",
    emergencyName: "Rajesh Reddy",
    emergencyMobile: "+91 98765 11114",
    aadhaar: "XXXX-XXXX-3829",
    notes: "Prefers morning workout sessions. Good cardiorespiratory response."
  },
  "IG-2024-0118": {
    name: "Vikram Singh",
    memberId: "IG-2024-0118",
    plan: "Annual Elite",
    status: "Active",
    location: "Jubilee Hills, Hyderabad",
    mobile: "+91 98765 43214",
    email: "vikram@example.com",
    joined: "15 May 2024",
    validUntil: "15 May 2027",
    height: "178 cm",
    weight: "82 kg",
    bmi: 25.9,
    bmiCategory: "Slightly Overweight",
    bloodGroup: "B-",
    goals: ["Weight Loss", "Muscle Gain"],
    conditions: "None",
    emergencyName: "Kavita Singh",
    emergencyMobile: "+91 98765 11115",
    aadhaar: "XXXX-XXXX-7412",
    notes: "Enrolled in personal training with Coach Rohan. High compliance."
  },
  "IG-2024-0134": {
    name: "Kavya Nambiar",
    memberId: "IG-2024-0134",
    plan: "Monthly Standard",
    status: "Expired",
    statusText: "Expired 5 days ago",
    location: "Begumpet, Hyderabad",
    mobile: "+91 98765 43215",
    email: "kavya@example.com",
    joined: "12 Jan 2024",
    validUntil: "23 May 2026",
    height: "165 cm",
    weight: "58 kg",
    bmi: 21.3,
    bmiCategory: "Healthy",
    bloodGroup: "O-",
    goals: ["General Fitness", "Flexibility"],
    conditions: "None",
    emergencyName: "Gopi Nambiar",
    emergencyMobile: "+91 98765 11116",
    aadhaar: "XXXX-XXXX-3549",
    notes: "Membership expired. Called member on 25 May; plans to renew Quarterly on next visit."
  },
  "IG-2024-0156": {
    name: "Rohit Gupta",
    memberId: "IG-2024-0156",
    plan: "Quarterly Premium",
    status: "Pending Approval",
    location: "Kondapur, Hyderabad",
    mobile: "+91 98765 43216",
    email: "rohit@example.com",
    joined: "28 May 2025",
    validUntil: "28 Aug 2025",
    height: "176 cm",
    weight: "88 kg",
    bmi: 28.4,
    bmiCategory: "Overweight",
    bloodGroup: "B+",
    goals: ["Weight Loss", "Strength"],
    conditions: "High BP",
    emergencyName: "Neha Gupta",
    emergencyMobile: "+91 98765 11117",
    aadhaar: "XXXX-XXXX-2847",
    notes: "Needs moderate-intensity routines. Check heart rates regularly."
  },
  "IG-2024-0167": {
    name: "Meera Joshi",
    memberId: "IG-2024-0167",
    plan: "Annual Elite",
    status: "Pending Payment",
    location: "Kukatpally, Hyderabad",
    mobile: "+91 98765 43217",
    email: "meera@example.com",
    joined: "27 May 2025",
    validUntil: "27 May 2026",
    height: "160 cm",
    weight: "50 kg",
    bmi: 19.5,
    bmiCategory: "Healthy",
    bloodGroup: "A-",
    goals: ["General Fitness", "Flexibility"],
    conditions: "None",
    emergencyName: "Ramesh Joshi",
    emergencyMobile: "+91 98765 11118",
    aadhaar: "XXXX-XXXX-1964",
    notes: "Applied online, registration pending cash collection at desk."
  }
};

interface PaymentRecord {
  date: string;
  plan: string;
  amount: string;
  method: string;
  startDate: string;
  endDate: string;
  status: string;
  ref?: string;
  notes?: string;
}

const seedPayments = (member: MemberDbEntry): PaymentRecord[] => {
  if (member.memberId === "IG-2024-0042") { // Rahul Sharma
    return [
      { date: "12 Feb 2025", plan: "Quarterly Premium", method: "UPI (GPay)", amount: "₹3,999", startDate: "12 Feb 2025", endDate: "15 Aug 2025", status: "Paid" },
      { date: "12 Nov 2024", plan: "Quarterly Premium", method: "UPI (PhonePe)", amount: "₹3,999", startDate: "12 Nov 2024", endDate: "12 Feb 2025", status: "Paid" },
      { date: "12 Aug 2024", plan: "Monthly Standard", method: "Cash", amount: "₹1,499", startDate: "12 Aug 2024", endDate: "12 Nov 2024", status: "Paid" },
    ];
  }
  
  const amount = member.plan.includes("Annual") ? "₹13,999" : member.plan.includes("Quarterly") ? "₹3,999" : "₹1,499";
  return [
    {
      date: member.joined,
      plan: member.plan,
      method: "UPI",
      amount: amount,
      startDate: member.joined,
      endDate: member.validUntil,
      status: "Paid"
    }
  ];
};

function MemberDetails() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [member, setMember] = useState<MemberDbEntry | null>(null);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [staffNotes, setStaffNotes] = useState("");
  const [addPaymentModal, setAddPaymentModal] = useState(false);
  const [biometricModalOpen, setBiometricModalOpen] = useState(false);
  const [confirmRemoveModalOpen, setConfirmRemoveModalOpen] = useState(false);
  const [presentCheckboxChecked, setPresentCheckboxChecked] = useState(false);
  
  // Manual Payment Form
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");

  // Renewal Modal State
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [renewPlan, setRenewPlan] = useState("");
  const [renewStartDate, setRenewStartDate] = useState("");
  const [renewAmount, setRenewAmount] = useState("");
  const [renewMethod, setRenewMethod] = useState("Cash");
  const [renewReference, setRenewReference] = useState("");
  const [renewNotes, setRenewNotes] = useState("");
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  const calculatedEndDate = useMemo(() => {
    if (!renewStartDate) return null;
    const start = new Date(renewStartDate);
    if (isNaN(start.getTime())) return null;

    if (renewPlan === "Monthly Standard") {
      start.setMonth(start.getMonth() + 1);
    } else if (renewPlan === "Quarterly Premium") {
      start.setMonth(start.getMonth() + 3);
    } else if (renewPlan === "Annual Elite") {
      start.setMonth(start.getMonth() + 12);
    }
    return start;
  }, [renewStartDate, renewPlan]);

  useEffect(() => {
    if (renewPlan === "Monthly Standard") {
      setRenewAmount("1499");
    } else if (renewPlan === "Quarterly Premium") {
      setRenewAmount("3999");
    } else if (renewPlan === "Annual Elite") {
      setRenewAmount("13999");
    }
  }, [renewPlan]);

  const handleOpenRenewModal = () => {
    if (!member) return;
    setRenewPlan(member.plan);
    
    // Set start date to local today
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    setRenewStartDate(localToday.toISOString().split("T")[0]);
    
    setRenewMethod("Cash");
    setRenewReference("");
    setRenewNotes("");
    setRenewModalOpen(true);
  };

  const handleRemoveBiometric = () => {
    if (!member) return;
    setMember(prev => prev ? { ...prev, biometric: "Not Set" } : null);
    
    const usersStr = localStorage.getItem("registered_users");
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        const updated = users.map((u: any) => u.memberId === member.memberId ? { ...u, biometric: "Not Set" } : u);
        localStorage.setItem("registered_users", JSON.stringify(updated));
      } catch(e) {}
    }

    const logsStr = localStorage.getItem(`activity_logs_${member.memberId}`);
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
    localStorage.setItem(`activity_logs_${member.memberId}`, JSON.stringify([newEntry, ...logs]));

    toast.error("Biometric access removed");
  };

  // Load member details dynamically
  useEffect(() => {
    // 1. Check localStorage first
    const usersStr = localStorage.getItem("registered_users");
    let matched: any = null;
    
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        if (Array.isArray(users)) {
          matched = users.find((u: any) => u.memberId === id);
          if (matched) {
            // Map structure
            const mapped: MemberDbEntry = {
              name: matched.fullName,
              memberId: matched.memberId,
              plan: matched.plan === "quarterly" ? "Quarterly Premium" : matched.plan === "annual" ? "Annual Elite" : "Monthly Standard",
              status: matched.status || (matched.paymentMode === "online" ? "Active" : "Pending Payment"),
              location: "Hyderabad",
              mobile: matched.mobile.startsWith("+91") ? matched.mobile : `+91 ${matched.mobile}`,
              email: matched.email,
              joined: "Recently",
              validUntil: matched.validUntil || (matched.plan === "quarterly" ? "3 Months From Now" : matched.plan === "annual" ? "1 Year From Now" : "1 Month From Now"),
              height: matched.height || "175 cm",
              weight: matched.weight || "72 kg",
              bmi: matched.height && matched.weight ? +(parseFloat(matched.weight)/((parseFloat(matched.height)/100)**2)).toFixed(1) : 23.5,
              bmiCategory: "Healthy",
              bloodGroup: matched.bloodGroup || "O+",
              goals: matched.goals || ["General Fitness"],
              conditions: matched.conditions ? matched.conditions.join(", ") : "None",
              emergencyName: matched.emergencyName || "Not Provided",
              emergencyMobile: matched.emergencyMobile || "Not Provided",
              aadhaar: matched.aadhaar || "XXXX-XXXX-XXXX",
              notes: matched.notes || "Registered Walkin/Online queue user.",
              biometric: matched.biometric || (["Sneha Reddy", "Vikram Singh", "Arjun Mehta", "Rohit Gupta", "Meera Joshi"].includes(matched.fullName) ? "Not Set" : "Registered"),
              biometricDate: matched.biometricDate || (matched.biometric === "Registered" || !matched.biometric ? "20 Mar 2024" : undefined),
              biometricBy: matched.biometricBy || (matched.biometric === "Registered" || !matched.biometric ? "Staff Suresh Kumar" : undefined)
            };
            setMember(mapped);
            setStaffNotes(mapped.notes);
            return;
          }
        }
      } catch (err) {
        console.error(err);
      }
    }

    // 2. Lookup in static db
    const dbEntry = dummyMembersDb[id] || dummyMembersDb["IG-2024-0042"];
    if (dbEntry) {
      let finalBiometric = dbEntry.biometric;
      let finalStatus = dbEntry.status;
      let finalPlan = dbEntry.plan;
      let finalValidUntil = dbEntry.validUntil;

      // Find in localStorage to get latest updates if any
      if (usersStr) {
        try {
          const users = JSON.parse(usersStr);
          const matchedStorage = users.find((u: any) => u.memberId === dbEntry.memberId || u.fullName === dbEntry.name);
          if (matchedStorage) {
            finalBiometric = matchedStorage.biometric;
            finalStatus = matchedStorage.status || (matchedStorage.paymentMode === "online" ? "Active" : "Pending Payment");
            if (matchedStorage.plan) {
              finalPlan = matchedStorage.plan === "quarterly" ? "Quarterly Premium" : matchedStorage.plan === "annual" ? "Annual Elite" : "Monthly Standard";
            }
            if (matchedStorage.validUntil) {
              finalValidUntil = matchedStorage.validUntil;
            }
          }
        } catch(e){}
      }

      if (!finalBiometric) {
        finalBiometric = ["Sneha Reddy", "Vikram Singh", "Arjun Mehta", "Rohit Gupta", "Meera Joshi"].includes(dbEntry.name) ? "Not Set" : "Registered";
      }

      setMember({
        ...dbEntry,
        status: finalStatus,
        plan: finalPlan,
        validUntil: finalValidUntil,
        biometric: finalBiometric,
        biometricDate: dbEntry.biometricDate || (finalBiometric === "Registered" ? "20 Mar 2024" : undefined),
        biometricBy: dbEntry.biometricBy || (finalBiometric === "Registered" ? "Staff Suresh Kumar" : undefined)
      });
      setStaffNotes(dbEntry.notes);
    }
  }, [id]);

  // Load payments from localStorage or seed
  useEffect(() => {
    if (!member) return;
    const storedPayments = localStorage.getItem(`payments_${member.memberId}`);
    if (storedPayments) {
      try {
        setPayments(JSON.parse(storedPayments));
        return;
      } catch (e) {}
    }
    const seeded = seedPayments(member);
    setPayments(seeded);
    localStorage.setItem(`payments_${member.memberId}`, JSON.stringify(seeded));
  }, [member?.memberId]);

  const handleSaveNotes = () => {
    if (member) {
      setMember({ ...member, notes: staffNotes });
      toast.success("Staff notes updated successfully!");
    }
  };

  const handleActivateRenewal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !calculatedEndDate) return;

    const newExpiryStr = formatDate(calculatedEndDate);
    const amountVal = parseFloat(renewAmount);
    const amountStr = isNaN(amountVal) ? `₹0` : `₹${amountVal.toLocaleString("en-IN")}`;

    // 1. Update component member state
    setMember(prev => prev ? {
      ...prev,
      status: "Active",
      plan: renewPlan,
      validUntil: newExpiryStr,
      statusText: undefined
    } : null);

    // 2. Update registered_users database in localStorage
    const usersStr = localStorage.getItem("registered_users");
    let users = [];
    if (usersStr) {
      try { users = JSON.parse(usersStr); } catch (e) {}
    }
    const index = users.findIndex((u: any) => u.memberId === member.memberId);
    const storagePlan = renewPlan === "Quarterly Premium" ? "quarterly" : renewPlan === "Annual Elite" ? "annual" : "monthly";

    if (index >= 0) {
      users[index] = {
        ...users[index],
        status: "Active",
        plan: storagePlan,
        validUntil: newExpiryStr
      };
    } else {
      const newUser = {
        fullName: member.name,
        memberId: member.memberId,
        mobile: member.mobile.replace("+91 ", ""),
        email: member.email,
        plan: storagePlan,
        status: "Active",
        validUntil: newExpiryStr,
        biometric: member.biometric || "Registered",
        height: member.height,
        weight: member.weight,
        bloodGroup: member.bloodGroup,
        goals: member.goals,
        conditions: member.conditions ? member.conditions.split(", ") : [],
        notes: member.notes
      };
      users.push(newUser);
    }
    localStorage.setItem("registered_users", JSON.stringify(users));

    // 3. Add entry to payment history (payments state & localStorage)
    const todayFormatted = formatDate(new Date());
    const newPayment: PaymentRecord = {
      date: todayFormatted,
      plan: renewPlan,
      method: renewMethod + (renewReference ? ` (${renewReference})` : ""),
      amount: amountStr,
      startDate: formatDate(new Date(renewStartDate)),
      endDate: newExpiryStr,
      status: "Paid",
      ref: renewReference || undefined,
      notes: renewNotes || undefined
    };

    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    localStorage.setItem(`payments_${member.memberId}`, JSON.stringify(updatedPayments));

    // 4. Update activity logs
    const logsStr = localStorage.getItem(`activity_logs_${member.memberId}`);
    let logs = [];
    if (logsStr) {
      try { logs = JSON.parse(logsStr); } catch (e) {}
    } else {
      logs = [
        { title: "SMS sent - renewal reminder", date: "5 Feb 2025", desc: "Automated alert sent to member mobile +91 98765 43210" },
        { title: "Biometric registered", date: "14 Feb 2024", desc: "Turnstile gate fingerprint and camera credentials synchronized" },
        { title: "Account approved by Admin", date: "13 Feb 2024", desc: "Verified initial cash receipt and created Member pass ID" },
        { title: "Application submitted", date: "12 Feb 2024", desc: "Registrant signup completed via ironforge.in/join" },
      ];
    }
    const newLogEntry = {
      title: `Membership Renewed`,
      date: todayFormatted,
      desc: `Renewed to ${renewPlan} (${amountStr}) via ${renewMethod}. Period: ${formatDate(new Date(renewStartDate))} to ${newExpiryStr}.`
    };
    localStorage.setItem(`activity_logs_${member.memberId}`, JSON.stringify([newLogEntry, ...logs]));

    // 5. Success notifications
    toast.success(`Membership for ${member.name} renewed successfully!`);
    setRenewModalOpen(false);
  };

  const handleSuspend = () => {
    if (member) {
      const reason = window.prompt(`Enter suspension reason for ${member.name} (optional):`);
      if (reason === null) return; // Cancelled
      
      const updatedMember = {
        ...member,
        status: "Suspended" as const,
        suspensionReason: reason || undefined
      };
      
      setMember(updatedMember);
      
      const usersStr = localStorage.getItem("registered_users");
      if (usersStr) {
        try {
          const users = JSON.parse(usersStr);
          const updated = users.map((u: any) => u.memberId === member.memberId ? { ...u, status: "Suspended", suspensionReason: reason || undefined } : u);
          localStorage.setItem("registered_users", JSON.stringify(updated));
        } catch (e) {}
      }
      
      toast.error(`Membership for ${member.name} suspended.`);
    }
  };

  const handleApprove = () => {
    if (!member) return;
    setMember(prev => prev ? { ...prev, status: "Active", biometric: "Not Set" } : null);

    const usersStr = localStorage.getItem("registered_users");
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        const updated = users.map((u: any) => u.memberId === member.memberId ? { ...u, status: "Active", biometric: "Not Set" } : u);
        localStorage.setItem("registered_users", JSON.stringify(updated));
      } catch (e) {}
    }

    // Write activity log
    const logsStr = localStorage.getItem(`activity_logs_${member.memberId}`);
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
      title: "Account approved by Admin",
      date: "29 May 2025",
      desc: "Account approved by Admin Gaurav Mehta. Verification complete."
    };
    localStorage.setItem(`activity_logs_${member.memberId}`, JSON.stringify([newEntry, ...logs]));

    toast.success(`Account approved for ${member.name}!`);
  };

  const handleVerifyPayment = () => {
    if (!member) return;
    setMember(prev => prev ? { ...prev, status: "Active", biometric: "Not Set" } : null);

    const usersStr = localStorage.getItem("registered_users");
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        const updated = users.map((u: any) => u.memberId === member.memberId ? { ...u, status: "Active", paymentMode: "online", biometric: "Not Set" } : u);
        localStorage.setItem("registered_users", JSON.stringify(updated));
      } catch (e) {}
    }

    // Write activity log
    const logsStr = localStorage.getItem(`activity_logs_${member.memberId}`);
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
      title: "Payment verified by Admin",
      date: "29 May 2025",
      desc: "Gym payment verified and status updated to Active by Gaurav Mehta."
    };
    localStorage.setItem(`activity_logs_${member.memberId}`, JSON.stringify([newEntry, ...logs]));

    toast.success(
      <div className="space-y-1 text-left">
        <div className="font-semibold text-white">✅ {member.name} is now active!</div>
        <div className="text-xs text-[#8A8A8A] font-normal leading-relaxed">
          Remind them to register their fingerprint before their first workout.
        </div>
      </div>,
      { duration: 6000 }
    );
  };

  const handleSendSMS = () => {
    if (member) {
      toast.success(`Renewal reminder SMS dispatched to ${member.mobile}`);
    }
  };

  const handleManualPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !payAmount) return;
    
    const amountVal = parseFloat(payAmount);
    if (isNaN(amountVal)) return;

    const todayFormatted = formatDate(new Date());
    
    // Create new payment entry
    const newPayment: PaymentRecord = {
      date: todayFormatted,
      plan: member.plan, // Use current plan for manual payment
      method: payMethod,
      amount: `₹${amountVal.toLocaleString("en-IN")}`,
      startDate: todayFormatted,
      endDate: member.validUntil,
      status: "Paid",
      ref: "Manual",
      notes: "Manual entry from payments desk"
    };

    const updatedPayments = [newPayment, ...payments];
    setPayments(updatedPayments);
    localStorage.setItem(`payments_${member.memberId}`, JSON.stringify(updatedPayments));

    toast.success(`Manual payment of ₹${amountVal.toLocaleString("en-IN")} processed via ${payMethod}`);
    setAddPaymentModal(false);
    setPayAmount("");
  };

  if (!member) return null;

  const initials = member.name.split(" ").map(n => n[0]).slice(0,2).join("");

  return (
    <div className="min-h-screen bg-[#111111] text-white p-6 md:p-8 space-y-6">
      
      {/* Back Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => navigate({ to: "/admin" })}
            className="text-sm text-[#8A8A8A] hover:text-white flex items-center gap-1.5 transition-colors font-semibold uppercase tracking-wider text-left"
          >
            <ArrowLeft className="h-4 w-4" /> All Members
          </button>
          <div className="text-[10px] text-[#555] flex items-center gap-1 font-mono uppercase font-semibold">
            <Link to="/admin" className="hover:text-[#8a8a8a] transition-colors">Admin</Link>
            <span>→</span>
            <Link to="/admin" className="hover:text-[#8a8a8a] transition-colors">Members</Link>
            <span>→</span>
            <span className="text-[#8a8a8a]">{member.name}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[#E02020] flex items-center justify-center">
            <Dumbbell className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg tracking-wide uppercase">Staff Console</span>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: IDENTITY CARD */}
        <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 space-y-6">
          <div className="text-center space-y-3">
            <div className="h-20 w-20 rounded-full bg-[#E02020] flex items-center justify-center mx-auto text-2xl font-bold text-white shadow-xl">
              {initials}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-display font-bold uppercase tracking-wide text-white">{member.name}</h2>
              <div className="text-xs text-[#8A8A8A] font-mono">{member.memberId}</div>
            </div>

            <div className="flex justify-center gap-2 pt-1">
              <Badge
                className={cn(
                  "text-[9px] uppercase tracking-wider py-0.5 px-2",
                  member.status === "Active" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                  member.status === "Expiring" && "bg-amber-500/10 text-amber-500 border border-amber-500/20",
                  member.status === "Expired" && "bg-red-500/10 text-red-500 border border-red-500/20",
                  member.status === "Suspended" && "bg-[#222222] text-[#8A8A8A] border border-[#333]",
                  member.status.startsWith("Pending") && "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                )}
              >
                {member.statusText || member.status}
              </Badge>
              
              <Badge variant="outline" className="border-[#222222] text-[#8A8A8A] text-[9px] uppercase tracking-wider px-2 py-0.5">
                {member.plan}
              </Badge>
            </div>
          </div>

          <div className="border-t border-[#1A1A1A] pt-4 space-y-3 text-xs text-[#CFCFCF]">
            <div className="flex justify-between"><span className="text-[#8A8A8A]">Joined On</span><span className="font-semibold text-white">{member.joined}</span></div>
            <div className="flex justify-between"><span className="text-[#8A8A8A]">Valid Until</span><span className="font-semibold text-[#E02020]">{member.validUntil}</span></div>
            <div className="flex justify-between">
              <span className="text-[#8A8A8A]">Mobile</span>
              <a href={`tel:${member.mobile}`} className="font-semibold text-white hover:underline flex items-center gap-1">
                <Phone className="h-3 w-3 text-[#E02020]" /> {member.mobile}
              </a>
            </div>
            <div className="flex justify-between"><span className="text-[#8A8A8A]">Email</span><span className="font-semibold text-white truncate max-w-[160px]">{member.email}</span></div>
            <div className="flex justify-between"><span className="text-[#8A8A8A]">Home Branch</span><span className="font-semibold text-white truncate max-w-[160px]">{member.location.split(",")[0]}</span></div>
          </div>

          {/* Biometric Status Card */}
          <div className="border-t border-[#1A1A1A] pt-4 space-y-2">
            <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">Biometric Access</span>
            {member.biometric === "Registered" ? (
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    ✅ Biometric Active
                  </span>
                  <span className="text-[9px] text-[#8A8A8A]">Last used: Today 6:14 AM</span>
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-[#1A1A1A]">
                  <button
                    onClick={() => setBiometricModalOpen(true)}
                    className="text-[10px] bg-[#1C1C1C] hover:bg-[#2A2A2A] border border-[#2A2A2A] text-white px-2 py-1 rounded transition-colors uppercase font-bold"
                  >
                    Re-register
                  </button>
                  <button
                    onClick={handleRemoveBiometric}
                    className="text-[10px] text-red-400 hover:text-red-300 font-bold transition-colors uppercase cursor-pointer"
                  >
                    Remove Access
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-2 text-xs">
                <p className="font-semibold text-red-500 flex items-center gap-1">
                  ⚠️ Biometric not registered
                </p>
                <p className="text-[11px] text-[#8A8A8A] leading-relaxed">
                  Member cannot enter gym without fingerprint check-in at turnstile gates.
                </p>
                <Button
                  onClick={() => setBiometricModalOpen(true)}
                  className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-8 text-[10px] uppercase mt-1 animate-pulse"
                >
                  Register Biometric
                </Button>
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="border-t border-[#1A1A1A] pt-4 space-y-2">
            <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">Administrative Controls</span>
            
            {member.status === "Pending Approval" ? (
              <Button
                onClick={handleApprove}
                className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-9 text-xs uppercase"
              >
                Approve Application
              </Button>
            ) : member.status === "Pending Payment" ? (
              <Button
                onClick={handleVerifyPayment}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-9 text-xs uppercase"
              >
                Verify Payment
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleOpenRenewModal}
                  className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-9 text-xs uppercase"
                >
                  Renew Membership
                </Button>
                
                <Button
                  onClick={() => setSuspendModalOpen(true)}
                  variant="outline"
                  className="w-full border-red-600/20 text-red-400 bg-transparent hover:bg-red-600/10 h-9 text-xs font-bold uppercase"
                >
                  Suspend Member
                </Button>
              </>
            )}

            {/* Biometric Status Row */}
            <div className="flex items-center justify-between py-2 border-t border-b border-[#1A1A1A] my-2 text-xs">
              <span className="text-[#8A8A8A] font-semibold">Biometric:</span>
              {member.biometric === "Registered" ? (
                <div className="flex items-center gap-1.5">
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full">
                    ✅ Fingerprint Active
                  </span>
                  <button
                    onClick={() => setBiometricModalOpen(true)}
                    className="text-[#8A8A8A] hover:text-white underline text-[9px] font-bold cursor-pointer bg-transparent border-0 p-0"
                  >
                    Re-register
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-bold uppercase tracking-wider py-0.5 px-2 rounded-full">
                    ❌ No Biometric
                  </span>
                  <button
                    onClick={() => setBiometricModalOpen(true)}
                    className="text-red-500 hover:text-red-400 underline text-[9px] font-bold cursor-pointer bg-transparent border-0 p-0"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                onClick={handleSendSMS}
                className="w-full bg-[#1A1A1A] hover:bg-[#252525] border border-[#222222] text-[#CFCFCF] min-h-[44px] h-11 text-[10px] font-bold uppercase"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" /> Send SMS
              </Button>
              <Button
                onClick={() => toast.info("Profile edit panel loaded (Simulation)")}
                className="w-full bg-[#1A1A1A] hover:bg-[#252525] border border-[#222222] text-[#CFCFCF] min-h-[44px] h-11 text-[10px] font-bold uppercase"
              >
                <Edit className="h-3.5 w-3.5 mr-1" /> Edit Profile
              </Button>
            </div>

            <Button
              onClick={() => toast.success("Member Pass ID generated and saved as PDF")}
              className="w-full bg-[#1A1A1A] hover:bg-[#252525] border border-[#222222] text-[#CFCFCF] h-9 text-xs font-bold uppercase"
            >
              <Download className="h-4 w-4 mr-2" /> Download ID Card
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED TABS */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs Nav Header */}
          <div className="flex overflow-x-auto bg-[#0A0A0A] border border-[#222222] rounded-xl p-1.5 scrollbar-none snap-x snap-mandatory -mx-px">
            {([
              { id: "overview", label: "Overview", icon: User },
              { id: "biometric", label: "Biometric", icon: Fingerprint },
              { id: "attendance", label: "Attendance", icon: Calendar },
              { id: "payments", label: "Payments", icon: Receipt },
              { id: "membership", label: "History", icon: Clock },
              { id: "activity", label: "Activity Logs", icon: Activity }
            ] as const).map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                    active 
                      ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15" 
                      : "text-[#8A8A8A] hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel */}
          <div className="rounded-2xl border border-[#222222] bg-[#0A0A0A] p-6 min-h-[400px]">
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
                  <SubTabOverview
                    member={member}
                    showAadhaar={showAadhaar}
                    setShowAadhaar={setShowAadhaar}
                    staffNotes={staffNotes}
                    setStaffNotes={setStaffNotes}
                    handleSaveNotes={handleSaveNotes}
                  />
                )}
                {activeTab === "biometric" && (
                  <SubTabBiometric
                    member={member}
                    setBiometricModalOpen={setBiometricModalOpen}
                    setConfirmRemoveModalOpen={setConfirmRemoveModalOpen}
                    setActiveTab={setActiveTab}
                  />
                )}
                {activeTab === "attendance" && <SubTabAttendance />}
                {activeTab === "payments" && (
                  <SubTabPayments
                    member={member}
                    payments={payments}
                    setAddPaymentModal={setAddPaymentModal}
                  />
                )}
                {activeTab === "membership" && <SubTabMembershipHistory member={member} payments={payments} />}
                {activeTab === "activity" && <SubTabActivityLog memberId={member.memberId} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Manual Payment Entry Modal */}
      {addPaymentModal && (
        <div className="modal-overlay z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-xl bg-[#111111] border border-[#222222] overflow-hidden"
          >
            <div className="bg-[#0A0A0A] border-b border-[#222222] px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">Transaction Desk</span>
                <h3 className="font-display text-xl text-white mt-0.5">Add Manual Payment</h3>
              </div>
              <button onClick={() => setAddPaymentModal(false)} className="text-[#8A8A8A] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleManualPaymentSubmit} className="p-6 space-y-4 text-xs">
              <div className="space-y-2">
                <Label htmlFor="payAmt" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Payment Amount (INR)</Label>
                <Input
                  id="payAmt"
                  type="number"
                  placeholder="3999"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                  className="bg-[#0A0A0A] border-[#222222] h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Method / Source</Label>
                <Select value={payMethod} onValueChange={setPayMethod}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#222222] h-11 text-white">
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#222222] text-white">
                    <SelectItem value="Cash">Cash at Desk</SelectItem>
                    <SelectItem value="Card">Card Terminal</SelectItem>
                    <SelectItem value="UPI">UPI Payout</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-11 uppercase text-xs pt-0.5"
              >
                Complete Payment Receipt
              </Button>
            </form>
          </motion.div>
        </div>
      )}
      {/* Renewal Modal */}
      {renewModalOpen && member && (
        <div className="modal-overlay z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-xl bg-[#111111] border border-[#222222] overflow-hidden shadow-2xl"
          >
            <div className="bg-[#0A0A0A] border-b border-[#222222] px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">Billing Desk</span>
                <h3 className="font-display text-lg text-white mt-0.5 uppercase font-bold text-left">Renew Membership — {member.name}</h3>
              </div>
              <button onClick={() => setRenewModalOpen(false)} className="text-[#8A8A8A] hover:text-white bg-transparent border-0 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleActivateRenewal} className="p-6 space-y-4 text-xs text-left">
              {/* Plan Selector */}
              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Select Subscription Plan</Label>
                <Select value={renewPlan} onValueChange={setRenewPlan}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#222222] h-11 text-white">
                    <SelectValue placeholder="Select Plan" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#222222] text-white">
                    <SelectItem value="Monthly Standard">Monthly Standard (₹1,499)</SelectItem>
                    <SelectItem value="Quarterly Premium">Quarterly Premium (₹3,999)</SelectItem>
                    <SelectItem value="Annual Elite">Annual Elite (₹13,999)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Membership Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={renewStartDate}
                  onChange={(e) => setRenewStartDate(e.target.value)}
                  required
                  className="bg-[#0A0A0A] border-[#222222] h-11 text-white font-sans"
                />
              </div>

              {/* End Date (Calculated) */}
              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Calculated Expiry Date</Label>
                <div className="bg-[#0A0A0A] border border-[#222222] h-11 rounded-md px-3 flex items-center text-[#8A8A8A] font-medium font-sans">
                  {calculatedEndDate ? formatDate(calculatedEndDate) : "Select a start date"}
                </div>
              </div>

              {/* Payment Amount */}
              <div className="space-y-2">
                <Label htmlFor="renewAmt" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Payment Amount (INR)</Label>
                <Input
                  id="renewAmt"
                  type="number"
                  placeholder="3999"
                  value={renewAmount}
                  onChange={(e) => setRenewAmount(e.target.value)}
                  required
                  className="bg-[#0A0A0A] border-[#222222] h-11 text-white"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Payment Method</Label>
                <Select value={renewMethod} onValueChange={setRenewMethod}>
                  <SelectTrigger className="bg-[#0A0A0A] border-[#222222] h-11 text-white">
                    <SelectValue placeholder="Select Method" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#222222] text-white">
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction Reference */}
              <div className="space-y-2">
                <Label htmlFor="txnRef" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Transaction Reference (Optional)</Label>
                <Input
                  id="txnRef"
                  type="text"
                  placeholder="e.g. UPI Ref Number, Bank transfer ID"
                  value={renewReference}
                  onChange={(e) => setRenewReference(e.target.value)}
                  className="bg-[#0A0A0A] border-[#222222] h-11 text-white"
                />
              </div>

              {/* Staff Notes */}
              <div className="space-y-2">
                <Label htmlFor="renewNotes" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Staff Notes</Label>
                <Input
                  id="renewNotes"
                  type="text"
                  placeholder="e.g. Standard renewal, discount applied"
                  value={renewNotes}
                  onChange={(e) => setRenewNotes(e.target.value)}
                  className="bg-[#0A0A0A] border-[#222222] h-11 text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-11 uppercase text-xs"
                >
                  Activate Renewal
                </Button>
                <button
                  type="button"
                  onClick={() => setRenewModalOpen(false)}
                  className="text-[#8A8A8A] hover:text-white bg-transparent border-0 cursor-pointer uppercase font-bold text-xs px-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <ConfirmationModal
        isOpen={suspendModalOpen}
        onClose={() => setSuspendModalOpen(false)}
        onConfirm={handleSuspend}
        title="Suspend this member?"
        description={`${member.name} will lose gym access immediately`}
        confirmText="Confirm"
        cancelText="Cancel"
      />

      {/* Biometric registration modal */}
      {biometricModalOpen && member && (
        <div className="modal-overlay z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-xl bg-[#111111] border border-[#222222] overflow-hidden shadow-2xl"
          >
            <div className="bg-[#0A0A0A] border-b border-[#222222] px-6 py-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">ZKTeco SF300 Device Integration</span>
                <h3 className="font-display text-lg text-white mt-0.5 uppercase font-bold text-left">Register Biometric — {member.name}</h3>
              </div>
              <button onClick={() => { setBiometricModalOpen(false); setPresentCheckboxChecked(false); }} className="text-[#8A8A8A] hover:text-white bg-transparent border-0 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs text-left">
              {/* Member info strip */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0A0A0A] border border-[#222222]">
                <div className="h-10 w-10 rounded-full bg-[#E02020] flex items-center justify-center text-xs font-bold text-white uppercase shrink-0">
                  {member.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-sm truncate">{member.name}</div>
                  <div className="text-[10px] text-[#8A8A8A] truncate">{member.memberId} · {member.plan}</div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase text-[8px] font-bold py-0.5 shrink-0">
                  ✅ Active
                </Badge>
              </div>

              {/* Step indicator */}
              <div className="p-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl space-y-2">
                <span className="text-[8px] uppercase tracking-wider text-[#8A8A8A] font-bold">Hardware Connection Steps</span>
                <div className="space-y-1.5 font-sans">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <span className="text-xs">●</span> <span>Step 1: Confirm identity</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold animate-pulse">
                    <span className="text-xs">●</span> <span>Step 2: Capture fingerprint</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#555555]">
                    <span className="text-xs">●</span> <span>Step 3: Verify registration</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#E02020]/5 border border-[#E02020]/20 rounded-lg text-[#CFCFCF] space-y-2 leading-relaxed">
                <p>Ensure <strong className="text-white">{member.name}</strong> is physically present at reception with their photo ID.</p>
                <p>Ask them to place their finger firmly on the <strong className="text-white">ZKTeco SF300</strong> device.</p>
                <p className="text-amber-500 font-semibold animate-pulse">The device will beep once when captured successfully.</p>
              </div>

              {/* Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="present_checkbox"
                  checked={presentCheckboxChecked}
                  onChange={(e) => setPresentCheckboxChecked(e.target.checked)}
                  className="mt-0.5 rounded border-[#222222] bg-[#0A0A0A] text-[#E02020] focus:ring-[#E02020]"
                />
                <label htmlFor="present_checkbox" className="text-[#CFCFCF] text-[11px] leading-snug cursor-pointer select-none">
                  Member is present and fingerprint has been captured on device
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  disabled={!presentCheckboxChecked}
                  onClick={() => {
                    const todayStr = "29 May 2025";
                    const adminStr = "Gaurav Mehta (Admin)";
                    
                    setMember(prev => prev ? {
                      ...prev,
                      biometric: "Registered",
                      biometricDate: todayStr,
                      biometricBy: adminStr
                    } : null);

                    const usersStr = localStorage.getItem("registered_users");
                    if (usersStr) {
                      try {
                        const users = JSON.parse(usersStr);
                        const updated = users.map((u: any) => u.memberId === member.memberId ? {
                          ...u,
                          biometric: "Registered",
                          biometricDate: todayStr,
                          biometricBy: adminStr
                        } : u);
                        localStorage.setItem("registered_users", JSON.stringify(updated));
                      } catch(e) {}
                    }

                    // Write activity log
                    const logsStr = localStorage.getItem(`activity_logs_${member.memberId}`);
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
                      date: todayStr,
                      desc: `Biometric registered — ${todayStr} — by ${adminStr}`
                    };
                    localStorage.setItem(`activity_logs_${member.memberId}`, JSON.stringify([newEntry, ...logs]));

                    toast.success(`Biometric registered for ${member.name} ✓`);
                    setBiometricModalOpen(false);
                    setPresentCheckboxChecked(false);
                  }}
                  className="flex-1 bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-10 uppercase text-xs disabled:opacity-50 disabled:hover:bg-[#E02020]"
                >
                  ✓ Confirm Registration
                </Button>
                <button
                  onClick={() => { setBiometricModalOpen(false); setPresentCheckboxChecked(false); }}
                  className="text-[#8A8A8A] hover:text-white uppercase font-bold text-xs px-2 cursor-pointer bg-transparent border-0"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Remove Biometric access confirmation modal */}
      {confirmRemoveModalOpen && member && (
        <div className="modal-overlay z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-xl bg-[#111111] border border-[#222222] overflow-hidden shadow-2xl"
          >
            <div className="bg-[#0A0A0A] border-b border-[#222222] px-6 py-4 flex items-center justify-between">
              <h3 className="font-display text-lg text-white font-bold text-left uppercase">Revoke Biometric Access</h3>
              <button onClick={() => setConfirmRemoveModalOpen(false)} className="text-[#8A8A8A] hover:text-white bg-transparent border-0 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-left">
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2">
                <p className="font-bold text-white text-sm">Remove biometric access for {member.name}?</p>
                <p className="text-[#CFCFCF] text-[11px] leading-relaxed">
                  They will not be able to enter the gym using fingerprint scan until re-registered.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={handleRemoveBiometric}
                  className="flex-1 bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-10 uppercase text-xs"
                >
                  Confirm Remove
                </Button>
                <Button
                  onClick={() => setConfirmRemoveModalOpen(false)}
                  className="flex-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#222222] text-[#CFCFCF] font-bold h-10 uppercase text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ================= SUB TABS COMPONENTS =================

// TAB: BIOMETRIC
function SubTabBiometric({
  member, setBiometricModalOpen, setConfirmRemoveModalOpen, setActiveTab
}: {
  member: MemberDbEntry;
  setBiometricModalOpen: (b: boolean) => void;
  setConfirmRemoveModalOpen: (b: boolean) => void;
  setActiveTab: (tab: TabId) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const accessLogs = useMemo(() => [
    { date: "29 May 2025, 7:52 AM", direction: "Exit ↑", status: "Success", duration: "1h 38m" },
    { date: "29 May 2025, 6:14 AM", direction: "Entry ↓", status: "Success", duration: "—" },
    { date: "28 May 2025, 7:45 AM", direction: "Exit ↑", status: "Success", duration: "1h 43m" },
    { date: "28 May 2025, 6:02 AM", direction: "Entry ↓", status: "Success", duration: "—" },
    { date: "27 May 2025, 8:21 PM", direction: "Exit ↑", status: "Success", duration: "1h 23m" },
    { date: "27 May 2025, 6:58 PM", direction: "Entry ↓", status: "Success", duration: "—" },
    { date: "26 May 2025, 7:38 AM", direction: "Exit ↑", status: "Success", duration: "1h 33m" },
    { date: "26 May 2025, 6:05 AM", direction: "Entry ↓", status: "Success", duration: "—" },
    { date: "24 May 2025, 7:30 AM", direction: "Exit ↑", status: "Success", duration: "1h 32m" },
    { date: "24 May 2025, 5:58 AM", direction: "Entry ↓", status: "Success", duration: "—" },
    { date: "15 Mar 2025, 7:30 AM", direction: "Entry ↓", status: "Failed", duration: "—" }
  ], []);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return accessLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, accessLogs]);

  const totalPages = Math.ceil(accessLogs.length / itemsPerPage);

  const regDate = member.biometricDate || "20 Mar 2024";
  const regBy = member.biometricBy || "Staff Suresh Kumar";

  return (
    <div className="space-y-6 text-left">
      {/* Top Status Card */}
      {member.biometric === "Registered" ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 shadow-lg shadow-emerald-500/5 flex flex-col md:flex-row items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <Fingerprint className="h-10 w-10 text-emerald-400" />
          </div>
          <div className="flex-1 space-y-1 text-center md:text-left">
            <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Biometric Status</span>
            <h4 className="font-display text-xl font-bold text-white uppercase tracking-wide">Biometric Active</h4>
            <p className="text-xs text-[#CFCFCF]">{member.name}'s fingerprint is registered and gym access is enabled</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 text-[11px] text-[#8A8A8A] font-sans border-t border-[#1A1A1A]">
              <div>Registered on: <span className="text-white font-semibold">{regDate}</span></div>
              <div>Registered by: <span className="text-white font-semibold">{regBy}</span></div>
              <div>Last entry: <span className="text-white font-semibold">Today 6:14 AM</span></div>
              <div>Last exit: <span className="text-white font-semibold">Today 7:52 AM</span></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 shadow-lg shadow-red-500/5 flex flex-col md:flex-row items-center gap-6">
          <div className="relative h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
            <Fingerprint className="h-10 w-10 text-red-500 opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-1.5 bg-red-500 rotate-[45deg] rounded-full border border-[#0A0A0A] shadow" />
            </div>
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-red-500 font-bold">Biometric Status</span>
              <h4 className="font-display text-xl font-bold text-white uppercase tracking-wide">Biometric Not Registered</h4>
              <p className="text-xs text-[#CFCFCF] mt-0.5">This member cannot enter the gym until their fingerprint is registered at reception</p>
            </div>
            <Button
              onClick={() => setBiometricModalOpen(true)}
              className="bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-9 px-5 text-xs uppercase"
            >
              Register Biometric Now
            </Button>
          </div>
        </div>
      )}

      {/* Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Card 1 */}
        <div className="p-5 rounded-2xl border border-[#222222] bg-[#0A0A0A] space-y-4 flex flex-col justify-between animate-fade-in">
          <div className="space-y-1">
            <h5 className="font-display text-sm font-bold uppercase tracking-wider text-white">Register Fingerprint</h5>
            <p className="text-xs text-[#8A8A8A] leading-relaxed">Ask member to place finger on the ZKTeco device at reception</p>
          </div>
          <div>
            {member.biometric === "Registered" ? (
              <div className="space-y-2">
                <Button
                  onClick={() => setBiometricModalOpen(true)}
                  variant="outline"
                  className="border-[#222222] text-[#CFCFCF] hover:bg-[#1C1C1C] h-9 text-xs uppercase font-bold w-full"
                >
                  Re-register Biometric
                </Button>
                <p className="text-[10px] text-[#666666]">Use this if member's fingerprint is no longer being recognised</p>
              </div>
            ) : (
              <Button
                onClick={() => setBiometricModalOpen(true)}
                className="bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-9 text-xs uppercase w-full"
              >
                Register Biometric
              </Button>
            )}
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl border border-[#222222] bg-[#0A0A0A] space-y-4 flex flex-col justify-between animate-fade-in">
          <div className="space-y-1">
            <h5 className="font-display text-sm font-bold uppercase tracking-wider text-white">Revoke Biometric Access</h5>
            <p className="text-xs text-[#8A8A8A] leading-relaxed">Member will not be able to enter gym via fingerprint scan</p>
          </div>
          <div>
            <Button
              disabled={member.biometric !== "Registered"}
              onClick={() => setConfirmRemoveModalOpen(true)}
              variant="outline"
              className="border-red-600/30 text-red-500 hover:bg-red-600/10 h-9 text-xs uppercase font-bold w-full disabled:opacity-30 disabled:pointer-events-none"
            >
              Remove Biometric Access
            </Button>
          </div>
        </div>
      </div>

      {/* Biometric Access Log */}
      <div className="pt-4 border-t border-[#1A1A1A] space-y-4">
        <div>
          <h5 className="font-display text-sm font-bold uppercase tracking-wider text-white">Access History</h5>
          <p className="text-[11px] text-[#8A8A8A]">Recent fingerprint scan activity</p>
        </div>

        <div className="overflow-x-auto border border-[#222222] rounded-xl bg-[#0A0A0A]">
          <table className="w-full text-left border-collapse text-xs text-[#CFCFCF]">
            <thead>
              <tr className="border-b border-[#222222] bg-[#111111]/50 uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
                <th className="px-5 py-3">Date & Time</th>
                <th className="px-5 py-3">Direction</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#161616]">
              {paginatedLogs.map((log, idx) => {
                const isFailed = log.status === "Failed";
                return (
                  <tr key={idx} className={cn("hover:bg-[#111111]/80 transition-colors", isFailed && "bg-red-500/5 hover:bg-red-500/10")}>
                    <td className="px-5 py-2.5 font-medium text-white">{log.date}</td>
                    <td className="px-5 py-2.5">
                      <span className={cn(log.direction.includes("Entry") ? "text-emerald-400" : "text-amber-500")}>
                        {log.direction}
                      </span>
                    </td>
                    <td className="px-5 py-2.5">
                      <Badge className={cn(
                        "text-[9px] font-bold uppercase py-0 px-2",
                        isFailed ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      )}>
                        {isFailed ? "❌ Failed" : "✅ Success"}
                      </Badge>
                    </td>
                    <td className="px-5 py-2.5 font-mono text-[#8A8A8A]">{log.duration}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between text-xs pt-1">
          <button
            onClick={() => setActiveTab("attendance")}
            className="text-xs text-[#E02020] hover:underline font-bold bg-transparent border-0 cursor-pointer p-0"
          >
            View full attendance history
          </button>
          
          <div className="flex items-center gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="h-7 px-3 bg-[#111111] hover:bg-[#222222] border border-[#222222] text-white disabled:opacity-50 text-[10px] uppercase font-bold"
            >
              Prev
            </Button>
            <span className="text-[#8A8A8A]">Page {currentPage} of {totalPages}</span>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="h-7 px-3 bg-[#111111] hover:bg-[#222222] border border-[#222222] text-white disabled:opacity-50 text-[10px] uppercase font-bold"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// TAB 1: OVERVIEW
function SubTabOverview({
  member, showAadhaar, setShowAadhaar, staffNotes, setStaffNotes, handleSaveNotes
}: {
  member: MemberDbEntry;
  showAadhaar: boolean;
  setShowAadhaar: (b: boolean) => void;
  staffNotes: string;
  setStaffNotes: (s: string) => void;
  handleSaveNotes: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl uppercase tracking-wide text-[#E02020] pb-2 border-b border-[#222222] mb-4">Biometric & Health Profile</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] text-center">
            <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">Height</span>
            <span className="font-bold text-white text-base">{member.height}</span>
          </div>
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] text-center">
            <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">Weight</span>
            <span className="font-bold text-white text-base">{member.weight}</span>
          </div>
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] text-center">
            <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">Calculated BMI</span>
            <div className="flex justify-center items-center gap-1.5 pt-0.5">
              <span className="font-bold text-white text-base">{member.bmi}</span>
              <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/10 text-[8px] py-0 px-1 font-bold">
                {member.bmiCategory}
              </Badge>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[#1A1A1A] text-center">
            <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">Blood Segment</span>
            <span className="font-bold text-white text-base">{member.bloodGroup}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-[#CFCFCF]">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Workout Targets</span>
            <div className="flex flex-wrap gap-1.5">
              {member.goals.map((g) => (
                <Badge key={g} className="bg-[#E02020]/15 text-[#E02020] border border-[#E02020]/30 hover:bg-[#E02020]/15 text-[10px] py-0.5">
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block">Medical Constraints</span>
            <span className="font-bold text-white">{member.conditions}</span>
          </div>

          <div className="space-y-1 pt-2 border-t border-[#1A1A1A]">
            <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block">Emergency Contact</span>
            <div className="font-bold text-white">{member.emergencyName}</div>
            <div className="text-[#8A8A8A]">{member.emergencyMobile}</div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Masked Aadhaar Verification */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block">Govt Aadhaar Verification</span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm tracking-widest font-semibold text-white">
                {showAadhaar ? member.aadhaar.replace("XXXX-XXXX", "5034-7128") : member.aadhaar}
              </span>
              <button
                onClick={() => setShowAadhaar(!showAadhaar)}
                className="text-[#8A8A8A] hover:text-white"
                title={showAadhaar ? "Hide Aadhaar" : "Reveal Aadhaar"}
              >
                {showAadhaar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* staff notes */}
          <div className="space-y-2 pt-2 border-t border-[#1A1A1A]">
            <Label htmlFor="notes" className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block">Staff & Coach Notes</Label>
            <textarea
              id="notes"
              rows={3}
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              placeholder="Add safety constraints, training tips, or logs..."
              className="w-full rounded-md border border-[#222222] bg-[#0A0A0A] p-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:ring-1 focus:ring-[#E02020]"
            />
            <Button
              onClick={handleSaveNotes}
              className="bg-[#1A1A1A] hover:bg-[#252525] border border-[#222222] text-[#CFCFCF] h-8 px-4 text-[10px] font-bold uppercase mt-1"
            >
              Save Notes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// TAB 2: ATTENDANCE
function SubTabAttendance() {
  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  
  const heatMapData = useMemo(() => {
    return Array.from({ length: 119 }, (_, i) => {
      const isWeekend = i % 7 === 0 || i % 7 === 6;
      if (isWeekend) return Math.random() > 0.85 ? 2 : 0;
      const rand = Math.random();
      if (rand > 0.75) return 3;
      if (rand > 0.4) return 2;
      if (rand > 0.15) return 1;
      return 0;
    });
  }, []);

  const logs = [
    { date: "28 May 2025", checkIn: "6:14 AM", checkOut: "7:52 AM", duration: "1h 38m" },
    { date: "26 May 2025", checkIn: "6:02 AM", checkOut: "7:45 AM", duration: "1h 43m" },
    { date: "24 May 2025", checkIn: "5:58 AM", checkOut: "7:30 AM", duration: "1h 32m" },
    { date: "23 May 2025", checkIn: "6:10 AM", checkOut: "7:40 AM", duration: "1h 30m" },
    { date: "21 May 2025", checkIn: "6:05 AM", checkOut: "7:38 AM", duration: "1h 33m" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
        <h3 className="font-display text-xl uppercase tracking-wide text-[#E02020]">Attendance Summary</h3>
        <Badge variant="outline" className="border-[#222222] text-[#8A8A8A] text-[9px] uppercase tracking-wider font-normal">
          biometric gates synced
        </Badge>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-3 gap-4 text-center text-xs">
        <div className="p-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl">
          <div className="text-[9px] uppercase tracking-widest text-[#8A8A8A]">Total visits</div>
          <div className="font-display text-xl font-bold text-white mt-1">68</div>
        </div>
        <div className="p-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl">
          <div className="text-[9px] uppercase tracking-widest text-[#8A8A8A]">Avg Duration</div>
          <div className="font-display text-xl font-bold text-white mt-1">1h 35m</div>
        </div>
        <div className="p-3 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl">
          <div className="text-[9px] uppercase tracking-widest text-[#8A8A8A]">Best Streak</div>
          <div className="font-display text-xl font-bold text-white mt-1">12 days</div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <div className="grid grid-rows-7 gap-1 text-[8px] text-[#555555] font-bold uppercase pt-5">
          {daysOfWeek.map((d, idx) => (
            <span key={idx} className="h-[12px] flex items-center">{d}</span>
          ))}
        </div>
        <div className="space-y-1.5 flex-1">
          <div className="flex text-[8px] text-[#8A8A8A] uppercase font-bold justify-between max-w-[300px]">
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
          </div>
          <div className="grid grid-flow-col grid-rows-7 gap-1 auto-cols-max">
            {heatMapData.map((val, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-[12px] h-[12px] rounded-[1px]",
                  val === 0 && "bg-[#1A1A1A]",
                  val === 1 && "bg-[#6A1515]",
                  val === 2 && "bg-[#A81A1A]",
                  val === 3 && "bg-[#E02020]"
                )}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs text-[#CFCFCF]">
          <thead>
            <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
              <th className="py-2.5">Date</th>
              <th className="py-2.5">Check In</th>
              <th className="py-2.5">Check Out</th>
              <th className="py-2.5">Duration</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#161616]">
            {logs.map((log, idx) => (
              <tr key={idx} className="hover:bg-[#111111]/80">
                <td className="py-2.5 text-white font-medium">{log.date}</td>
                <td className="py-2.5">{log.checkIn}</td>
                <td className="py-2.5">{log.checkOut}</td>
                <td className="py-2.5">
                  <Badge variant="outline" className="border-emerald-500/20 text-emerald-400 bg-emerald-500/5 py-0.5">
                    {log.duration}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// TAB 3: PAYMENTS
function SubTabPayments({
  member, payments, setAddPaymentModal
}: {
  member: MemberDbEntry;
  payments: PaymentRecord[];
  setAddPaymentModal: (b: boolean) => void;
}) {
  const transactions = payments;

  const hasOutstanding = member.status === "Pending Payment" || member.status === "Expired";
  const outstandingAmount = member.plan.includes("Annual") 
    ? "₹13,999" 
    : member.plan.includes("Quarterly") 
      ? "₹3,999" 
      : "₹1,499";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
        <h3 className="font-display text-xl uppercase tracking-wide text-[#E02020]">Payments Ledger</h3>
        <Button
          onClick={() => setAddPaymentModal(true)}
          className="bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-8 text-[10px] uppercase"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Payment
        </Button>
      </div>

      {hasOutstanding ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3 text-xs">
          <ShieldAlert className="h-5 w-5 text-red-500 animate-pulse" />
          <div>
            <span className="font-bold text-red-500">Outstanding Balance Detected</span>
            <p className="text-[#8A8A8A] mt-0.5">
              Overdue / pending subscription balance: <strong className="text-white">{outstandingAmount}</strong>. Subscription status is currently <span className="text-[#E02020] uppercase font-bold">{member.status}</span>.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3 text-xs">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
          <div>
            <span className="font-bold text-emerald-400">Balance Clear</span>
            <p className="text-[#8A8A8A] mt-0.5">No outstanding balances or overdue fees detected for this account.</p>
          </div>
        </div>
      )}

      {/* Transactions list */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs text-[#CFCFCF]">
          <thead>
            <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
              <th className="py-2.5">Date</th>
              <th className="py-2.5">Item</th>
              <th className="py-2.5">Method</th>
              <th className="py-2.5">Amount</th>
              <th className="py-2.5 text-center">Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#161616]">
            {transactions.map((tx, idx) => (
              <tr key={idx} className="hover:bg-[#111111]/80">
                <td className="py-2.5 font-medium text-white">{tx.date}</td>
                <td className="py-2.5">{tx.plan}</td>
                <td className="py-2.5 text-[#8A8A8A]">{tx.method}</td>
                <td className="py-2.5 font-bold text-white">{tx.amount}</td>
                <td className="py-2.5">
                  <div className="flex justify-center">
                    <Link
                      to="/invoice/$id"
                      params={{ id: member.memberId }}
                      target="_blank"
                      className="inline-flex items-center justify-center rounded bg-[#1A1A1A] border border-[#222222] hover:bg-[#E02020] hover:text-white h-7 px-2.5 text-[10px] uppercase font-bold text-white font-sans transition-colors"
                    >
                      <Download className="h-3 w-3 mr-1" /> Invoice
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// TAB 4: MEMBERSHIP HISTORY
function SubTabMembershipHistory({
  member, payments
}: {
  member: MemberDbEntry;
  payments: PaymentRecord[];
}) {
  const history = payments.map(p => ({
    plan: p.plan,
    start: p.startDate,
    end: p.endDate,
    amount: p.amount,
    method: p.method
  }));

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-[#222222]">
        <h3 className="font-display text-xl uppercase tracking-wide text-[#E02020]">Plan Timelines</h3>
      </div>

      <div className="relative border-l border-[#222222] ml-3 pl-6 space-y-6 text-xs text-[#CFCFCF]">
        {history.map((item, idx) => (
          <div key={idx} className="relative">
            {/* Timeline bullet */}
            <div className="absolute -left-[30px] top-1 h-3 w-3 rounded-full bg-[#E02020] border-2 border-[#0A0A0A] shadow" />
            
            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-white text-sm uppercase">{item.plan}</span>
                <Badge variant="outline" className="border-[#222222] text-[#8A8A8A] text-[9px] py-0">
                  {item.amount}
                </Badge>
              </div>
              <p className="text-[#8A8A8A]">
                Period: <strong>{item.start}</strong> to <strong>{item.end}</strong>
              </p>
              <div className="text-[10px] text-[#555555]">
                Billed via {item.method}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// TAB 5: ACTIVITY LOG
function SubTabActivityLog({ memberId }: { memberId: string }) {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const logsStr = localStorage.getItem(`activity_logs_${memberId}`);
    if (logsStr) {
      try {
        setLogs(JSON.parse(logsStr));
        return;
      } catch (e) {}
    }
    setLogs([
      { title: "Membership renewed by Admin Gaurav", date: "12 Feb 2025", desc: "Approved cycle of Quarterly Premium (INV-2025-0182)" },
      { title: "SMS sent - renewal reminder", date: "5 Feb 2025", desc: "Automated alert sent to member mobile +91 98765 43210" },
      { title: "Biometric registered", date: "14 Feb 2024", desc: "Turnstile gate fingerprint and camera credentials synchronized" },
      { title: "Account approved by Admin", date: "13 Feb 2024", desc: "Verified initial cash receipt and created Member pass ID" },
      { title: "Application submitted", date: "12 Feb 2024", desc: "Registrant signup completed via ironforge.in/join" },
    ]);
  }, [memberId]);

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-[#222222]">
        <h3 className="font-display text-xl uppercase tracking-wide text-[#E02020]">System Log Trail</h3>
      </div>

      <div className="space-y-3">
        {logs.map((log, idx) => (
          <div key={idx} className="rounded-lg bg-[#0A0A0A] border border-[#222222] p-3.5 space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-xs text-white">{log.title}</span>
              <span className="text-[9px] text-[#555555] font-semibold uppercase">{log.date}</span>
            </div>
            <p className="text-xs text-[#8A8A8A] leading-normal">{log.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
