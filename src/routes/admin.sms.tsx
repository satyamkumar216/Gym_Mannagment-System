import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { AdminPageLayout } from "@/components/layout/AdminPageLayout";
import {
  MessageSquare, Send, Calendar, Clock, RefreshCw, Eye, Smartphone, CheckCircle, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/sms")({
  head: () => ({
    meta: [
      { title: "Bulk SMS Broadcasts — Staff Control Portal" },
    ],
  }),
  component: SmsPage,
});

interface SmsLog {
  id: string;
  date: string;
  message: string;
  recipients: number;
  delivered: number;
  failed: number;
  status: "Sent" | "Scheduled" | "Failed";
}

function SmsPage() {
  const [targetAudience, setTargetAudience] = useState<"all" | "active" | "expired" | "grace" | "expiring" | "custom">("all");
  const [selectedTemplate, setSelectedTemplate] = useState("reminder");
  const [messageText, setMessageText] = useState("Hi [Name], your IronForge membership expires on [Date]. Renew now at ironforge.in/login. Call: 98765 43210");
  const [scheduleOption, setScheduleOption] = useState<"now" | "later">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const [historyLogs, setHistoryLogs] = useState<SmsLog[]>([
    {
      id: "sms-1",
      date: "28 May 2026, 09:30 AM",
      message: "Maintenance closure notification: Gym closed Sunday June 1st for monthly sanitation deep clean...",
      recipients: 298,
      delivered: 295,
      failed: 3,
      status: "Sent"
    },
    {
      id: "sms-2",
      date: "20 May 2026, 11:15 AM",
      message: "Hi Rahul Sharma, your payment of ₹3,999 has been verified. Check your digital GST invoice online at ironforge.in/dashboard.",
      recipients: 1,
      delivered: 1,
      failed: 0,
      status: "Sent"
    }
  ]);

  // Recipient Count Calculator based on localStorage database
  const recipientCount = useMemo(() => {
    const usersStr = localStorage.getItem("registered_users");
    if (!usersStr) return 0;
    try {
      const users = JSON.parse(usersStr);
      if (!Array.isArray(users)) return 0;

      if (targetAudience === "all") return users.length;
      if (targetAudience === "active") return users.filter((u: any) => u.status === "Active").length;
      if (targetAudience === "expired") return users.filter((u: any) => u.status === "Expired" || u.status === "Membership Expired").length;
      if (targetAudience === "grace") {
        // Expired but <= 7 days ago
        let count = 0;
        const today = new Date();
        today.setHours(0,0,0,0);
        users.forEach((u: any) => {
          if (!u.expiry) return;
          const exp = new Date(u.expiry);
          if (isNaN(exp.getTime())) return;
          const diff = today.getTime() - exp.getTime();
          const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
          if (days > 0 && days <= 7) count++;
        });
        return count === 0 ? 1 : count; // Default to Kavya
      }
      if (targetAudience === "expiring") return users.filter((u: any) => u.status === "Expiring").length;
      if (targetAudience === "custom") return 12; // Placeholder
    } catch (e) {
      console.error(e);
    }
    return 47;
  }, [targetAudience]);

  // Handle template selection updates
  useEffect(() => {
    if (selectedTemplate === "reminder") {
      setMessageText("Hi [Name], your IronForge membership expires on [Date]. Renew now at ironforge.in/login. Call: 98765 43210");
    } else if (selectedTemplate === "payment") {
      setMessageText("Thank you [Name]! We have received your payment of ₹[Amount] on [Date]. Your invoice is now generated.");
    } else if (selectedTemplate === "announcement") {
      setMessageText("IronForge Gym Alert: We are upgrading the facility on [Date]. Workouts will be temporarily suspended from 10 AM to 4 PM.");
    } else if (selectedTemplate === "custom") {
      setMessageText("");
    }
  }, [selectedTemplate]);

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) {
      toast.error("Message content cannot be blank");
      return;
    }

    const todayStr = new Date().toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    const newLog: SmsLog = {
      id: `sms-${Date.now()}`,
      date: scheduleOption === "later" ? `${scheduleDate}, ${scheduleTime}` : todayStr,
      message: messageText,
      recipients: recipientCount,
      delivered: scheduleOption === "later" ? 0 : recipientCount,
      failed: 0,
      status: scheduleOption === "later" ? "Scheduled" : "Sent"
    };

    setHistoryLogs(prev => [newLog, ...prev]);

    if (scheduleOption === "later") {
      toast.success(`SMS broadcast scheduled for ${scheduleDate} at ${scheduleTime}!`);
    } else {
      toast.success(`SMS broadcast sent successfully to ${recipientCount} recipients!`);
    }

    // Reset composer text
    setSelectedTemplate("custom");
    setMessageText("");
  };

  return (
    <AdminPageLayout>
      <div className="space-y-6">
        
        {/* Title Info */}
        <div>
          <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">Bulk SMS Broadcasts</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">Compose message reminders and broadcast mobile announcements to members.</p>
        </div>

        {/* Composer section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Form Composer (col-span-8) */}
          <div className="lg:col-span-7 rounded-xl border border-[#222222] bg-[#0A0A0A] p-6 space-y-5">
            <div>
              <h3 className="font-display text-sm tracking-wider uppercase text-white font-bold flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-[#E02020]" />
                Write Message
              </h3>
              <p className="text-[10px] text-[#8A8A8A] mt-0.5">Customize fields and choose your target audience.</p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Target selector */}
                <div className="space-y-1.5">
                  <Label className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider">Target Members</Label>
                  <Select value={targetAudience} onValueChange={(val: any) => setTargetAudience(val)}>
                    <SelectTrigger className="bg-[#111111] border-[#222222] h-9 text-xs focus:ring-[#E02020]">
                      <SelectValue placeholder="Target selection..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#222222] text-xs text-white">
                      <SelectItem value="all">All Members ({recipientCount})</SelectItem>
                      <SelectItem value="active">Active Members ({recipientCount})</SelectItem>
                      <SelectItem value="expired">Expired Members ({recipientCount})</SelectItem>
                      <SelectItem value="grace">Members in Grace Period ({recipientCount})</SelectItem>
                      <SelectItem value="expiring">Members Expiring this week ({recipientCount})</SelectItem>
                      <SelectItem value="custom">Custom Selector List</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Template Selector */}
                <div className="space-y-1.5">
                  <Label className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider">Message Template</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="bg-[#111111] border-[#222222] h-9 text-xs focus:ring-[#E02020]">
                      <SelectValue placeholder="Select template..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111111] border-[#222222] text-xs text-white">
                      <SelectItem value="reminder">Renewal Reminder</SelectItem>
                      <SelectItem value="payment">Payment Confirmation</SelectItem>
                      <SelectItem value="announcement">Gym Announcement</SelectItem>
                      <SelectItem value="custom">Custom Blank Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* Text composer text-area */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <Label className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider">Message Content</Label>
                  <span className={cn(
                    "text-[9px] font-bold font-mono px-1 rounded",
                    messageText.length > 160 ? "bg-red-500/10 text-red-500" : "text-[#8A8A8A]"
                  )}>
                    {messageText.length} / 160 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={160}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full bg-[#111111] border border-[#222222] rounded-lg p-3 text-xs text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#E02020] leading-relaxed resize-none"
                  placeholder="Enter message details here..."
                />
              </div>

              {/* Schedule options */}
              <div className="space-y-2">
                <Label className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider">Schedule Options</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setScheduleOption("now")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-colors",
                      scheduleOption === "now" ? "bg-zinc-800 text-white border-zinc-700" : "bg-transparent text-[#8A8A8A] border-[#222222] hover:bg-[#111111]"
                    )}
                  >
                    Send Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setScheduleOption("later")}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-colors",
                      scheduleOption === "later" ? "bg-zinc-800 text-white border-zinc-700" : "bg-transparent text-[#8A8A8A] border-[#222222] hover:bg-[#111111]"
                    )}
                  >
                    Schedule for later
                  </button>
                </div>

                {scheduleOption === "later" && (
                  <div className="grid grid-cols-2 gap-3 mt-2 animate-in slide-in-from-top duration-200">
                    <div className="space-y-1">
                      <Label className="text-[#8A8A8A] text-[9px] uppercase tracking-wider">Date</Label>
                      <Input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        className="bg-[#111111] border-[#222222] h-9 text-xs text-white focus-visible:ring-[#E02020]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[#8A8A8A] text-[9px] uppercase tracking-wider">Time</Label>
                      <Input
                        placeholder="e.g. 10:00 AM"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="bg-[#111111] border-[#222222] h-9 text-xs text-white focus-visible:ring-[#E02020]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit panel */}
              <div className="pt-2 flex justify-between items-center border-t border-[#222222]">
                <span className="text-[10px] text-[#8A8A8A]">
                  Will be broadcasted to <strong className="text-white">{recipientCount} members</strong>.
                </span>
                <Button
                  type="submit"
                  disabled={messageText.length === 0}
                  className="bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-10 px-5 uppercase text-xs tracking-wider flex items-center gap-2"
                >
                  <Send className="h-3.5 w-3.5" />
                  {scheduleOption === "now" ? "Dispatch SMS Now" : "Schedule SMS"}
                </Button>
              </div>
            </form>
          </div>

          {/* Smartphone Simulator Preview Pane (col-span-4) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <span className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider mb-2 flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-[#E02020]" />
              Real-time Mobile Preview
            </span>
            <div className="w-[280px] h-[520px] rounded-[38px] border-[8px] border-[#222] bg-[#000] shadow-2xl relative p-4 flex flex-col justify-between overflow-hidden">
              
              {/* Speaker & notch */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-28 h-5 rounded-full bg-[#111] flex justify-center items-center">
                <div className="w-10 h-1 rounded bg-[#222]" />
              </div>

              {/* Status bar */}
              <div className="flex justify-between px-4 pt-1.5 text-[8px] text-[#A2A2A2] font-semibold tracking-wide select-none">
                <span>9:41</span>
                <div className="flex gap-1.5">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Chat thread box */}
              <div className="flex-1 mt-6 flex flex-col justify-start px-2 space-y-4">
                
                {/* Contact header */}
                <div className="text-center pb-2 border-b border-[#222]/30 flex flex-col items-center">
                  <div className="h-7 w-7 rounded-full bg-[#E02020]/15 flex items-center justify-center text-[10px] font-bold text-[#E02020]">
                    IF
                  </div>
                  <span className="text-[9px] text-[#CFCFCF] font-bold mt-1">IronForge Gym</span>
                </div>

                {/* SMS Bubble */}
                <div className="flex flex-col items-start max-w-[85%] self-start space-y-0.5">
                  <div className="rounded-2xl rounded-tl-none bg-[#262626] border border-[#333] px-3.5 py-2.5 text-[10px] leading-relaxed text-[#ECECEC] break-words">
                    {messageText.trim() ? (
                      messageText
                        .replace("[Name]", "Rahul")
                        .replace("[Date]", "15 Aug 2025")
                        .replace("[Amount]", "3,999")
                    ) : (
                      <span className="text-[#555] italic">Start typing your message to preview...</span>
                    )}
                  </div>
                  <span className="text-[7px] text-[#555] ml-1">Today 9:41 AM · SMS</span>
                </div>

              </div>

              {/* Home indicator bar */}
              <div className="w-20 h-1 bg-[#444] rounded-full mx-auto self-end mt-2" />
            </div>
          </div>

        </div>

        {/* SMS logs database */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-6 space-y-4">
          <div>
            <h3 className="font-display text-base tracking-wider uppercase text-white font-bold">SMS Log Ledger</h3>
            <p className="text-[10px] text-[#8A8A8A] mt-0.5">Review previously broadcasted text messages and scheduling statuses.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left border-collapse text-xs text-[#CFCFCF]">
              <thead>
                <tr className="border-b border-[#1A1A1A] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
                  <th className="px-6 py-3.5">Log Date-time</th>
                  <th className="px-6 py-3.5">Message text snippet</th>
                  <th className="px-6 py-3.5">Recipients</th>
                  <th className="px-6 py-3.5">Delivered</th>
                  <th className="px-6 py-3.5">Failed</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {historyLogs.map((h) => (
                  <tr key={h.id} className="hover:bg-[#111111]/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-[10px] text-[#8A8A8A]">{h.date}</td>
                    <td className="px-6 py-4 max-w-sm truncate text-white font-medium">{h.message}</td>
                    <td className="px-6 py-4 text-center font-bold">{h.recipients}</td>
                    <td className="px-6 py-4 text-center text-emerald-400 font-bold">{h.delivered}</td>
                    <td className="px-6 py-4 text-center text-red-400 font-bold">{h.failed}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-bold border tracking-wider",
                        h.status === "Sent" ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10" :
                        h.status === "Scheduled" ? "bg-blue-500/5 text-blue-400 border-blue-500/10" : "bg-red-500/5 text-red-400 border-red-500/10"
                      )}>
                        {h.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </AdminPageLayout>
  );
}
