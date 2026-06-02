import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Building2, Receipt, Clock, Bell, Contact, AlertTriangle, ShieldCheck,
  Plus, Trash2, Edit, Check, X, Download, RefreshCw, Eye, Dumbbell, Calendar, Smartphone
} from "lucide-react";
import { AdminPageLayout } from "@/components/layout/AdminPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Global Settings — IronForge Gym Staff Portal" },
      { name: "description", content: "Manage gym profiles, edit membership plans, update access policies, modify SMS templates and configure staff roles." },
    ],
  }),
  component: AdminSettingsPage,
});

type SettingsTab = "info" | "plans" | "access" | "sms" | "roles" | "danger";

interface Plan {
  id: string;
  name: string;
  duration: number; // in days
  basePrice: number;
  gst: number;
  active: boolean;
}

interface AddOn {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

interface StaffRolePermission {
  permission: string;
  manager: boolean;
  trainer: boolean;
  reception: boolean;
}

function AdminSettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>("info");

  // Tab 1: Gym Info
  const [gymName, setGymName] = useState("IronForge Gym");
  const [tagline, setTagline] = useState("Train Harder. Live Stronger.");
  const [address, setAddress] = useState("Road No. 12, Banjara Hills");
  const [city, setCity] = useState("Hyderabad");
  const [pincode, setPincode] = useState("500034");
  const [whatsapp, setWhatsapp] = useState("+91 98765 43210");
  const [gstin, setGstin] = useState("36AAAAA1111A1Z1");
  const [phones, setPhones] = useState(["+91 98765 43210", "+91 40 2345 6789"]);
  const [emails, setEmails] = useState(["info@ironforge.gym", "support@ironforge.gym"]);
  const [logoPreview, setLogoPreview] = useState("/favicon.svg");

  // Tab 2: Membership Plans & Addons
  const [plans, setPlans] = useState<Plan[]>([
    { id: "monthly", name: "Monthly", duration: 30, basePrice: 1270, gst: 229, active: true },
    { id: "quarterly", name: "Quarterly", duration: 90, basePrice: 3389, gst: 610, active: true },
    { id: "annual", name: "Annual", duration: 365, basePrice: 11864, gst: 2135, active: true }
  ]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editPlanName, setEditPlanName] = useState("");
  const [editPlanDuration, setEditPlanDuration] = useState(30);
  const [editPlanBasePrice, setEditPlanBasePrice] = useState(1000);
  const [editPlanActive, setEditPlanActive] = useState(true);

  const [addOns, setAddOns] = useState<AddOn[]>([
    { id: "personal", name: "Personal Training", price: 1695, active: true },
    { id: "diet", name: "Diet Consultation", price: 424, active: true }
  ]);
  const [newPlanOpen, setNewPlanOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDuration, setNewPlanDuration] = useState(30);
  const [newPlanBasePrice, setNewPlanBasePrice] = useState(1000);

  const [newAddonOpen, setNewAddonOpen] = useState(false);
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState(500);

  // Tab 3: Access & Rules
  const [gracePeriod, setGracePeriod] = useState(7);
  const [graceAccess, setGraceAccess] = useState("full"); // full, scan, none
  const [autoCheckout, setAutoCheckout] = useState(3);
  const [openingTime, setOpeningTime] = useState("05:00 AM");
  const [closingTime, setClosingTime] = useState("11:00 PM");
  const [sundayHours, setSundayHours] = useState("06:00 AM - 10:00 PM");
  const [holidays, setHolidays] = useState(["2026-10-23", "2026-12-25"]);
  const [newHolidayDate, setNewHolidayDate] = useState("");

  // Tab 4: Notifications & SMS templates
  const [smsSenderId, setSmsSenderId] = useState("IRFORG");
  const [smsThreshold, setSmsThreshold] = useState(100);
  const [selectedTemplate, setSelectedTemplate] = useState("welcome");
  
  const [templates, setTemplates] = useState<Record<string, string>>({
    welcome: "Hi {name}, welcome to IronForge Gym! Your member registration is confirmed. Gear up to lift! - IronForge Team",
    renewal: "Hi {name}, your {plan} membership expires on {expiry}. Renew now at {link} to avoid access lockout. - IronForge Gym",
    payment: "Hi {name}, payment of {amount} received successfully for invoice {refId}. Your receipt is ready. - IronForge Gym",
    approval: "Hi {name}, your application to join IronForge Gym has been APPROVED by the management. See you soon! - IronForge Gym"
  });

