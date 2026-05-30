import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Clock, Calendar, IndianRupee, Activity, Bell,
  Contact, TrendingUp, Settings, LogOut, X, ChevronDown, ChevronUp,
  Dumbbell, Fingerprint, MessageSquare, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

interface AdminPageLayoutProps {
  children: React.ReactNode;
}

export function AdminPageLayout({ children }: AdminPageLayoutProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const currentSearch = routerState.location.search as any;
  const activeTabParam = currentSearch?.tab || "";

  const [menuOpen, setMenuOpen] = useState(false);
  const [membersMenuOpen, setMembersMenuOpen] = useState(true);
  const [bellOpen, setBellOpen] = useState(false);

  // Dynamic counts loaded from localStorage
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  // Seeded notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Kavya Nambiar's grace period ends in 2 days", time: "2 hours ago", read: false },
    { id: 2, text: "Stranger alert: 3 failed scans at front gate", time: "3 hours ago", read: false },
    { id: 3, text: "System update: Auto-checkout settings updated", time: "1 day ago", read: true }
  ]);

  useEffect(() => {
    // Access authentication check
    const isStaff = localStorage.getItem("is_staff_logged_in");
    if (!isStaff) {
      navigate({ to: "/admin/login" });
    }

    // Load dynamic counts from registered_users in localStorage
    const usersStr = localStorage.getItem("registered_users");
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        if (Array.isArray(users)) {
          const appCount = users.filter((u: any) => u.status === "Pending Approval").length;
          const payCount = users.filter((u: any) => u.status === "Pending Payment").length;
          setPendingApprovalsCount(appCount);
          setPendingPaymentsCount(payCount);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [navigate, currentPath]);

  const handleLogout = () => {
    localStorage.removeItem("is_staff_logged_in");
    navigate({ to: "/admin/login" });
    toast.success("Logged out from Staff Control Panel");
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success("All alerts marked as read");
  };

  // Sidebar link helpers
  const isTabActive = (tabName: string) => {
    return currentPath === "/admin" && activeTabParam === tabName;
  };

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
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Staff Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-[260px] bg-[#0A0A0A] border-r border-[#1A1A1A] flex flex-col justify-between p-6 shrink-0 transition-transform duration-300 md:translate-x-0 md:static z-30",
        menuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="space-y-6 flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-[#E02020] flex items-center justify-center shadow-lg shadow-[#E02020]/20">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl tracking-wide uppercase font-bold text-white">IronForge Gym</span>
            </Link>
            <button className="md:hidden text-[#8A8A8A] hover:text-white" onClick={() => setMenuOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="space-y-1.5 pt-4 overflow-y-auto flex-1 scrollbar-none">
            {/* Dashboard Overview */}
            <Link
              to="/admin"
              search={{ tab: "overview" }}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                isTabActive("overview") || (currentPath === "/admin" && !activeTabParam)
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <LayoutDashboard className="h-4 w-4 mr-3 shrink-0" />
              <span>Dashboard Overview</span>
            </Link>

            {/* Members Section */}
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
                  <Link
                    to="/admin"
                    search={{ tab: "members" }}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "w-full flex items-center px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                      isTabActive("members") ? "text-[#E02020]" : "text-[#8A8A8A] hover:text-white"
                    )}
                  >
                    All Members
                  </Link>
                  <Link
                    to="/admin"
                    search={{ tab: "pending" }}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                      isTabActive("pending") ? "text-[#E02020]" : "text-[#8A8A8A] hover:text-white"
                    )}
                  >
                    <span>New Applications</span>
                    {pendingApprovalsCount > 0 && (
                      <span className="bg-[#E02020] text-white text-[8px] h-4 px-1.5 rounded-full flex items-center justify-center font-bold">
                        {pendingApprovalsCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/admin"
                    search={{ tab: "pending-payments" }}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                      isTabActive("pending-payments") ? "text-[#E02020]" : "text-[#8A8A8A] hover:text-white"
                    )}
                  >
                    <span>Pending Payments</span>
                    {pendingPaymentsCount > 0 && (
                      <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] h-4 px-1.5 rounded-full flex items-center justify-center font-bold">
                        {pendingPaymentsCount}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/admin"
                    search={{ tab: "manual" }}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "w-full flex items-center px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                      isTabActive("manual") ? "text-[#E02020]" : "text-[#8A8A8A] hover:text-white"
                    )}
                  >
                    Register Walk-in
                  </Link>
                </div>
              )}
            </div>

            {/* Biometric & Access */}
            <Link
              to="/admin/biometric"
              onClick={() => setMenuOpen(false)}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                currentPath === "/admin/biometric"
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <Fingerprint className="h-4 w-4 mr-3 shrink-0" />
              <span>Biometric & Access</span>
            </Link>

            {/* Attendance & Access */}
            <Link
              to="/admin"
              search={{ tab: "attendance" }}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                isTabActive("attendance")
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <Calendar className="h-4 w-4 mr-3 shrink-0" />
              <span>Attendance & Access</span>
            </Link>

            {/* Payments & Revenue */}
            <Link
              to="/admin"
              search={{ tab: "payments" }}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                isTabActive("payments")
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <IndianRupee className="h-4 w-4 mr-3 shrink-0" />
              <span>Payments & Revenue</span>
            </Link>

            {/* Live Occupancy */}
            <Link
              to="/admin"
              search={{ tab: "occupancy" }}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                isTabActive("occupancy")
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <Activity className="h-4 w-4 mr-3 shrink-0" />
              <span>Live Occupancy</span>
            </Link>

            {/* Notifications & Announcements */}
            <Link
              to="/admin"
              search={{ tab: "notifications" }}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                isTabActive("notifications")
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <Bell className="h-4 w-4 mr-3 shrink-0" />
              <span>Notifications & Alerts</span>
            </Link>

            {/* Staff Management */}
            <Link
              to="/admin"
              search={{ tab: "staff" }}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                isTabActive("staff")
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <Contact className="h-4 w-4 mr-3 shrink-0" />
              <span>Staff Management</span>
            </Link>

            {/* Grace Period Management */}
            <Link
              to="/admin/grace"
              onClick={() => setMenuOpen(false)}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                currentPath === "/admin/grace"
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <Clock className="h-4 w-4 mr-3 shrink-0" />
              <span>Grace Period Settings</span>
            </Link>

            {/* Bulk SMS Messaging */}
            <Link
              to="/admin/sms"
              onClick={() => setMenuOpen(false)}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                currentPath === "/admin/sms"
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <MessageSquare className="h-4 w-4 mr-3 shrink-0" />
              <span>Bulk SMS Composer</span>
            </Link>

            {/* Growth Reports */}
            <Link
              to="/admin/reports"
              onClick={() => setMenuOpen(false)}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                currentPath === "/admin/reports"
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <TrendingUp className="h-4 w-4 mr-3 shrink-0" />
              <span>Growth Reports</span>
            </Link>

            {/* Settings */}
            <Link
              to="/admin"
              search={{ tab: "settings" }}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "w-full flex items-center px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                isTabActive("settings")
                  ? "bg-[#E02020] text-white shadow-lg shadow-[#E02020]/15"
                  : "text-[#8A8A8A] hover:text-white hover:bg-[#111111]"
              )}
            >
              <Settings className="h-4 w-4 mr-3 shrink-0" />
              <span>Global Settings</span>
            </Link>
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

      {/* Main Admin Content Container */}
      <div className="flex-1 bg-[#0D0D0D] min-w-0 flex flex-col justify-between min-h-[calc(100vh-65px)] md:min-h-screen relative">
        
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
                className="absolute right-4 md:right-8 top-[60px] md:top-[70px] w-80 bg-[#111111] border border-[#222222] rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col"
              >
                <div className="bg-[#0A0A0A] border-b border-[#222222] px-4 py-3 flex items-center justify-between">
                  <h3 className="font-display text-sm text-white font-bold uppercase tracking-wider">System Alerts</h3>
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-[#E02020] hover:underline font-bold uppercase cursor-pointer"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-[#222222]">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        "p-3.5 space-y-1 transition-colors text-left",
                        n.read ? "bg-transparent" : "bg-[#E02020]/5"
                      )}
                    >
                      <p className="text-xs text-white font-medium">{n.text}</p>
                      <span className="text-[9px] text-[#555555] block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="p-6 md:p-8 space-y-6 flex-1 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
