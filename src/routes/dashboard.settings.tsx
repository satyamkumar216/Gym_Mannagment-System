import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  ArrowLeft, User, Bell, Shield, Smartphone, Mail, Lock, Trash2,
  Globe, Moon, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Dumbbell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({
    meta: [
      { title: "Member Settings — IronForge Gym" },
      { name: "description", content: "Manage your member profile settings, security password, notification preferences, and privacy rules." },
    ],
  }),
  component: SettingsPage,
});

type SettingsTab = "account" | "notifications" | "privacy" | "app";

function SettingsPage() {
  const navigate = useNavigate();
  const [member, setMember] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  // Account states
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [newPendingPhone, setNewPendingPhone] = useState("");
  
  // Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Deletion modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Switch states
  const [smsReminders, setSmsReminders] = useState(true);
  const [emailReminders, setEmailReminders] = useState(true);
  const [renewalReminderDays, setRenewalReminderDays] = useState(7);
  const [gymAnnouncements, setGymAnnouncements] = useState(true);
  const [achievementAlerts, setAchievementAlerts] = useState(false);

  // Privacy states
  const [showProfileToTrainers, setShowProfileToTrainers] = useState(true);
  const [allowPhotoPromotions, setAllowPhotoPromotions] = useState(false);
  const [aadhaarVisibility, setAadhaarVisibility] = useState("masked");

  // App states
  const [language, setLanguage] = useState("English");
  const [isClearingCache, setIsClearingCache] = useState(false);

  // Load from localStorage
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
        setEmail(data.email || "");
        setPhone(data.phone || "");

        // Load custom settings if any
        if (data.settings) {
          setSmsReminders(data.settings.smsReminders ?? true);
          setEmailReminders(data.settings.emailReminders ?? true);
          setRenewalReminderDays(data.settings.renewalReminderDays ?? 7);
          setGymAnnouncements(data.settings.gymAnnouncements ?? true);
          setAchievementAlerts(data.settings.achievementAlerts ?? false);
          setShowProfileToTrainers(data.settings.showProfileToTrainers ?? true);
          setAllowPhotoPromotions(data.settings.allowPhotoPromotions ?? false);
          setAadhaarVisibility(data.settings.aadhaarVisibility ?? "masked");
          setLanguage(data.settings.language ?? "English");
        }
      } catch {}
    }
  }, [navigate]);

  const saveSettings = (updatedFields: any) => {
    if (!member) return;
    const updatedSettings = {
      smsReminders,
      emailReminders,
      renewalReminderDays,
      gymAnnouncements,
      achievementAlerts,
      showProfileToTrainers,
      allowPhotoPromotions,
      aadhaarVisibility,
      language,
      ...updatedFields.settings
    };

    const updatedMember = {
      ...member,
      ...updatedFields,
      settings: updatedSettings
    };

    setMember(updatedMember);
    localStorage.setItem("logged_in_member", JSON.stringify(updatedMember));
    
    // Sync back to registered_users
    const usersStr = localStorage.getItem("registered_users");
    if (usersStr && member.memberId) {
      try {
        const users = JSON.parse(usersStr);
        const idx = users.findIndex((u: any) => u.memberId === member.memberId);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...updatedMember };
          localStorage.setItem("registered_users", JSON.stringify(users));
        }
      } catch {}
    }
  };

  const handleUpdateEmail = () => {
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    saveSettings({ email });
    toast.success("Email address updated successfully!");
  };

  const handleSendOtp = () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    setNewPendingPhone(phone);
    setShowOtpModal(true);
    toast.success("OTP sent to " + phone + " (Demo code is 1997)");
  };

  const handleVerifyOtp = () => {
    if (otpCode === "1997") {
      saveSettings({ phone: newPendingPhone });
      setShowOtpModal(false);
      setOtpCode("");
      toast.success("Mobile number verified & updated!");
    } else {
      toast.error("Invalid OTP code. Please enter 1997 to verify.");
    }
  };

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }
    // Verify old password (mock check against 'password' or actual password if present)
    const currentPass = member?.password || "password";
    if (oldPassword !== currentPass) {
      toast.error("Incorrect current password.");
      return;
    }

    saveSettings({ password: newPassword });
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password updated successfully!");
  };

  const handleDeleteRequest = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      setShowDeleteModal(false);
      toast.success("Account deletion request submitted. Staff will contact you.");
    }, 2000);
  };

  const handleClearCache = () => {
    setIsClearingCache(true);
    setTimeout(() => {
      setIsClearingCache(false);
      toast.success("Application cache cleared successfully!");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Header bar */}
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
            <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/15">
              Member Settings
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 pb-24 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1">
          {[
            { id: "account", label: "Account", icon: User },
            { id: "notifications", label: "Notifications", icon: Bell },
            { id: "privacy", label: "Privacy & Data", icon: Shield },
            { id: "app", label: "App Settings", icon: Globe }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-semibold uppercase tracking-wider text-left transition-colors cursor-pointer select-none min-h-[44px]",
                  active
                    ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                    : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Content Area */}
        <div className="md:col-span-3 bg-[#111111] border border-[#222222] rounded-xl p-6 sm:p-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "account" && (
              <motion.div
                key="account"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-display text-xl tracking-wide uppercase text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-[#E02020]" />
                    Account Settings
                  </h2>
                  <p className="text-xs text-[#8A8A8A] mt-1">Manage email contact details and login authentication credentials.</p>
                </div>

                {/* Contact updates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email contact */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Email Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] text-sm h-11"
                        placeholder="email@example.com"
                      />
                      <Button onClick={handleUpdateEmail} className="bg-white/5 border border-white/10 text-white hover:bg-white/10 shrink-0 h-11 px-4 text-xs font-bold uppercase tracking-wider">
                        Update
                      </Button>
                    </div>
                  </div>

                  {/* Phone contact */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider text-[#8A8A8A]">Mobile Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] text-sm h-11"
                        placeholder="Enter 10-digit number"
                      />
                      <Button onClick={handleSendOtp} className="bg-white/5 border border-white/10 text-white hover:bg-white/10 shrink-0 h-11 px-4 text-xs font-bold uppercase tracking-wider">
                        Change
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Password changes */}
                <div className="border-t border-[#222222] pt-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#E02020]" />
                    Change Password
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="oldPass" className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Current Password</Label>
                      <Input
                        id="oldPass"
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] text-xs h-10"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="newPass" className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">New Password</Label>
                      <Input
                        id="newPass"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] text-xs h-10"
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPass" className="text-[10px] font-bold uppercase tracking-wider text-[#8A8A8A]">Confirm New Password</Label>
                      <Input
                        id="confirmPass"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-black/40 border-[#222222] focus-visible:ring-[#E02020] text-xs h-10"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <Button onClick={handleChangePassword} className="bg-[#E02020] hover:bg-[#C41818] text-white font-bold uppercase tracking-wider text-xs px-5 h-10 mt-2">
                    Update Password
                  </Button>
                </div>

                {/* Account termination */}
                <div className="border-t border-red-950/20 pt-6">
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1.5">
                        <Trash2 className="h-4 w-4" />
                        Danger Zone: Delete Account
                      </h4>
                      <p className="text-[11px] text-[#8A8A8A]">Request account termination. This will discard all membership history data permanently.</p>
                    </div>
                    <Button onClick={() => setShowDeleteModal(true)} className="bg-transparent hover:bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-wider h-10">
                      Request Deletion
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-display text-xl tracking-wide uppercase text-white flex items-center gap-2">
                    <Bell className="h-5 w-5 text-[#E02020]" />
                    Notifications
                  </h2>
                  <p className="text-xs text-[#8A8A8A] mt-1">Configure subscription alerts, announcements, and metrics updates.</p>
                </div>

                <div className="space-y-4 pt-2">
                  <ToggleItem
                    label="SMS Reminders"
                    desc="Receive alerts regarding upcoming dues and pending checks on your registered phone."
                    checked={smsReminders}
                    onChange={(v) => { setSmsReminders(v); saveSettings({ settings: { smsReminders: v } }); }}
                  />

                  <ToggleItem
                    label="Email Notifications"
                    desc="Weekly statistics overview receipts and account updates delivered to your inbox."
                    checked={emailReminders}
                    onChange={(v) => { setEmailReminders(v); saveSettings({ settings: { emailReminders: v } }); }}
                  />

                  {/* Number field */}
                  <div className="flex items-center justify-between py-3.5 border-b border-[#222222]/40 gap-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white">Renewal Reminders Alert Threshold</div>
                      <div className="text-[11px] text-[#8A8A8A]">Days notice sent ahead of standard membership expiry.</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={renewalReminderDays}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(30, parseInt(e.target.value) || 7));
                          setRenewalReminderDays(val);
                          saveSettings({ settings: { renewalReminderDays: val } });
                        }}
                        className="bg-black/60 border border-[#222222] focus:border-[#E02020] text-center w-16 h-9 rounded text-xs text-white font-bold outline-none"
                      />
                      <span className="text-xs text-[#8A8A8A]">days</span>
                    </div>
                  </div>

                  <ToggleItem
                    label="Gym Announcements"
                    desc="Receive news notifications for schedule changes, special operations hours, or closures."
                    checked={gymAnnouncements}
                    onChange={(v) => { setGymAnnouncements(v); saveSettings({ settings: { gymAnnouncements: v } }); }}
                  />

                  <ToggleItem
                    label="Achievement Alerts"
                    desc="Congratulatory highlights for goals achieved, attendance consistency milestones, and check-in streaks."
                    checked={achievementAlerts}
                    onChange={(v) => { setAchievementAlerts(v); saveSettings({ settings: { achievementAlerts: v } }); }}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "privacy" && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="font-display text-xl tracking-wide uppercase text-white flex items-center gap-2">
                    <Shield className="h-5 w-5 text-[#E02020]" />
                    Privacy Settings
                  </h2>
                  <p className="text-xs text-[#8A8A8A] mt-1">Control profile privacy and visibility across trainers and gym media.</p>
                </div>

                <div className="space-y-4 pt-2">
                  <ToggleItem
                    label="Share Profile with Trainers"
                    desc="Allow certified coaches to view biometric history records, attendance charts, and plan limits."
                    checked={showProfileToTrainers}
                    onChange={(v) => { setShowProfileToTrainers(v); saveSettings({ settings: { showProfileToTrainers: v } }); }}
                  />

                  <ToggleItem
                    label="Marketing Media Authorization"
                    desc="Allow IronForge Gym to feature your workouts or portrait photos in public newsletters or marketing promotions."
                    checked={allowPhotoPromotions}
                    onChange={(v) => { setAllowPhotoPromotions(v); saveSettings({ settings: { allowPhotoPromotions: v } }); }}
                  />

                  {/* Select dropdown */}
                  <div className="flex items-center justify-between py-3.5 border-b border-[#222222]/40 gap-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white">Aadhaar Identification Visibility</div>
                      <div className="text-[11px] text-[#8A8A8A]">Choose how your verification identity number is presented in settings.</div>
                    </div>
                    <select
                      value={aadhaarVisibility}
                      onChange={(e) => {
                        setAadhaarVisibility(e.target.value);
                        saveSettings({ settings: { aadhaarVisibility: e.target.value } });
                      }}
                      className="bg-black/60 border border-[#222222] focus:border-[#E02020] text-xs h-9 px-3 rounded text-white outline-none font-medium cursor-pointer"
                    >
                      <option value="masked">Show Masked (•••• 1234)</option>
                      <option value="hidden">Hide Completely</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "app" && (
              <motion.div
                key="app"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-display text-xl tracking-wide uppercase text-white flex items-center gap-2">
                    <Globe className="h-5 w-5 text-[#E02020]" />
                    App Preferences
                  </h2>
                  <p className="text-xs text-[#8A8A8A] mt-1">Configure language localizations, system theme triggers, and storage settings.</p>
                </div>

                <div className="space-y-5">
                  {/* Language dropdown */}
                  <div className="flex items-center justify-between py-3.5 border-b border-[#222222]/40 gap-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white">Display Language</div>
                      <div className="text-[11px] text-[#8A8A8A]">Customize text localization strings displayed across standard menus.</div>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value);
                        saveSettings({ settings: { language: e.target.value } });
                        toast.success("Localization changed to " + e.target.value);
                      }}
                      className="bg-black/60 border border-[#222222] focus:border-[#E02020] text-xs h-9 px-3 rounded text-white outline-none font-medium cursor-pointer"
                    >
                      <option value="English">English</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                      <option value="Hindi">Hindi (हिन्दी)</option>
                    </select>
                  </div>

                  {/* Theme toggles (LOCKED) */}
                  <div className="flex items-center justify-between py-3.5 border-b border-[#222222]/40 gap-4 opacity-50">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                        <Moon className="h-3.5 w-3.5 text-indigo-400" />
                        Application Theme
                      </div>
                      <div className="text-[10px] text-[#8A8A8A]">Dark theme is locked to match IronForge branding requirements.</div>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-white">
                      Dark Only
                    </span>
                  </div>

                  {/* Clear Cache */}
                  <div className="flex items-center justify-between py-3.5 gap-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-white">Temporary Cache Cleanup</div>
                      <div className="text-[11px] text-[#8A8A8A]">Clear local UI state, cache files, and refresh icons database.</div>
                    </div>
                    <Button
                      onClick={handleClearCache}
                      disabled={isClearingCache}
                      className="bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-wider h-10 px-4 flex items-center gap-2"
                    >
                      {isClearingCache ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Clearing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3.5 w-3.5" />
                          Clear Cache
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* OTP MODAL */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOtpModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="relative w-full max-w-sm rounded-xl border border-[#222222] bg-[#111111] p-6 shadow-2xl z-10 space-y-4"
            >
              <div className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5 text-[#E02020]" />
                <h3 className="font-display text-lg uppercase font-bold tracking-wide">Enter OTP Code</h3>
              </div>
              <p className="text-xs text-[#8A8A8A]">
                We have sent an authentication verification code to <strong>{newPendingPhone}</strong>. (Demo OTP is <strong>1997</strong>).
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-[9px] font-bold uppercase tracking-wider text-[#8A8A8A]">OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={4}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="bg-black/60 border-[#222222] text-center tracking-[0.5em] text-lg font-bold font-mono focus-visible:ring-[#E02020] h-12"
                  placeholder="0000"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowOtpModal(false)} variant="outline" className="flex-1 border-[#222222] bg-transparent text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider h-10">
                  Cancel
                </Button>
                <Button onClick={handleVerifyOtp} className="flex-1 bg-[#E02020] hover:bg-[#C41818] text-white text-xs font-bold uppercase tracking-wider h-10">
                  Verify OTP
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE ACCOUNT MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
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
                <h3 className="font-display text-lg uppercase font-bold tracking-wide">Confirm Deletion Request</h3>
              </div>
              <p className="text-xs text-[#CFCFCF] leading-relaxed">
                You are requesting the permanent deletion of member account <strong>{member?.name}</strong> ({member?.memberId}). 
                This will submit a termination request to the staff. Your digital biometric keys, invoice records, and check-in history will be cleared. This action cannot be reversed.
              </p>
              <div className="flex gap-3 pt-2">
                <Button onClick={() => setShowDeleteModal(false)} disabled={isDeleting} variant="outline" className="flex-1 border-[#222222] bg-transparent text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider h-10">
                  Cancel
                </Button>
                <Button onClick={handleDeleteRequest} disabled={isDeleting} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider h-10">
                  {isDeleting ? "Submitting..." : "Confirm Request"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Custom Toggle Item Row
function ToggleItem({ label, desc, checked, onChange, disabled = false }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className="flex items-start justify-between py-3.5 border-b border-[#222222]/40 gap-4">
      <div className="space-y-0.5">
        <div className="text-xs font-semibold text-white">{label}</div>
        <div className="text-[11px] text-[#8A8A8A] leading-relaxed max-w-md">{desc}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// Premium sliding toggle switch
function Toggle({ checked, onChange, disabled = false }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-[#E02020] focus:ring-offset-1 focus:ring-offset-black",
        checked ? "bg-[#E02020]" : "bg-[#222222]",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-4.5" : "translate-x-0"
        )}
      />
    </button>
  );
}