  // Tab 5: Role Permissions Table
  const [permissions, setPermissions] = useState<StaffRolePermission[]>([
    { permission: "View all members", manager: true, trainer: false, reception: true },
    { permission: "Approve applications", manager: true, trainer: false, reception: true },
    { permission: "Process payments", manager: true, trainer: false, reception: true },
    { permission: "Send SMS notifications", manager: true, trainer: false, reception: true },
    { permission: "View reports & analytics", manager: true, trainer: false, reception: false },
    { permission: "Edit global settings", manager: true, trainer: false, reception: false },
    { permission: "Add & remove staff", manager: true, trainer: false, reception: false }
  ]);

  // Tab 6: Danger Zone
  const [isExporting, setIsExporting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Sync / Save states to localstorage on save
  const handleSaveInfo = () => {
    toast.success("Gym Info settings saved!");
  };

  const handleSaveAccess = () => {
    toast.success("Access & Operating Rules settings saved!");
  };

  const handleSaveSmsSettings = () => {
    toast.success("SMS Settings and templates updated successfully!");
  };

  const handleSavePermissions = () => {
    toast.success("Staff Role Permission matrix saved!");
  };

  // Simulated logo upload
  const handleLogoUpload = () => {
    toast.success("Gym logo uploaded successfully (simulation)");
  };

  const handleFaviconUpload = () => {
    toast.success("Favicon updated successfully (simulation)");
  };

  // Tab 2 Actions: Plan Management
  const handleStartEditPlan = (p: Plan) => {
    setEditingPlanId(p.id);
    setEditPlanName(p.name);
    setEditPlanDuration(p.duration);
    setEditPlanBasePrice(p.basePrice);
    setEditPlanActive(p.active);
  };

  const handleSaveEditPlan = () => {
    setPlans(prev => prev.map(p => {
      if (p.id === editingPlanId) {
        const gstVal = Math.round(editPlanBasePrice * 0.18);
        return {
          ...p,
          name: editPlanName,
          duration: editPlanDuration,
          basePrice: editPlanBasePrice,
          gst: gstVal,
          active: editPlanActive
        };
      }
      return p;
    }));
    setEditingPlanId(null);
    toast.success("Plan updated successfully!");
  };

  const handleAddPlan = () => {
    if (!newPlanName) {
      toast.error("Please enter a plan name.");
      return;
    }
    const newId = newPlanName.toLowerCase().replace(/\s+/g, "-");
    const gstVal = Math.round(newPlanBasePrice * 0.18);
    const newPlanObj: Plan = {
      id: newId,
      name: newPlanName,
      duration: newPlanDuration,
      basePrice: newPlanBasePrice,
      gst: gstVal,
      active: true
    };
    setPlans(prev => [...prev, newPlanObj]);
    setNewPlanName("");
    setNewPlanOpen(false);
    toast.success("New membership plan added!");
  };

  // Addon actions
  const handleAddAddon = () => {
    if (!newAddonName) {
      toast.error("Please enter add-on name.");
      return;
    }
    const newAddonObj: AddOn = {
      id: newAddonName.toLowerCase().replace(/\s+/g, "-"),
      name: newAddonName,
      price: newAddonPrice,
      active: true
    };
    setAddOns(prev => [...prev, newAddonObj]);
    setNewAddonName("");
    setNewAddonOpen(false);
    toast.success("New add-on services configured!");
  };

  const togglePlanActive = (id: string) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
    toast.success("Plan visibility toggled!");
  };

