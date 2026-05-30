import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Users, Receipt, Bell, ShieldAlert, ChevronRight, HelpCircle, Dumbbell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      q: (search.q as string) || "",
    };
  },
  head: () => ({
    meta: [
      { title: "Search Results — IronForge Gym" },
      { name: "description", content: "Search across members, payments, and system alerts." },
    ],
  }),
  component: SearchPage,
});

interface SearchMember {
  name: string;
  memberId: string;
  plan: string;
  status: string;
  mobile: string;
  email: string;
}

interface SearchPayment {
  id: string;
  date: string;
  name: string;
  amount: number;
  plan: string;
  method: string;
  status: string;
}

interface SearchAnnouncement {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: string;
}

function SearchPage() {
  const { q: initialQuery } = Route.useSearch();
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on load
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Update query state if URL search param changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Load members from localStorage
  const membersList = useMemo<SearchMember[]>(() => {
    const defaultMembers = [
      { name: "Rahul Sharma", memberId: "IG-2024-0042", plan: "Quarterly Premium", status: "Active", mobile: "+91 98765 43210", email: "rahul@gmail.com" },
      { name: "Priya Patel", memberId: "IG-2024-0071", plan: "Annual Elite", status: "Active", mobile: "+91 98765 43211", email: "priya@example.com" },
      { name: "Sneha Reddy", memberId: "IG-2024-0105", plan: "Monthly Standard", status: "Pending Approval", mobile: "+91 98765 43212", email: "sneha@example.com" },
      { name: "Vikram Singh", memberId: "IG-2024-0094", plan: "Quarterly Premium", status: "Active", mobile: "+91 98765 43213", email: "vikram@example.com" },
      { name: "Arjun Mehta", memberId: "IG-2024-0118", plan: "Monthly Standard", status: "Expired", mobile: "+91 98765 43214", email: "arjun@example.com" },
      { name: "Kavya Nambiar", memberId: "IG-2024-0129", plan: "Monthly Standard", status: "Pending Payment", mobile: "+91 98765 43215", email: "kavya@example.com" }
    ];

    if (typeof window === "undefined") return defaultMembers;
    const usersStr = localStorage.getItem("registered_users");
    if (!usersStr) return defaultMembers;

    try {
      const users = JSON.parse(usersStr);
      if (Array.isArray(users)) {
        const mapped = users.map((u: any) => ({
          name: u.fullName || u.name || "",
          memberId: u.memberId || "",
          plan: u.plan === "quarterly" ? "Quarterly Premium" : u.plan === "annual" ? "Annual Elite" : "Monthly Standard",
          status: u.status || "Active",
          mobile: u.mobile || "",
          email: u.email || ""
        }));

        // Deduplicate and merge with defaults
        const mergedMap = new Map();
        defaultMembers.forEach(m => mergedMap.set(m.memberId, m));
        mapped.forEach(m => {
          if (m.memberId) {
            mergedMap.set(m.memberId, m);
          }
        });
        return Array.from(mergedMap.values());
      }
    } catch (e) {
      console.error(e);
    }
    return defaultMembers;
  }, []);

  // Load payments from localStorage
  const paymentsList = useMemo<SearchPayment[]>(() => {
    const defaultPayments = [
      { id: "tx-1", date: "28 May", name: "Priya Patel", amount: 13999, plan: "Annual", method: "UPI-GPay", status: "Paid" },
      { id: "tx-2", date: "27 May", name: "Vikram Singh", amount: 3999, plan: "Quarterly", method: "Card", status: "Paid" },
      { id: "tx-3", date: "26 May", name: "Rahul Sharma", amount: 3999, plan: "Quarterly", method: "UPI-PhonePe", status: "Paid" },
      { id: "tx-4", date: "26 May", name: "Kavya Nambiar", amount: 1499, plan: "Monthly", method: "Cash", status: "Pending Verify" },
      { id: "tx-5", date: "25 May", name: "Sneha Reddy", amount: 3999, plan: "Quarterly", method: "UPI-Paytm", status: "Paid" },
      { id: "tx-6", date: "24 May", name: "Arjun Mehta", amount: 1499, plan: "Monthly", method: "Card", status: "Paid" }
    ];

    if (typeof window === "undefined") return defaultPayments;

    // Scan localStorage for payments keys
    const foundPayments: SearchPayment[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("payments_")) {
        try {
          const records = JSON.parse(localStorage.getItem(key) || "[]");
          records.forEach((r: any) => {
            foundPayments.push({
              id: r.id || r.invoiceNo || `tx-${Math.floor(1000 + Math.random() * 9000)}`,
              date: r.date || "Today",
              name: r.name || "Member",
              amount: r.amount || 0,
              plan: r.plan || "Monthly Standard",
              method: r.method || "Cash",
              status: r.status || "Paid"
            });
          });
        } catch (e) {}
      }
    }

    const mergedMap = new Map();
    defaultPayments.forEach(p => mergedMap.set(p.id, p));
    foundPayments.forEach(p => mergedMap.set(p.id, p));
    return Array.from(mergedMap.values());
  }, []);

  // Announcements list
  const announcementsList = useMemo<SearchAnnouncement[]>(() => [
    { id: "n-1", title: "Monthly Cleaning Schedule", desc: "Facility maintenance planned for Sunday, 1st June. All check-in logs will be suspended.", time: "1 day ago", type: "alert" },
    { id: "n-2", title: "New Morning HIIT batch starts 2 June", desc: "Book your slot in the Morning HIIT conditioning batch starting Monday at 6:30 AM. Coach Karan.", time: "1 day ago", type: "info" },
    { id: "n-3", title: "Peak Occupancy Reached", desc: "Occupancy hit 76 members at 7:15 PM on Wednesday. Recommended crowd alerts sent.", time: "3 days ago", type: "warning" },
    { id: "n-4", title: "New HIIT trainer onboarded", desc: "Trainer Divya Nair added to system. Shift scheduled for 5:30 PM slots.", time: "2 days ago", type: "info" }
  ], []);

  // Filter lists based on search query
  const filteredData = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) {
      return {
        members: [],
        payments: [],
        announcements: [],
        total: 0
      };
    }

    const filteredMembers = membersList.filter(
      m =>
        m.name.toLowerCase().includes(normalized) ||
        m.memberId.toLowerCase().includes(normalized) ||
        m.email.toLowerCase().includes(normalized) ||
        m.mobile.includes(normalized) ||
        m.plan.toLowerCase().includes(normalized)
    );

    const filteredPayments = paymentsList.filter(
      p =>
        p.id.toLowerCase().includes(normalized) ||
        p.name.toLowerCase().includes(normalized) ||
        p.method.toLowerCase().includes(normalized) ||
        p.status.toLowerCase().includes(normalized) ||
        p.plan.toLowerCase().includes(normalized) ||
        p.amount.toString().includes(normalized)
    );

    const filteredAnnouncements = announcementsList.filter(
      a =>
        a.title.toLowerCase().includes(normalized) ||
        a.desc.toLowerCase().includes(normalized) ||
        a.type.toLowerCase().includes(normalized)
    );

    return {
      members: filteredMembers,
      payments: filteredPayments,
      announcements: filteredAnnouncements,
      total: filteredMembers.length + filteredPayments.length + filteredAnnouncements.length
    };
  }, [query, membersList, paymentsList, announcementsList]);

  // Submit search query
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      to: "/search",
      search: { q: query },
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans select-none">
      
      {/* Top sticky search box and nav */}
      <header className="sticky top-0 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#1A1A1A] px-6 py-4 z-20 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className="p-2 text-[#8A8A8A] hover:text-white bg-[#111111] hover:bg-[#1A1A1A] border border-[#222222] rounded-lg transition-colors cursor-pointer shrink-0"
              title="Back to Admin"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <span className="text-[9px] uppercase tracking-widest text-[#E02020] font-bold">Global Database</span>
              <h2 className="font-display text-lg text-white uppercase tracking-wider font-bold">Search Control</h2>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#555555]" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search by name, ID, mobile, amount, status..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#111111] border-[#222222] focus:border-[#E02020] pl-10 pr-20 h-10 text-xs text-white"
            />
            {query.trim().length > 0 && (
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#E02020] hover:bg-[#C41818] text-white text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded cursor-pointer"
              >
                Search
              </button>
            )}
          </form>
        </div>
      </header>

      {/* Main Results Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8">
        {query.trim().length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-[#111111] border border-[#222222] flex items-center justify-center text-[#555555]">
              <Search className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg uppercase text-white font-bold tracking-wide">Enter a query</h3>
              <p className="text-xs text-[#8A8A8A] max-w-xs">Type in the search bar above to look up members, billing histories, or alerts.</p>
            </div>
          </div>
        ) : filteredData.total === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center space-y-4"
          >
            <div className="h-16 w-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-lg uppercase text-white font-bold tracking-wide">No Results Found</h3>
              <p className="text-xs text-[#8A8A8A] max-w-xs">No records matching "<span className="text-white font-semibold">{query}</span>" were found in our directory.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => setQuery("")}
              className="border-[#222222] text-[#8A8A8A] hover:text-white uppercase font-bold text-[10px]"
            >
              Clear Query
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            
            {/* Summary Tagline */}
            <div className="flex items-center justify-between text-xs text-[#8A8A8A]">
              <span>Search query: "<span className="text-white">{query}</span>"</span>
              <span>Found {filteredData.total} matches</span>
            </div>

            {/* MEMBERS SECTION */}
            {filteredData.members.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-[#1A1A1A] pb-2">
                  <Users className="h-4 w-4 text-[#E02020]" />
                  <h3 className="font-display text-sm uppercase text-white font-bold tracking-wider">Members</h3>
                  <Badge variant="outline" className="bg-[#E02020]/10 border-[#E02020]/20 text-[#E02020] text-[9px] font-bold">
                    {filteredData.members.length}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredData.members.map((member) => (
                    <motion.div
                      key={member.memberId}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-4 flex flex-col justify-between hover:border-[#333] transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] text-[#8A8A8A] font-mono">{member.memberId}</span>
                            <h4 className="text-sm font-bold text-white mt-0.5">{member.name}</h4>
                          </div>
                          <Badge
                            className={cn(
                              "text-[8px] font-bold uppercase py-0.5 px-2 rounded-full",
                              member.status === "Active" && "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400",
                              member.status === "Pending Approval" && "bg-amber-500/10 border border-amber-500/30 text-amber-400",
                              member.status === "Pending Payment" && "bg-amber-500/10 border border-amber-500/30 text-amber-400",
                              member.status === "Expired" && "bg-red-500/10 border border-red-500/30 text-red-500",
                              member.status === "Suspended" && "bg-red-500/10 border border-red-500/30 text-red-500"
                            )}
                          >
                            {member.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] text-[#8A8A8A] border-t border-[#1A1A1A]/50 pt-2">
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-[#555]">Plan</span>
                            <span className="text-white font-medium">{member.plan}</span>
                          </div>
                          <div>
                            <span className="block text-[8px] uppercase tracking-wider text-[#555]">Contact</span>
                            <span className="text-white font-medium">{member.mobile}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-2 border-t border-[#1A1A1A]/50 flex justify-end">
                        <Link
                          to={`/admin/members/$id`}
                          params={{ id: member.memberId }}
                          className="text-[10px] text-[#E02020] hover:underline font-bold uppercase flex items-center gap-0.5 group"
                        >
                          View Profile <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* PAYMENTS SECTION */}
            {filteredData.payments.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-[#1A1A1A] pb-2">
                  <Receipt className="h-4 w-4 text-[#E02020]" />
                  <h3 className="font-display text-sm uppercase text-white font-bold tracking-wider">Payments Ledger</h3>
                  <Badge variant="outline" className="bg-[#E02020]/10 border-[#E02020]/20 text-[#E02020] text-[9px] font-bold">
                    {filteredData.payments.length}
                  </Badge>
                </div>

                <div className="divide-y divide-[#1A1A1A] border border-[#222222] bg-[#0A0A0A] rounded-xl overflow-hidden">
                  {filteredData.payments.map((tx) => (
                    <div key={tx.id} className="p-4 flex items-center justify-between text-xs hover:bg-[#111111]/30 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{tx.name}</span>
                          <span className="text-[9px] text-[#555555] font-mono">{tx.id}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-[#8A8A8A]">
                          <span>{tx.plan}</span>
                          <span>•</span>
                          <span>{tx.method}</span>
                          <span>•</span>
                          <span>{tx.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div className="space-y-1">
                          <div className="font-bold text-white">₹{tx.amount.toLocaleString("en-IN")}</div>
                          <Badge
                            className={cn(
                              "text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5",
                              tx.status === "Paid" && "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                              tx.status === "Pending Verify" && "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            )}
                          >
                            {tx.status}
                          </Badge>
                        </div>
                        <Link
                          to={`/invoice/$id`}
                          params={{ id: tx.id }}
                          className="p-1.5 rounded-lg border border-[#222222] bg-[#111111] hover:bg-[#1A1A1A] text-[#8A8A8A] hover:text-white transition-colors cursor-pointer"
                          title="View Invoice"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ANNOUNCEMENTS SECTION */}
            {filteredData.announcements.length > 0 && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-[#1A1A1A] pb-2">
                  <Bell className="h-4 w-4 text-[#E02020]" />
                  <h3 className="font-display text-sm uppercase text-white font-bold tracking-wider">System Alerts & Announcements</h3>
                  <Badge variant="outline" className="bg-[#E02020]/10 border-[#E02020]/20 text-[#E02020] text-[9px] font-bold">
                    {filteredData.announcements.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {filteredData.announcements.map((an) => (
                    <div
                      key={an.id}
                      className={cn(
                        "rounded-xl border p-4 flex gap-4 bg-[#0A0A0A]",
                        an.type === "alert" && "border-red-500/20 bg-red-500/5",
                        an.type === "warning" && "border-amber-500/20 bg-amber-500/5",
                        an.type === "info" && "border-blue-500/20 bg-blue-500/5"
                      )}
                    >
                      <div className="h-9 w-9 rounded-lg bg-[#111111] border border-[#222222] flex items-center justify-center shrink-0">
                        <Bell className={cn(
                          "h-4 w-4",
                          an.type === "alert" && "text-red-400",
                          an.type === "warning" && "text-amber-400",
                          an.type === "info" && "text-blue-400"
                        )} />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-sm text-white">{an.title}</span>
                          <span className="text-[9px] text-[#555555] font-semibold uppercase">{an.time}</span>
                        </div>
                        <p className="text-xs text-[#8A8A8A] leading-relaxed">{an.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      <footer className="border-t border-[#1A1A1A] bg-[#0A0A0A]/50 py-4 text-center text-xs text-[#555555] shrink-0">
        IronForge Unified Database Directory. Authorized administration access only.
      </footer>
    </div>
  );
}
