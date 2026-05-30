import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { AdminPageLayout } from "@/components/layout/AdminPageLayout";
import {
  Fingerprint, Laptop, RefreshCw, Filter, Search, Check, AlertTriangle,
  Play, Settings, Calendar, Clock, CheckCircle2, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/biometric")({
  head: () => ({
    meta: [
      { title: "Biometric & Access Management — Staff Control Portal" },
    ],
  }),
  component: BiometricPage,
});

interface BiometricUser {
  fullName: string;
  memberId: string;
  mobile: string;
  biometric: "Registered" | "Not Set";
  lastUsed: string;
}

interface BiometricLog {
  id: string;
  time: string;
  name: string;
  memberId: string;
  direction: "Entry" | "Exit";
  status: "Success" | "Failed";
  attempts?: number;
}

function BiometricPage() {
  const [users, setUsers] = useState<BiometricUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Registered" | "Not Registered" | "Issues">("All");

  // Manual check-in form state
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [overrideDate, setOverrideDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [overrideTime, setOverrideTime] = useState("09:00 AM");
  const [overrideDirection, setOverrideDirection] = useState<"Entry" | "Exit">("Entry");
  const [overrideReason, setOverrideReason] = useState("");

  // Scan simulation modal
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [activeScanUser, setActiveScanUser] = useState<BiometricUser | null>(null);
  const [simulatingScan, setSimulatingScan] = useState(false);

  // Biometric Activity log state
  const [activityLogs, setActivityLogs] = useState<BiometricLog[]>([
    { id: "log-1", time: "06:14 AM", name: "Rahul Sharma", memberId: "IG-2024-0042", direction: "Entry", status: "Success" },
    { id: "log-2", time: "06:18 AM", name: "Priya Patel", memberId: "IG-2024-0071", direction: "Entry", status: "Success" },
    { id: "log-3", time: "06:45 AM", name: "Unknown User", memberId: "Unknown", direction: "Entry", status: "Failed", attempts: 3 },
    { id: "log-4", time: "07:52 AM", name: "Rahul Sharma", memberId: "IG-2024-0042", direction: "Exit", status: "Success" },
    { id: "log-5", time: "08:12 AM", name: "Kavya Nambiar", memberId: "IG-2024-0134", direction: "Entry", status: "Success" }
  ]);

  // Device settings states
  const [autoCheckoutHours, setAutoCheckoutHours] = useState("3 hours");
  const [gracePeriodAccess, setGracePeriodAccess] = useState(true);
  const [gateOpenTime, setGateOpenTime] = useState("05:00 AM");
  const [gateCloseTime, setGateCloseTime] = useState("11:00 PM");
  const [strangerAlertEnabled, setStrangerAlertEnabled] = useState(true);

  // Sync users and device parameters from localStorage
  useEffect(() => {
    const usersStr = localStorage.getItem("registered_users");
    if (usersStr) {
      try {
        const parsed = JSON.parse(usersStr);
        if (Array.isArray(parsed)) {
          const formatted: BiometricUser[] = parsed.map((u: any) => ({
            fullName: u.fullName || u.name,
            memberId: u.memberId || "IG-XXXX",
            mobile: u.mobile,
            biometric: u.biometric === "Registered" ? "Registered" : "Not Set",
            lastUsed: u.memberId === "IG-2024-0042" ? "Today 6:14 AM" :
                      u.memberId === "IG-2024-0071" ? "Yesterday" : "Never"
          }));
          setUsers(formatted);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load device settings
    const deviceSettingsStr = localStorage.getItem("zkteco_settings");
    if (deviceSettingsStr) {
      try {
        const settings = JSON.parse(deviceSettingsStr);
        setAutoCheckoutHours(settings.autoCheckoutHours || "3 hours");
        setGracePeriodAccess(settings.gracePeriodAccess ?? true);
        setGateOpenTime(settings.gateOpenTime || "05:00 AM");
        setGateCloseTime(settings.gateCloseTime || "11:00 PM");
        setStrangerAlertEnabled(settings.strangerAlertEnabled ?? true);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    const settings = {
      autoCheckoutHours,
      gracePeriodAccess,
      gateOpenTime,
      gateCloseTime,
      strangerAlertEnabled
    };
    localStorage.setItem("zkteco_settings", JSON.stringify(settings));
    toast.success("ZKTeco Device parameters updated successfully!");
  };

  const handleManualOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) {
      toast.error("Please select a gym member");
      return;
    }
    const member = users.find(u => u.memberId === selectedMemberId);
    if (!member) return;

    // Simulate appending to logs
    const newLog: BiometricLog = {
      id: `log-${Date.now()}`,
      time: overrideTime,
      name: member.fullName,
      memberId: member.memberId,
      direction: overrideDirection,
      status: "Success"
    };

    setActivityLogs(prev => [newLog, ...prev]);
    toast.success(`Override entry added for ${member.fullName} (${overrideDirection})!`);

    // Reset override fields
    setSelectedMemberId("");
    setOverrideReason("");
  };

  const triggerRegisterScan = (user: BiometricUser) => {
    setActiveScanUser(user);
    setScanModalOpen(true);
  };

  const handleSimulateScan = () => {
    if (!activeScanUser) return;
    setSimulatingScan(true);
    setTimeout(() => {
      // Complete simulation scan
      const updatedUsers = users.map(u => {
        if (u.memberId === activeScanUser.memberId) {
          return { ...u, biometric: "Registered" as const, lastUsed: "Today (Newly registered)" };
        }
        return u;
      });
      setUsers(updatedUsers);

      // Persist to registered_users
      const usersStr = localStorage.getItem("registered_users");
      if (usersStr) {
        try {
          const parsed = JSON.parse(usersStr);
          const idx = parsed.findIndex((u: any) => u.memberId === activeScanUser.memberId);
          if (idx !== -1) {
            parsed[idx].biometric = "Registered";
            localStorage.setItem("registered_users", JSON.stringify(parsed));
          }
        } catch (e) {
          console.error(e);
        }
      }

      setSimulatingScan(false);
      setScanModalOpen(false);
      toast.success(`Fingerprint registered successfully for ${activeScanUser.fullName}!`);
    }, 2000);
  };

  // Filter members list based on queries
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchQuery =
        u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.memberId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchFilter =
        filterType === "All" ||
        (filterType === "Registered" && u.biometric === "Registered") ||
        (filterType === "Not Registered" && u.biometric === "Not Set") ||
        (filterType === "Issues" && u.biometric === "Not Set" && u.lastUsed !== "Never");

      return matchQuery && matchFilter;
    });
  }, [users, searchQuery, filterType]);

  return (
    <AdminPageLayout>
      <div className="space-y-6">
        
        {/* Page Title Header */}
        <div>
          <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">Biometric & Access Control</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">Manage physical hardware parameters, fingerprint scans, and entrance logs.</p>
        </div>

        {/* Top Widgets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ZKTeco Hardware Monitor Card */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#8A8A8A] font-bold">Biometric Hardware</span>
                <h3 className="font-display text-lg font-bold text-white uppercase mt-1">ZKTeco SF300</h3>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6 text-xs text-[#8A8A8A]">
              <div>
                <span>Last Sync</span>
                <p className="text-white font-bold mt-0.5">2 mins ago</p>
              </div>
              <div>
                <span>Registered Passes</span>
                <p className="text-white font-bold mt-0.5">298 members</p>
              </div>
            </div>
          </div>

          {/* Settings Parameters Panel */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 md:col-span-2 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-[#222222]">
              <h3 className="font-display text-xs tracking-wider uppercase text-white font-bold flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#E02020]" />
                Device Gate Settings
              </h3>
              <Button
                onClick={handleSaveSettings}
                size="sm"
                className="bg-[#E02020] hover:bg-[#C41818] text-white h-7 text-[10px] font-bold uppercase tracking-wider"
              >
                Save Settings
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[#8A8A8A] text-[10px] uppercase font-bold tracking-wider">Auto-Checkout Limit</Label>
                <Input
                  value={autoCheckoutHours}
                  onChange={(e) => setAutoCheckoutHours(e.target.value)}
                  className="bg-[#111111] border-[#222222] text-xs h-9 text-white focus-visible:ring-[#E02020]"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[#8A8A8A] text-[10px] uppercase font-bold tracking-wider">Access Gate Hours</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={gateOpenTime}
                    onChange={(e) => setGateOpenTime(e.target.value)}
                    className="bg-[#111111] border-[#222222] text-xs h-9 text-white focus-visible:ring-[#E02020] px-2 text-center"
                  />
                  <span className="text-[#8A8A8A]">-</span>
                  <Input
                    value={gateCloseTime}
                    onChange={(e) => setGateCloseTime(e.target.value)}
                    className="bg-[#111111] border-[#222222] text-xs h-9 text-white focus-visible:ring-[#E02020] px-2 text-center"
                  />
                </div>
              </div>
              <div className="space-y-1.5 flex flex-col justify-end">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#222222] bg-[#111111]">
                  <span className="text-[#8A8A8A] text-[10px] uppercase font-bold tracking-wider">Stranger Alert</span>
                  <button
                    onClick={() => {
                      setStrangerAlertEnabled(!strangerAlertEnabled);
                      toast.info(`Stranger alerts toggled ${!strangerAlertEnabled ? "ON" : "OFF"}`);
                    }}
                    className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-colors",
                      strangerAlertEnabled ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-zinc-800 text-zinc-500"
                    )}
                  >
                    {strangerAlertEnabled ? "ENABLED" : "DISABLED"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Work Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Members Table section */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0A0A0A] border border-[#222222] rounded-xl p-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#555]" />
                <Input
                  placeholder="Search name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-[#111111] border-[#222222] h-9 text-xs focus-visible:ring-[#E02020] text-white"
                />
              </div>

              <div className="flex gap-1.5 flex-wrap">
                {(["All", "Registered", "Not Registered", "Issues"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors",
                      filterType === type
                        ? "bg-[#E02020] text-white"
                        : "text-[#8A8A8A] hover:bg-[#111111] hover:text-white"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left border-collapse text-xs text-[#CFCFCF]">
                  <thead>
                    <tr className="border-b border-[#1A1A1A] bg-[#0A0A0A] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
                      <th className="px-6 py-3.5">Member Name</th>
                      <th className="px-6 py-3.5">ID</th>
                      <th className="px-6 py-3.5">Biometric status</th>
                      <th className="px-6 py-3.5">Last Checkin</th>
                      <th className="px-6 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]">
                    {filteredUsers.map((m) => (
                      <tr key={m.memberId} className="hover:bg-[#111111]/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-white">{m.fullName}</td>
                        <td className="px-6 py-4 font-mono">{m.memberId}</td>
                        <td className="px-6 py-4">
                          {m.biometric === "Registered" ? (
                            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                              <span className="h-1 w-1 bg-emerald-400 rounded-full" />
                              ✅ Registered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-red-400 font-semibold bg-red-500/5 px-2 py-0.5 rounded border border-red-500/10">
                              <span className="h-1 w-1 bg-red-400 rounded-full" />
                              ❌ Not Set
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-[#8A8A8A]">{m.lastUsed}</td>
                        <td className="px-6 py-4 text-right">
                          {m.biometric === "Registered" ? (
                            <button
                              onClick={() => triggerRegisterScan(m)}
                              className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline uppercase tracking-wider"
                            >
                              Re-register
                            </button>
                          ) : (
                            <button
                              onClick={() => triggerRegisterScan(m)}
                              className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 hover:underline uppercase tracking-wider"
                            >
                              Register Now
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-[#555] text-xs">
                          No matching member access logs.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Form and Override Sidebar panels */}
          <div className="space-y-6">
            
            {/* Manual checkin form panel */}
            <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
              <div>
                <h3 className="font-display text-sm tracking-wider uppercase text-white font-bold flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-[#E02020]" />
                  Attendance Override
                </h3>
                <p className="text-[10px] text-[#8A8A8A] mt-0.5">Force gate override or add manual exit logs.</p>
              </div>

              <form onSubmit={handleManualOverride} className="space-y-3.5 text-xs">
                <div className="space-y-1.5">
                  <Label className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider">Select Member</Label>
                  <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                    <SelectTrigger className="bg-[#111111] border-[#222222] h-9 text-xs focus:ring-[#E02020]">
                      <SelectValue placeholder="Select member..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#222222] text-xs text-white">
                      {users.map(u => (
                        <SelectItem key={u.memberId} value={u.memberId}>
                          {u.fullName} ({u.memberId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider">Log Date</Label>
                    <Input
                      type="date"
                      value={overrideDate}
                      onChange={(e) => setOverrideDate(e.target.value)}
                      className="bg-[#111111] border-[#222222] text-xs h-9 focus-visible:ring-[#E02020]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider">Log Time</Label>
                    <Input
                      placeholder="e.g. 09:00 AM"
                      value={overrideTime}
                      onChange={(e) => setOverrideTime(e.target.value)}
                      className="bg-[#111111] border-[#222222] text-xs h-9 focus-visible:ring-[#E02020]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider">Gate Direction</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOverrideDirection("Entry")}
                      className={cn(
                        "py-2 rounded-lg font-bold text-[10px] uppercase border transition-colors",
                        overrideDirection === "Entry"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-transparent text-[#8A8A8A] border-[#222222] hover:bg-[#111111]"
                      )}
                    >
                      Entry Gate
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverrideDirection("Exit")}
                      className={cn(
                        "py-2 rounded-lg font-bold text-[10px] uppercase border transition-colors",
                        overrideDirection === "Exit"
                          ? "bg-[#E02020]/10 text-red-400 border-[#E02020]/30"
                          : "bg-transparent text-[#8A8A8A] border-[#222222] hover:bg-[#111111]"
                      )}
                    >
                      Exit Gate
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider">Reason Override</Label>
                  <Input
                    placeholder="e.g. Card check failed / Staff request"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    className="bg-[#111111] border-[#222222] text-xs h-9 focus-visible:ring-[#E02020]"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-10 uppercase tracking-wide text-xs"
                >
                  Save Entry Override
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom logs segment */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-base tracking-wider uppercase text-white font-bold">Biometric Activity Logs</h3>
              <p className="text-[10px] text-[#8A8A8A] mt-0.5">Real-time scan checkins recorded at the front gate device reader.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px] text-left border-collapse text-xs text-[#CFCFCF]">
              <thead>
                <tr className="border-b border-[#1A1A1A] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
                  <th className="px-6 py-3">Scan Time</th>
                  <th className="px-6 py-3">Member name</th>
                  <th className="px-6 py-3">Direction</th>
                  <th className="px-6 py-3">Scan Result Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {activityLogs.map((l) => (
                  <tr
                    key={l.id}
                    className={cn(
                      "hover:bg-[#111111]/30 transition-colors",
                      l.status === "Failed" ? "bg-red-500/[0.02]" : ""
                    )}
                  >
                    <td className="px-6 py-3.5 font-mono">{l.time}</td>
                    <td className="px-6 py-3.5 font-semibold text-white">
                      {l.memberId === "Unknown" ? (
                        <span className="text-red-400 font-bold uppercase tracking-wider text-[10px]">Stranger / Unknown</span>
                      ) : (
                        <span>{l.name}</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 uppercase font-mono tracking-wider">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-bold border",
                        l.direction === "Entry" ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10" : "bg-rose-500/5 text-rose-400 border-rose-500/10"
                      )}>
                        {l.direction}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      {l.status === "Success" ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <Check className="h-4.5 w-4.5 text-emerald-400" />
                          ✅ Access Granted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-red-400 font-semibold">
                          <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
                          ❌ Access Refused (Failed attempts: {l.attempts})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-[#1A1A1A] flex justify-between items-center text-[10px] text-[#8A8A8A]">
            <span>Showing {activityLogs.length} recent entry logs</span>
            <button className="text-white hover:underline uppercase font-bold tracking-wider cursor-pointer">
              View Full Log →
            </button>
          </div>
        </div>

      </div>

      {/* Simulator Modal for Biometrics */}
      {scanModalOpen && activeScanUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-[#111111] border border-[#222222] p-6 shadow-2xl space-y-6 text-center">
            <div className="mx-auto h-16 w-16 rounded-full bg-[#E02020]/10 border border-[#E02020]/30 flex items-center justify-center animate-pulse text-[#E02020]">
              <Fingerprint className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">ZKTeco Terminal Simulator</span>
              <h3 className="font-display text-xl uppercase font-bold text-white leading-tight">Biometric Fingerprint Setup</h3>
              <p className="text-xs text-[#8A8A8A] leading-relaxed">
                Ask <strong className="text-white">{activeScanUser.fullName}</strong> to place their right index finger on the biometric scanner.
              </p>
            </div>

            <div className="bg-[#0A0A0A] border border-[#222222] rounded-xl p-4 text-xs font-mono text-[#8A8A8A]">
              Device Status: <span className="text-emerald-400 font-bold">READY TO CAPTURE</span>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleSimulateScan}
                disabled={simulatingScan}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 text-white font-bold h-10 uppercase tracking-wide text-xs flex items-center justify-center gap-2"
              >
                {simulatingScan ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Scanning Finger...
                  </>
                ) : (
                  <>
                    <Play className="h-4.5 w-4.5" />
                    Simulate Fingerprint Scan
                  </>
                )}
              </Button>
              <Button
                onClick={() => setScanModalOpen(false)}
                variant="ghost"
                className="w-full text-[#8A8A8A] hover:text-white uppercase tracking-wider text-[10px] font-bold h-9"
              >
                Cancel Registration
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminPageLayout>
  );
}