  const toggleAddonActive = (id: string) => {
    setAddOns(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
    toast.success("Add-on service status updated!");
  };

  // Tab 3 Actions: Operating rules
  const handleAddHoliday = () => {
    if (!newHolidayDate) return;
    if (holidays.includes(newHolidayDate)) {
      toast.error("Date already selected as a holiday closure.");
      return;
    }
    setHolidays(prev => [...prev, newHolidayDate].sort());
    setNewHolidayDate("");
    toast.success("Holiday closure registered!");
  };

  const handleRemoveHoliday = (d: string) => {
    setHolidays(prev => prev.filter(h => h !== d));
    toast.success("Holiday closure date removed.");
  };

  // Tab 4: Phone Preview resolver
  const getSmsPreview = () => {
    const templateText = templates[selectedTemplate];
    if (!templateText) return "";

    return templateText
      .replace(/{name}/g, "Rahul Sharma")
      .replace(/{plan}/g, "Quarterly Premium")
      .replace(/{expiry}/g, "15 Aug 2025")
      .replace(/{amount}/g, "₹3,999")
      .replace(/{refId}/g, "INV-2025-0284")
      .replace(/{link}/g, "ironforge.gym/renew");
  };

  const handleTemplateChange = (text: string) => {
    setTemplates(prev => ({
      ...prev,
      [selectedTemplate]: text
    }));
  };

  // Tab 5: Role Permissions matrix update
  const togglePermission = (idx: number, role: "manager" | "trainer" | "reception") => {
    setPermissions(prev => prev.map((p, i) => {
      if (i === idx) {
        return {
          ...p,
          [role]: !p[role]
        };
      }
      return p;
    }));
  };

  // Tab 6 Actions: Danger Zone controls
  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      // Generate CSV download
      const csvContent = "data:text/csv;charset=utf-8,MemberId,Name,Phone,Email,Status,Expiry\n" +
        "IG-2024-0042,Rahul Sharma,9876543210,rahul.sharma@example.com,Active,2025-08-15\n" +
        "IG-2024-0071,Priya Patel,9876543211,priya.patel@example.com,Active,2025-06-01\n" +
        "IG-2024-0156,Rohit Gupta,9876543212,rohit.gupta@example.com,Pending Payment,2025-05-15";
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "ironforge_members_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV Member Database exported successfully!");
    }, 2000);
  };

  const handleResetDemoData = () => {
    localStorage.clear();
    toast.success("Database fully wiped. Restarting application...");
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  };

  return (
    <AdminPageLayout>
      <div className="space-y-6">
        {/* Title */}
        <div>
          <h1 className="font-display text-3xl tracking-wide uppercase text-white font-bold">Global Gym Settings</h1>
          <p className="text-xs text-[#8A8A8A] mt-1">Configure global parameter specifications, edit pricing structures, rules, and messaging services.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 overflow-x-auto border-b border-[#222222] pb-px scrollbar-none">
          {[
            { id: "info", label: "Gym Info", icon: Building2 },
            { id: "plans", label: "Plans & Add-ons", icon: Receipt },
            { id: "access", label: "Access & Rules", icon: Clock },
            { id: "sms", label: "SMS Templates", icon: Bell },
            { id: "roles", label: "Role Permissions", icon: Contact },
            { id: "danger", label: "Danger Zone", icon: AlertTriangle }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 border-b-2 font-bold uppercase tracking-wider text-[10px] shrink-0 transition-colors cursor-pointer select-none min-h-[44px]",
                  active
                    ? "border-[#E02020] text-white bg-[#E02020]/5"
                    : "border-transparent text-[#8A8A8A] hover:text-white"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main form layouts */}
        <div className="bg-[#111111] border border-[#222222] rounded-xl p-6 sm:p-8 min-h-[500px] text-left">
          <AnimatePresence mode="wait">
            {activeTab === "info" && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Gym name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="gymName" className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Gym Name</Label>
                    <Input id="gymName" value={gymName} onChange={(e) => setGymName(e.target.value)} className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs" />
                  </div>
                  {/* Tagline */}
                  <div className="space-y-1.5">
                    <Label htmlFor="tagline" className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Tagline / Motive</Label>
                    <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Street Address</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs" />
                  </div>
                  {/* City */}
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">City</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs" />
                  </div>
                  {/* Pincode */}
                  <div className="space-y-1.5">
                    <Label htmlFor="pincode" className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Pincode</Label>
                    <Input id="pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs" />
                  </div>
                </div>

                {/* Multiple inputs: Phones */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Contact Numbers</Label>
                  <div className="space-y-2">
                    {phones.map((p, idx) => (
                      <div key={idx} className="flex gap-2 max-w-md">
                        <Input
                          value={p}
                          onChange={(e) => {
                            const newPhones = [...phones];
                            newPhones[idx] = e.target.value;
                            setPhones(newPhones);
                          }}
                          className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs"
                        />
                        <Button
                          onClick={() => setPhones(prev => prev.filter((_, i) => i !== idx))}
                          disabled={phones.length <= 1}
                          className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 shrink-0 h-10 w-10 flex items-center justify-center p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setPhones(prev => [...prev, ""])}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-[10px] h-9 px-3 flex items-center gap-1.5 mt-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Number
                  </Button>
                </div>

                {/* Multiple inputs: Emails */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Email Addresses</Label>
                  <div className="space-y-2">
                    {emails.map((e, idx) => (
                      <div key={idx} className="flex gap-2 max-w-md">
                        <Input
                          value={e}
                          onChange={(e) => {
                            const newEmails = [...emails];
                            newEmails[idx] = e.target.value;
                            setEmails(newEmails);
                          }}
                          className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs"
                        />
                        <Button
                          onClick={() => setEmails(prev => prev.filter((_, i) => i !== idx))}
                          disabled={emails.length <= 1}
                          className="bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 shrink-0 h-10 w-10 flex items-center justify-center p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={() => setEmails(prev => [...prev, ""])}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-[10px] h-9 px-3 flex items-center gap-1.5 mt-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Email
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* WhatsApp */}
                  <div className="space-y-1.5">
                    <Label htmlFor="whatsapp" className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">WhatsApp Business Link Number</Label>
                    <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs" />
                  </div>
                  {/* GSTIN */}
                  <div className="space-y-1.5">
                    <Label htmlFor="gstin" className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">GSTIN Number</Label>
                    <Input id="gstin" value={gstin} onChange={(e) => setGstin(e.target.value)} className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs" />
                  </div>
                </div>

                {/* Logo & Favicon upload */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#222222]">
                  {/* Logo */}
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Brand Logo Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 bg-[#1A1A1A] border border-[#222222] rounded-lg flex items-center justify-center overflow-hidden">
                        <Dumbbell className="h-8 w-8 text-[#E02020]" />
                      </div>
                      <div className="space-y-1.5">
                        <Button onClick={handleLogoUpload} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-[10px] h-9">
                          Upload New Logo
                        </Button>
                        <div className="text-[9px] text-[#555555]">PNG format, transparent, square dimension max 512px.</div>
                      </div>
                    </div>
                  </div>

                  {/* Favicon */}
                  <div className="space-y-3">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Brand Favicon Icon</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-[#1A1A1A] border border-[#222222] rounded flex items-center justify-center">
                        <span className="font-display font-bold text-xs text-[#E02020]">IF</span>
                      </div>
                      <div className="space-y-1.5">
                        <Button onClick={handleFaviconUpload} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-[10px] h-9">
                          Upload Favicon
                        </Button>
                        <div className="text-[9px] text-[#555555]">SVG or standard ICO format, 32px or 16px.</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#222222] flex justify-end">
                  <Button onClick={handleSaveInfo} className="bg-[#E02020] hover:bg-[#C41818] text-white font-bold uppercase tracking-wider text-xs px-6 h-11">
                    Save Brand & Profile Settings
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === "plans" && (
              <motion.div
                key="plans"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Section: Membership plans */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">Membership Plans Table</h3>
                      <p className="text-[11px] text-[#8A8A8A] mt-0.5">Edit base pricing plans presented to members during checkout.</p>
                    </div>
                    <Button onClick={() => setNewPlanOpen(true)} className="bg-[#E02020] hover:bg-[#C41818] text-white text-xs font-bold uppercase tracking-wider h-9 px-4 flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Add Plan
                    </Button>
                  </div>

                  {/* Add Plan Inline form */}
                  {newPlanOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 space-y-4 mb-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#E02020]">Configure New Membership Plan</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[9px] uppercase tracking-wider text-[#8A8A8A]">Plan Name</Label>
                          <Input value={newPlanName} onChange={(e) => setNewPlanName(e.target.value)} className="bg-black border-[#333] h-9 text-xs" placeholder="e.g. Semi-Annual" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] uppercase tracking-wider text-[#8A8A8A]">Duration (days)</Label>
                          <Input type="number" value={newPlanDuration} onChange={(e) => setNewPlanDuration(parseInt(e.target.value) || 30)} className="bg-black border-[#333] h-9 text-xs" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] uppercase tracking-wider text-[#8A8A8A]">Base Price (₹)</Label>
                          <Input type="number" value={newPlanBasePrice} onChange={(e) => setNewPlanBasePrice(parseInt(e.target.value) || 0)} className="bg-black border-[#333] h-9 text-xs" />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button onClick={() => setNewPlanOpen(false)} variant="outline" className="h-8 text-[10px] font-bold uppercase tracking-wider border-[#333] bg-transparent text-white">Cancel</Button>
                        <Button onClick={handleAddPlan} className="h-8 text-[10px] font-bold uppercase tracking-wider bg-[#E02020] hover:bg-[#C41818] text-white">Save Plan</Button>
                      </div>
                    </motion.div>
                  )}

                  <div className="border border-[#222222] rounded-lg overflow-x-auto bg-black/40">
                    <table className="w-full min-w-[650px] text-xs">
                      <thead>
                        <tr className="border-b border-[#222222] bg-[#111111]/70 text-[#8A8A8A] font-bold uppercase text-[9px] tracking-wider">
                          <th className="px-4 py-3 text-left">Plan Name</th>
                          <th className="px-4 py-3 text-left">Duration</th>
                          <th className="px-4 py-3 text-left">Base Price</th>
                          <th className="px-4 py-3 text-left">GST (18%)</th>
                          <th className="px-4 py-3 text-left">Total Price</th>
                          <th className="px-4 py-3 text-center">Active</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222]">
                        {plans.map((p) => {
                          const isEditing = editingPlanId === p.id;
                          return (
                            <tr key={p.id} className="hover:bg-white/[0.01]">
                              <td className="px-4 py-3 font-semibold text-white">
                                {isEditing ? (
                                  <Input value={editPlanName} onChange={(e) => setEditPlanName(e.target.value)} className="bg-black border-[#333] h-8 text-xs max-w-[120px]" />
                                ) : (
                                  p.name
                                )}
                              </td>
                              <td className="px-4 py-3 text-[#CFCFCF]">
                                {isEditing ? (
                                  <Input type="number" value={editPlanDuration} onChange={(e) => setEditPlanDuration(parseInt(e.target.value) || 30)} className="bg-black border-[#333] h-8 text-xs max-w-[80px]" />
                                ) : (
                                  `${p.duration} days`
                                )}
                              </td>
                              <td className="px-4 py-3 font-mono">
                                {isEditing ? (
                                  <Input type="number" value={editPlanBasePrice} onChange={(e) => setEditPlanBasePrice(parseInt(e.target.value) || 0)} className="bg-black border-[#333] h-8 text-xs max-w-[100px]" />
                                ) : (
                                  `₹${p.basePrice.toLocaleString("en-IN")}`
                                )}
                              </td>
                              <td className="px-4 py-3 font-mono text-[#8A8A8A]">
                                {isEditing ? (
                                  `₹${Math.round(editPlanBasePrice * 0.18).toLocaleString("en-IN")}`
                                ) : (
                                  `₹${p.gst.toLocaleString("en-IN")}`
                                )}
                              </td>
                              <td className="px-4 py-3 font-bold text-white font-mono">
                                {isEditing ? (
                                  `₹${Math.round(editPlanBasePrice * 1.18).toLocaleString("en-IN")}`
                                ) : (
                                  `₹${(p.basePrice + p.gst).toLocaleString("en-IN")}`
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {isEditing ? (
                                  <button onClick={() => setEditPlanActive(!editPlanActive)} className={cn("px-2 py-1 rounded text-[9px] font-bold uppercase", editPlanActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20")}>
                                    {editPlanActive ? "Active" : "Inactive"}
                                  </button>
                                ) : (
                                  <button onClick={() => togglePlanActive(p.id)} className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase", p.active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                                    {p.active ? "Active" : "Inactive"}
                                  </button>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {isEditing ? (
                                  <div className="flex gap-1.5 justify-end">
                                    <button onClick={() => setEditingPlanId(null)} className="h-7 w-7 rounded bg-transparent border border-[#333] flex items-center justify-center hover:bg-white/5 text-[#8A8A8A] hover:text-white">
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                    <button onClick={handleSaveEditPlan} className="h-7 w-7 rounded bg-[#E02020] hover:bg-[#C41818] flex items-center justify-center text-white">
                                      <Check className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <button onClick={() => handleStartEditPlan(p)} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded flex items-center gap-1 ml-auto">
                                    <Edit className="h-3 w-3" /> Edit
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section: Addons manager */}
                <div className="border-t border-[#222222] pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">Gym Add-on Services</h3>
                      <p className="text-[11px] text-[#8A8A8A] mt-0.5">Configure supplementary facility or trainer add-ons offered to subscribers.</p>
                    </div>
                    <Button onClick={() => setNewAddonOpen(true)} className="bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs font-bold uppercase tracking-wider h-9 px-4 flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      Add Add-on
                    </Button>
                  </div>

                  {/* Add addon inline form */}
                  {newAddonOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-[#1A1A1A] border border-[#333333] rounded-lg p-4 space-y-4 mb-4">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#E02020]">Configure New Service Add-on</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[9px] uppercase tracking-wider text-[#8A8A8A]">Service Title</Label>
                          <Input value={newAddonName} onChange={(e) => setNewAddonName(e.target.value)} className="bg-black border-[#333] h-9 text-xs" placeholder="e.g. Locker Service" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[9px] uppercase tracking-wider text-[#8A8A8A]">Monthly Fee (₹)</Label>
                          <Input type="number" value={newAddonPrice} onChange={(e) => setNewAddonPrice(parseInt(e.target.value) || 0)} className="bg-black border-[#333] h-9 text-xs" />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button onClick={() => setNewAddonOpen(false)} variant="outline" className="h-8 text-[10px] font-bold uppercase tracking-wider border-[#333] bg-transparent text-white">Cancel</Button>
                        <Button onClick={handleAddAddon} className="h-8 text-[10px] font-bold uppercase tracking-wider bg-[#E02020] hover:bg-[#C41818] text-white">Save Add-on</Button>
                      </div>
                    </motion.div>
                  )}

                  <div className="border border-[#222222] rounded-lg overflow-hidden bg-black/40">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[#222222] bg-[#111111]/70 text-[#8A8A8A] font-bold uppercase text-[9px] tracking-wider">
                          <th className="px-4 py-3 text-left">Service Name</th>
                          <th className="px-4 py-3 text-left">Charge Rate</th>
                          <th className="px-4 py-3 text-left">GST Policy</th>
                          <th className="px-4 py-3 text-center">Active Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#222222]">
                        {addOns.map((a) => (
                          <tr key={a.id} className="hover:bg-white/[0.01]">
                            <td className="px-4 py-3 font-semibold text-white">{a.name}</td>
                            <td className="px-4 py-3 font-mono text-[#CFCFCF]">₹{a.price}/month</td>
                            <td className="px-4 py-3 text-[#8A8A8A]">18% GST Exclusive</td>
                            <td className="px-4 py-3 text-center">
                              <button onClick={() => toggleAddonActive(a.id)} className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase", a.active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400")}>
                                {a.active ? "Active" : "Inactive"}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "access" && (
              <motion.div
                key="access"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Grace Period */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Access & Validation Policies</h3>
                  
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white">Biometric Grace Period duration</span>
                      <span className="font-mono text-[#E02020] font-bold">{gracePeriod} days</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={gracePeriod}
                      onChange={(e) => setGracePeriod(parseInt(e.target.value))}
                      className="w-full accent-[#E02020] h-1.5 bg-[#222222] rounded-lg cursor-pointer"
                    />
                    <div className="text-[10px] text-[#8A8A8A]">Grace window allowed for barcode/fingerprint access validation after plan expiration.</div>
                  </div>

                  {/* Grace Access Rule */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Grace Period Admission Policy</Label>
                    <select
                      value={graceAccess}
                      onChange={(e) => setGraceAccess(e.target.value)}
                      className="bg-black/60 border border-[#222222] focus:border-[#E02020] text-xs h-10 px-3 rounded w-full max-w-md text-white outline-none cursor-pointer"
                    >
                      <option value="full">Full Access (Allow entry gates + training floor)</option>
                      <option value="scan">Scan Only (Allow gate check-in, alert receptionist)</option>
                      <option value="none">No Access (Deny admission, lock turnstile gates)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#222222]">
                  {/* Auto checkout */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Auto Checkout Duration</Label>
                    <div className="flex items-center gap-2 max-w-xs">
                      <Input
                        type="number"
                        min="1"
                        max="12"
                        value={autoCheckout}
                        onChange={(e) => setAutoCheckout(parseInt(e.target.value) || 3)}
                        className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs w-20 text-center font-bold"
                      />
                      <span className="text-xs text-[#8A8A8A]">hours</span>
                    </div>
                    <div className="text-[9px] text-[#555555]">System logs auto-checkout if exits are not registered.</div>
                  </div>

                  {/* Sunday Hours */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Sunday Hours Override</Label>
                    <Input value={sundayHours} onChange={(e) => setSundayHours(e.target.value)} className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs max-w-xs" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Gym Opening */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Opening Hour</Label>
                    <Input value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs max-w-xs" />
                  </div>
                  {/* Gym Closing */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Closing Hour</Label>
                    <Input value={closingTime} onChange={(e) => setClosingTime(e.target.value)} className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs max-w-xs" />
                  </div>
                </div>

                {/* Holiday closures list */}
                <div className="border-t border-[#222222] pt-6 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Registered Holiday Closures</h4>
                    <p className="text-[10px] text-[#8A8A8A] mt-0.5">Add specific calendar dates on which gate access is locked (public holidays).</p>
                  </div>
                  
                  <div className="flex gap-2 max-w-md">
                    <Input
                      type="date"
                      value={newHolidayDate}
                      onChange={(e) => setNewHolidayDate(e.target.value)}
                      className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs"
                    />
                    <Button onClick={handleAddHoliday} className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs h-10 px-4">
                      Add Holiday
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {holidays.map((h) => (
                      <span key={h} className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#E02020]/10 border border-[#E02020]/20 text-[#E02020] text-xs font-mono">
                        {h}
                        <button onClick={() => handleRemoveHoliday(h)} className="text-[#8A8A8A] hover:text-white cursor-pointer ml-1 select-none">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#222222] flex justify-end">
                  <Button onClick={handleSaveAccess} className="bg-[#E02020] hover:bg-[#C41818] text-white font-bold uppercase tracking-wider text-xs px-6 h-11">
                    Save Operating parameters
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === "sms" && (
              <motion.div
                key="sms"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Configuration parameters */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-white">SMS Services Config</h3>
                      <p className="text-[11px] text-[#8A8A8A] mt-0.5">Configure notification endpoints and SMS broadcast templates.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="senderId" className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">SMS Sender ID (DLT Registration)</Label>
                        <Input id="senderId" maxLength={6} value={smsSenderId} onChange={(e) => setSmsSenderId(e.target.value.toUpperCase())} className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs max-w-xs font-mono font-bold" />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="threshold" className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Low SMS Credit balance alert threshold</Label>
                        <div className="flex items-center gap-2 max-w-xs">
                          <Input id="threshold" type="number" value={smsThreshold} onChange={(e) => setSmsThreshold(parseInt(e.target.value) || 0)} className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] h-10 text-xs w-24 text-center font-bold" />
                          <span className="text-xs text-[#8A8A8A]">SMS remaining</span>
                        </div>
                      </div>
                    </div>

                    {/* Choose Template to Edit */}
                    <div className="space-y-2 pt-4 border-t border-[#222222]">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Select Template to Modify</Label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="bg-black/60 border border-[#222222] focus:border-[#E02020] text-xs h-10 px-3 rounded w-full text-white outline-none cursor-pointer"
                      >
                        <option value="welcome">Welcome Message Template</option>
                        <option value="renewal">Renewal Reminder Template</option>
                        <option value="payment">Payment Received Template</option>
                        <option value="approval">Approval Notification Template</option>
                      </select>
                    </div>

                    {/* Edit Textarea */}
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Template Text Content</Label>
                      <textarea
                        value={templates[selectedTemplate]}
                        onChange={(e) => handleTemplateChange(e.target.value)}
                        rows={4}
                        className="w-full bg-black/40 border border-[#222222] focus:border-[#E02020] rounded-lg p-3 text-xs text-white outline-none resize-none leading-relaxed"
                      />
                      <div className="text-[9px] text-[#555555] flex flex-wrap gap-2">
                        <span>Variables: </span>
                        <code className="text-[#E02020]">{`{name}`}</code>
                        {selectedTemplate === "renewal" && (
                          <>
                            <code className="text-[#E02020]">{`{plan}`}</code>
                            <code className="text-[#E02020]">{`{expiry}`}</code>
                            <code className="text-[#E02020]">{`{link}`}</code>
                          </>
                        )}
                        {selectedTemplate === "payment" && (
                          <>
                            <code className="text-[#E02020]">{`{amount}`}</code>
                            <code className="text-[#E02020]">{`{refId}`}</code>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Real-time Phone Preview Panel (Zone 4 specification) */}
                  <div className="flex flex-col items-center justify-center p-4 bg-black/30 border border-[#222222] rounded-xl relative overflow-hidden">
                    <div className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold mb-4 flex items-center gap-1.5">
                      <Smartphone className="h-4 w-4" /> Live Mobile preview
                    </div>
                    
                    {/* Phone graphic container */}
                    <div className="relative w-64 h-[400px] bg-[#1a1a1a] rounded-[36px] border-4 border-[#333] shadow-2xl overflow-hidden flex flex-col">
                      {/* Phone Speaker/Camera cutout */}
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-10 flex items-center justify-center">
                        <div className="h-1 w-8 bg-[#222] rounded-full" />
                      </div>
                      
                      {/* Status bar */}
                      <div className="h-8 bg-black/40 pt-2 px-6 flex justify-between text-[8px] text-white/80 select-none">
                        <span>9:41 AM</span>
                        <div className="flex gap-1">
                          <span>5G</span>
                          <span>🔋 100%</span>
                        </div>
                      </div>

                      {/* Messages body */}
                      <div className="flex-1 bg-neutral-900 p-4 space-y-4 flex flex-col justify-end pb-8">
                        {/* Bubble */}
                        <div className="self-start max-w-[85%] bg-neutral-800 border border-neutral-700/50 rounded-2xl rounded-tl-sm p-3 shadow-md relative text-left">
                          <div className="text-[8px] text-[#E02020] font-bold tracking-wider uppercase mb-1">{smsSenderId}</div>
                          <p className="text-[10px] text-white/95 leading-relaxed font-sans whitespace-pre-line">
                            {getSmsPreview()}
                          </p>
                          <span className="text-[7px] text-neutral-500 block text-right mt-1.5">Just now · SMS</span>
                        </div>
                      </div>

                      {/* Home Indicator */}
                      <div className="h-4 bg-black flex items-center justify-center">
                        <div className="w-24 h-1 bg-white/40 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#222222] flex justify-end">
                  <Button onClick={handleSaveSmsSettings} className="bg-[#E02020] hover:bg-[#C41818] text-white font-bold uppercase tracking-wider text-xs px-6 h-11">
                    Save Template parameters
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === "roles" && (
              <motion.div
                key="roles"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Staff Roles Permissions matrix</h3>
                  <p className="text-[11px] text-[#8A8A8A] mt-0.5">Toggle staff authorization limits. Updates security routing overrides.</p>
                </div>

                <div className="border border-[#222222] rounded-lg overflow-x-auto bg-black/40">
                  <table className="w-full text-xs min-w-[500px]">
                    <thead>
                      <tr className="border-b border-[#222222] bg-[#111111]/70 text-[#8A8A8A] font-bold uppercase text-[9px] tracking-wider">
                        <th className="px-4 py-3 text-left">System Permission Rule</th>
                        <th className="px-4 py-3 text-center">Manager</th>
                        <th className="px-4 py-3 text-center">Trainer</th>
                        <th className="px-4 py-3 text-center">Reception</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#222222]">
                      {permissions.map((p, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.01]">
                          <td className="px-4 py-3.5 font-medium text-[#CFCFCF]">{p.permission}</td>
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={p.manager}
                              onChange={() => togglePermission(idx, "manager")}
                              className="accent-[#E02020] cursor-pointer h-4 w-4"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={p.trainer}
                              onChange={() => togglePermission(idx, "trainer")}
                              className="accent-[#E02020] cursor-pointer h-4 w-4"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={p.reception}
                              onChange={() => togglePermission(idx, "reception")}
                              className="accent-[#E02020] cursor-pointer h-4 w-4"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-[#222222] flex justify-end">
                  <Button onClick={handleSavePermissions} className="bg-[#E02020] hover:bg-[#C41818] text-white font-bold uppercase tracking-wider text-xs px-6 h-11">
                    Save Permission Rules
                  </Button>
                </div>
              </motion.div>
            )}

            {activeTab === "danger" && (
              <motion.div
                key="danger"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">Danger Zone</h3>
                  <p className="text-[11px] text-[#8A8A8A] mt-0.5">Dangerous system cleanup and exporting commands. Restricted to Manager roles.</p>
                </div>

                <div className="space-y-6 pt-2">
                  {/* Export */}
                  <div className="rounded-xl border border-[#222222] bg-[#1C1C1C]/30 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                        <Download className="h-4 w-4 text-emerald-400" />
                        Full Database Backup Export
                      </div>
                      <div className="text-[11px] text-[#8A8A8A] leading-relaxed">Download a complete backup spreadsheet (.csv) containing all member details, registers, and transactions.</div>
                    </div>
                    <Button
                      onClick={handleExportData}
                      disabled={isExporting}
                      className="bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider h-10 px-4 flex items-center gap-2"
                    >
                      {isExporting ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" />
                          Export CSV
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Reset demo data */}
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                        <AlertTriangle className="h-4 w-4" />
                        Reset System Demo Database
                      </div>
                      <div className="text-[11px] text-[#8A8A8A] leading-relaxed">Wipes local storage keys and resets default profiles. Recommended for debugging/demo resets.</div>
                    </div>
                    <Button onClick={() => setShowResetModal(true)} className="bg-transparent hover:bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-wider h-10">
                      Reset Demo Data
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RESET CONFIRMATION MODAL */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-md rounded-xl border border-red-500/20 bg-[#111111] p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center gap-2.5 text-red-500">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-display text-lg uppercase font-bold tracking-wide">Confirm Demo Reset</h3>
              </div>
              <p className="text-xs text-[#CFCFCF] leading-relaxed">
                Are you absolutely sure you want to restore the system demo database? This will completely clear all local registers (member applications, biometric keys, invoices, and custom plans settings) and re-initialize demo credentials.
              </p>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowResetModal(false)} variant="outline" className="flex-1 border-[#222222] bg-transparent text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider h-10">
                  Cancel
                </Button>
                <Button onClick={handleResetDemoData} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider h-10">
                  Wipe & Reset
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminPageLayout>
  );
}
