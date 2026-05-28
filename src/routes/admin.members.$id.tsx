import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft, Dumbbell, User, Calendar, Receipt, Activity, FileText, Clock,
  Phone, Mail, Check, AlertCircle, Edit, Trash2, Send, Download, Eye, EyeOff, ShieldAlert,
  UserX, Heart, Users, ShieldCheck, Printer, Plus, AlertTriangle, MessageSquare, QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/members/$id")({
  head: () => ({
    meta: [
      { title: "Member Profiles — IronForge Gym" },
      { name: "description", content: "Review gym member health biometrics, subscription payments and biometric checkins." },
    ],
  }),
  component: MemberDetails,
});

type TabId = "overview" | "attendance" | "payments" | "membership" | "activity";

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

function MemberDetails() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [member, setMember] = useState<MemberDbEntry | null>(null);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [staffNotes, setStaffNotes] = useState("");
  const [addPaymentModal, setAddPaymentModal] = useState(false);
  
  // Manual Payment Form
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");

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
              status: matched.paymentMode === "online" ? "Active" : "Pending Payment",
              location: "Hyderabad",
              mobile: matched.mobile.startsWith("+91") ? matched.mobile : `+91 ${matched.mobile}`,
              email: matched.email,
              joined: "Recently",
              validUntil: matched.plan === "quarterly" ? "3 Months From Now" : matched.plan === "annual" ? "1 Year From Now" : "1 Month From Now",
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
              notes: matched.notes || "Registered Walkin/Online queue user."
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
    const dbEntry = dummyMembersDb[id];
    if (dbEntry) {
      setMember(dbEntry);
      setStaffNotes(dbEntry.notes);
    } else {
      // Fallback
      const fallback = dummyMembersDb["IG-2024-0042"];
      setMember(fallback);
      setStaffNotes(fallback.notes);
    }
  }, [id]);

  const handleSaveNotes = () => {
    if (member) {
      setMember({ ...member, notes: staffNotes });
      toast.success("Staff notes updated successfully!");
    }
  };

  const handleRenew = () => {
    if (member) {
      setMember({
        ...member,
        status: "Active",
        validUntil: "31 Dec 2026",
        statusText: undefined
      });
      toast.success(`Membership for ${member.name} renewed successfully!`);
    }
  };

  const handleSuspend = () => {
    if (member) {
      setMember({
        ...member,
        status: "Suspended"
      });
      toast.error(`Membership for ${member.name} suspended.`);
    }
  };

  const handleSendSMS = () => {
    if (member) {
      toast.success(`Renewal reminder SMS dispatched to ${member.mobile}`);
    }
  };

  const handleManualPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount) return;
    toast.success(`Manual payment of ₹${parseFloat(payAmount).toLocaleString("en-IN")} processed via ${payMethod}`);
    setAddPaymentModal(false);
    setPayAmount("");
  };

  if (!member) return null;

  const initials = member.name.split(" ").map(n => n[0]).slice(0,2).join("");

  return (
    <div className="min-h-screen bg-[#111111] text-white p-6 md:p-8 space-y-6">
      
      {/* Back Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#222222]">
        <button
          onClick={() => navigate({ to: "/admin" })}
          className="text-sm text-[#8A8A8A] hover:text-white flex items-center gap-1.5 transition-colors font-semibold uppercase tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" /> All Members
        </button>
        
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

          {/* Quick Actions Panel */}
          <div className="border-t border-[#1A1A1A] pt-4 space-y-2">
            <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold block mb-1">Administrative Controls</span>
            
            <Button
              onClick={handleRenew}
              className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-9 text-xs uppercase"
            >
              Renew Membership
            </Button>
            
            <Button
              onClick={handleSuspend}
              variant="outline"
              className="w-full border-red-600/20 text-red-400 bg-transparent hover:bg-red-600/10 h-9 text-xs font-bold uppercase"
            >
              Suspend Member
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleSendSMS}
                className="bg-[#1A1A1A] hover:bg-[#252525] border border-[#222222] text-[#CFCFCF] h-9 text-[10px] font-bold uppercase"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" /> Send SMS
              </Button>
              <Button
                onClick={() => toast.info("Profile edit panel loaded (Simulation)")}
                className="bg-[#1A1A1A] hover:bg-[#252525] border border-[#222222] text-[#CFCFCF] h-9 text-[10px] font-bold uppercase"
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
          <div className="flex overflow-x-auto bg-[#0A0A0A] border border-[#222222] rounded-xl p-1.5 scrollbar-none">
            {([
              { id: "overview", label: "Overview", icon: User },
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
                {activeTab === "attendance" && <SubTabAttendance />}
                {activeTab === "payments" && (
                  <SubTabPayments
                    member={member}
                    setAddPaymentModal={setAddPaymentModal}
                  />
                )}
                {activeTab === "membership" && <SubTabMembershipHistory member={member} />}
                {activeTab === "activity" && <SubTabActivityLog />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Manual Payment Entry Modal */}
      {addPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
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

    </div>
  );
}

// ================= SUB TABS COMPONENTS =================

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
  member, setAddPaymentModal
}: {
  member: MemberDbEntry;
  setAddPaymentModal: (b: boolean) => void;
}) {
  const transactions = [
    { date: "12 Feb 2025", plan: "Quarterly Premium", method: "UPI (GPay)", amount: "₹3,999", status: "Paid" },
    { date: "12 Nov 2024", plan: "Quarterly Premium", method: "UPI (PhonePe)", amount: "₹3,999", status: "Paid" },
    { date: "12 Aug 2024", plan: "Monthly Standard", method: "Cash", amount: "₹1,499", status: "Paid" },
  ];

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
function SubTabMembershipHistory({ member }: { member: MemberDbEntry }) {
  const history = [
    { plan: "Quarterly Premium", start: "12 Feb 2025", end: "15 Aug 2025", amount: "₹3,999", method: "UPI (GPay)" },
    { plan: "Quarterly Premium", start: "12 Nov 2024", end: "12 Feb 2025", amount: "₹3,999", method: "UPI (PhonePe)" },
    { plan: "Monthly Standard", start: "12 Aug 2024", end: "12 Nov 2024", amount: "₹1,499", method: "Cash" },
  ];

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
function SubTabActivityLog() {
  const logs = [
    { title: "Membership renewed by Admin Gaurav", date: "12 Feb 2025", desc: "Approved cycle of Quarterly Premium (INV-2025-0182)" },
    { title: "SMS sent - renewal reminder", date: "5 Feb 2025", desc: "Automated alert sent to member mobile +91 98765 43210" },
    { title: "Biometric registered", date: "14 Feb 2024", desc: "Turnstile gate fingerprint and camera credentials synchronized" },
    { title: "Account approved by Admin", date: "13 Feb 2024", desc: "Verified initial cash receipt and created Member pass ID" },
    { title: "Application submitted", date: "12 Feb 2024", desc: "Registrant signup completed via ironforge.in/join" },
  ];

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
