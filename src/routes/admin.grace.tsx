import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { AdminPageLayout } from "@/components/layout/AdminPageLayout";
import {
  Clock, Settings, Users, PhoneCall, AlertTriangle, ShieldCheck, Mail, RefreshCw, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/grace")({
  head: () => ({
    meta: [
      { title: "Grace Period Management — Staff Control Portal" },
    ],
  }),
  component: GracePage,
});

interface GraceMember {
  fullName: string;
  memberId: string;
  mobile: string;
  expiry: string;
  daysElapsed: number;
  daysLeft: number;
}

function GracePage() {
  const [gracePeriodDays, setGracePeriodDays] = useState(7);
  const [accessDuringGrace, setAccessDuringGrace] = useState<"Full" | "Limited">("Full");
  const [graceMembers, setGraceMembers] = useState<GraceMember[]>([]);

  // Load grace settings and compute expired cohort
  useEffect(() => {
    // Grace period settings
    const storedPeriod = localStorage.getItem("grace_period_days");
    if (storedPeriod) {
      setGracePeriodDays(parseInt(storedPeriod) || 7);
    }
    const storedAccess = localStorage.getItem("grace_access_mode");
    if (storedAccess) {
      setAccessDuringGrace(storedAccess as "Full" | "Limited");
    }

    // Compute cohort from registered_users database
    const usersStr = localStorage.getItem("registered_users");
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        if (Array.isArray(users)) {
          const cohort: GraceMember[] = [];
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          users.forEach((u: any) => {
            if (!u.expiry) return;
            const expiryDate = new Date(u.expiry);
            if (isNaN(expiryDate.getTime())) return;
            expiryDate.setHours(0, 0, 0, 0);

            const diffTime = today.getTime() - expiryDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const period = storedPeriod ? parseInt(storedPeriod) || 7 : 7;

            // If expired but within grace period
            if (diffDays > 0 && diffDays <= period) {
              cohort.push({
                fullName: u.fullName || u.name,
                memberId: u.memberId,
                mobile: u.mobile,
                expiry: u.expiry,
                daysElapsed: diffDays,
                daysLeft: Math.max(0, period - diffDays)
              });
            }
          });

          // If no cohort is found, seed with Kavya Nambiar for the demonstration
          if (cohort.length === 0) {
            cohort.push({
              fullName: "Kavya Nambiar",
              memberId: "IG-2024-0134",
              mobile: "+91 98765 43215",
              expiry: "23 May 2026",
              daysElapsed: 5,
              daysLeft: 2
            });
          }

          setGraceMembers(cohort);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Seed fallback
      setGraceMembers([
        {
          fullName: "Kavya Nambiar",
          memberId: "IG-2024-0134",
          mobile: "+91 98765 43215",
          expiry: "23 May 2026",
          daysElapsed: 5,
          daysLeft: 2
        }
      ]);
    }
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem("grace_period_days", String(gracePeriodDays));
    localStorage.setItem("grace_access_mode", accessDuringGrace);
    toast.success("Grace period configurations saved successfully!");
  };

  const handleBulkReminder = () => {
    toast.success(`Broadcasting alerts: ${graceMembers.length} SMS & WhatsApp alerts dispatched!`);
  };

  const handleIndividualReminder = (member: GraceMember) => {
    toast.success(`Dispatched SMS & WhatsApp alert reminder to ${member.fullName}!`);
  };

  const handleForceRenew = (member: GraceMember) => {
    // Force renew logic: extend user expiry by 3 months
    const usersStr = localStorage.getItem("registered_users");
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        const idx = users.findIndex((u: any) => u.memberId === member.memberId);
        if (idx !== -1) {
          const newDate = new Date();
          newDate.setMonth(newDate.getMonth() + 3);
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          const newExpiryStr = `${newDate.getDate()} ${months[newDate.getMonth()]} ${newDate.getFullYear()}`;

          users[idx].expiry = newExpiryStr;
          users[idx].validUntil = newExpiryStr;
          users[idx].status = "Active";
          localStorage.setItem("registered_users", JSON.stringify(users));

          // Sync logged_in_member if it is this member
          const loggedStr = localStorage.getItem("logged_in_member");
          if (loggedStr) {
            const logged = JSON.parse(loggedStr);
            if (logged.memberId === member.memberId) {
              logged.expiry = newExpiryStr;
              logged.validUntil = newExpiryStr;
              logged.status = "Active";
              localStorage.setItem("logged_in_member", JSON.stringify(logged));
            }
          }

          // Remove from local cohort view
          setGraceMembers(prev => prev.filter(m => m.memberId !== member.memberId));
          toast.success(`Successfully renewed membership for ${member.fullName}!`);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <AdminPageLayout>
      <div className="space-y-6">
        
        {/* Title Heading */}
        <div>
          <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">Grace Period Management</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">Configure grace timeline rules and monitor expired memberships awaiting payment.</p>
        </div>

        {/* Configurations Settings card */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-[#222222]">
            <h3 className="font-display text-xs tracking-wider uppercase text-white font-bold flex items-center gap-2">
              <Settings className="h-4.5 w-4.5 text-[#E02020]" />
              Grace Rule Configs
            </h3>
            <Button
              onClick={handleSaveSettings}
              className="bg-[#E02020] hover:bg-[#C41818] text-white h-8 text-[10px] font-bold uppercase tracking-wider px-4"
            >
              Update Parameters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <Label className="text-[#8A8A8A] text-[10px] uppercase font-bold tracking-wider">Grace Period Duration (Days)</Label>
              <Input
                type="number"
                value={gracePeriodDays}
                onChange={(e) => setGracePeriodDays(parseInt(e.target.value) || 0)}
                className="bg-[#111111] border-[#222222] text-xs h-9 focus-visible:ring-[#E02020] w-full sm:w-64 text-white"
              />
              <p className="text-[10px] text-[#555] mt-1">Number of buffer days members have access after their official subscription expiry.</p>
            </div>

            <div className="space-y-1.5 flex flex-col justify-end pb-1">
              <Label className="text-[#8A8A8A] text-[10px] uppercase font-bold tracking-wider mb-1.5">Access Privileges During Grace</Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setAccessDuringGrace("Full")}
                  className={cn(
                    "px-4 py-2 rounded-lg font-bold text-[10px] uppercase border transition-colors",
                    accessDuringGrace === "Full"
                      ? "bg-[#E02020]/15 text-[#E02020] border-[#E02020]/30 font-bold"
                      : "bg-transparent text-[#8A8A8A] border-[#222222] hover:bg-[#111111]"
                  )}
                >
                  Full Dashboard Access
                </button>
                <button
                  onClick={() => setAccessDuringGrace("Limited")}
                  className={cn(
                    "px-4 py-2 rounded-lg font-bold text-[10px] uppercase border transition-colors",
                    accessDuringGrace === "Limited"
                      ? "bg-amber-500/15 text-amber-500 border-amber-500/30 font-bold"
                      : "bg-transparent text-[#8A8A8A] border-[#222222] hover:bg-[#111111]"
                  )}
                >
                  Limited Access Banner
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grace Cohort Table Segment */}
        <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-base tracking-wider uppercase text-white font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-[#E02020]" />
                Members in Grace Period ({graceMembers.length})
              </h3>
              <p className="text-[10px] text-[#8A8A8A] mt-0.5">List of active passes currently drawing grace period access.</p>
            </div>
            
            {graceMembers.length > 0 && (
              <Button
                onClick={handleBulkReminder}
                className="bg-[#E02020]/10 hover:bg-[#E02020]/20 text-[#E02020] border border-[#E02020]/20 h-9 text-[10px] font-bold uppercase tracking-wider"
              >
                Send renewal reminder to all
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-left border-collapse text-xs text-[#CFCFCF]">
              <thead>
                <tr className="border-b border-[#1A1A1A] uppercase text-[9px] tracking-widest text-[#8A8A8A] font-bold">
                  <th className="px-6 py-3.5">Member details</th>
                  <th className="px-6 py-3.5">Expiration date</th>
                  <th className="px-6 py-3.5">Days Expired</th>
                  <th className="px-6 py-3.5">Days Left</th>
                  <th className="px-6 py-3.5">Send alerts</th>
                  <th className="px-6 py-3.5 text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]">
                {graceMembers.map((m) => {
                  const urgent = m.daysLeft <= 2;
                  return (
                    <tr
                      key={m.memberId}
                      className={cn(
                        "hover:bg-[#111111]/30 transition-colors",
                        urgent ? "border-l-2 border-[#E02020] bg-[#E02020]/[0.01]" : ""
                      )}
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{m.fullName}</div>
                        <div className="text-[10px] text-[#555] font-mono mt-0.5">{m.memberId}</div>
                      </td>
                      <td className="px-6 py-4 font-mono">{m.expiry}</td>
                      <td className="px-6 py-4 font-bold text-amber-500">{m.daysElapsed} days</td>
                      <td className={cn(
                        "px-6 py-4 font-bold",
                        urgent ? "text-red-500 font-extrabold animate-pulse" : "text-white"
                      )}>
                        {m.daysLeft} days remaining
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleIndividualReminder(m)}
                            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                            title="Send Notification Alert"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>
                          <a
                            href={`https://wa.me/${m.mobile.replace(/\D/g, "")}?text=Hi%20${encodeURIComponent(m.fullName)},%20your%20IronForge%2520Gym%20membership%20expired.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors flex items-center justify-center"
                            title="WhatsApp Reminder"
                          >
                            <PhoneCall className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleForceRenew(m)}
                          className="px-2.5 py-1 bg-[#E02020] hover:bg-[#C41818] text-white font-bold text-[9px] uppercase tracking-wider rounded"
                        >
                          Renew
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {graceMembers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#555] text-xs">
                      No members are currently within the grace period interval.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {graceMembers.some(m => m.daysLeft <= 2) && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 flex items-start gap-3.5 text-xs text-red-400">
              <AlertTriangle className="h-5 w-5 text-[#E02020] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px]">Action Required: Urgent Expansions</span>
                <p className="text-[#8A8A8A] mt-0.5">
                  Some grace periods end in less than 48 hours. These accounts will lose dashboard access and entry permissions immediately upon expiry.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </AdminPageLayout>
  );
}
