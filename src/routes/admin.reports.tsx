import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AdminPageLayout } from "@/components/layout/AdminPageLayout";
import {
  TrendingUp, Calendar, Download, FileText, BarChart2, Users, AlertTriangle, Send, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Growth & Performance Reports — Staff Control Portal" },
    ],
  }),
  component: ReportsPage,
});

type ReportType = "revenue" | "attendance" | "membership" | "expiry";

function ReportsPage() {
  const [activeReport, setActiveReport] = useState<ReportType>("revenue");

  // Date selectors
  const [startDate, setStartDate] = useState("2026-05-01");
  const [endDate, setEndDate] = useState("2026-05-31");
  const [memberFilter, setMemberFilter] = useState("All Members");
  const [expiryDays, setExpiryDays] = useState("30");

  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success(`${activeReport.toUpperCase()} report generated for chosen intervals!`);
    }, 1200);
  };

  // Mock download functions generating real plain-text files
  const handleExportCSV = () => {
    let csvContent = "";
    let fileName = "";

    if (activeReport === "revenue") {
      fileName = "IronForge_Revenue_Report.csv";
      csvContent = `Date,Revenue,Plan,Payment Mode\n28 May,13999,Annual,UPI-GPay\n27 May,3999,Quarterly,Card\n26 May,3999,Quarterly,UPI-PhonePe\n26 May,1499,Monthly,Cash\n25 May,3999,Quarterly,UPI-Paytm\nTotal,27495,,`;
    } else if (activeReport === "attendance") {
      fileName = "IronForge_Attendance_Report.csv";
      csvContent = `Member Name,ID,Check-in Time,Checkout Time,Duration\nRahul Sharma,IG-2024-0042,06:14 AM,07:52 AM,1h 38m\nVikram Singh,IG-2024-0118,05:58 AM,07:30 AM,1h 32m\nPriya Patel,IG-2024-0071,08:12 AM,Active,--\nSneha Reddy,IG-2024-0103,07:30 AM,08:45 AM,1h 15m`;
    } else if (activeReport === "membership") {
      fileName = "IronForge_Membership_Audit.csv";
      csvContent = `Metric,Value\nActive Members,245\nExpired Members,34\nNew Registrations,18\nChurn Rate,4.2%`;
    } else {
      fileName = "IronForge_Expiry_Cohort.csv";
      csvContent = `Member Name,Member ID,Mobile,Expiry Date\nArjun Mehta,IG-2024-0089,+91 98765 43212,31 May 2026\nRahul Sharma,IG-2024-0042,+91 98765 43210,15 Aug 2025`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Excel/CSV export completed!");
  };

  const handleDownloadPDF = () => {
    let pdfText = `================================================\n`;
    pdfText += `IRONFORGE GYM HYDERABAD - ${activeReport.toUpperCase()} REPORT\n`;
    pdfText += `Interval: ${startDate} to ${endDate}\n`;
    pdfText += `Generated on: 29 May 2026\n`;
    pdfText += `================================================\n\n`;

    if (activeReport === "revenue") {
      pdfText += `SUMMARY STATS:\n`;
      pdfText += `- Total Gross Revenue: ₹1,24,500\n`;
      pdfText += `- Plan Breakdown:\n`;
      pdfText += `  * Annual Elite: ₹55,996 (45%)\n`;
      pdfText += `  * Quarterly Premium: ₹47,988 (38%)\n`;
      pdfText += `  * Monthly Standard: ₹20,516 (17%)\n`;
      pdfText += `- Payment Methods:\n`;
      pdfText += `  * UPI Dispatches: ₹74,700 (60%)\n`;
      pdfText += `  * Card Terminals: ₹37,350 (30%)\n`;
      pdfText += `  * Cash Desk: ₹12,450 (10%)\n`;
    } else if (activeReport === "attendance") {
      pdfText += `SUMMARY STATS:\n`;
      pdfText += `- Total Recorded check-ins: 1,420 entries\n`;
      pdfText += `- Daily Peak Hours: 06:00 AM - 09:00 AM & 05:00 PM - 08:00 PM\n`;
      pdfText += `- Average Workout Session: 1 hour 22 minutes\n`;
    } else if (activeReport === "membership") {
      pdfText += `SUMMARY STATS:\n`;
      pdfText += `- Active Subscriptions: 245 active passes\n`;
      pdfText += `- Expired Accounts: 34 members\n`;
      pdfText += `- Monthly Net Growth: +14 members (+6.1%)\n`;
      pdfText += `- Churn Index: 4.2%\n`;
    } else {
      pdfText += `SUMMARY STATS:\n`;
      pdfText += `- Expiring in next 7 days: 1 member\n`;
      pdfText += `- Expiring in next 15 days: 3 members\n`;
      pdfText += `- Expiring in next 30 days: 8 members\n`;
    }

    const blob = new Blob([pdfText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `IronForge_${activeReport}_Report.pdf`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("PDF Document download completed!");
  };

  const handleSendRemindersToAllExpiring = () => {
    toast.success("Dispatched renewal reminders to all members expiring in chosen interval!");
  };

  return (
    <AdminPageLayout>
      <div className="space-y-6">
        
        {/* Title Info */}
        <div>
          <h1 className="font-display text-4xl tracking-wide uppercase text-white font-bold">Growth & Performance Reports</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">Generate revenue audit worksheets, gate attendance reports, and cohort projections.</p>
        </div>

        {/* 4 Report Cards Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Revenue */}
          <div
            onClick={() => setActiveReport("revenue")}
            className={cn(
              "rounded-xl border p-5 cursor-pointer transition-all flex flex-col justify-between hover:bg-[#111111]/30 relative overflow-hidden select-none",
              activeReport === "revenue"
                ? "bg-[#0A0A0A] border-[#E02020] shadow-lg shadow-[#E02020]/10"
                : "bg-[#0A0A0A] border-[#222222]"
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] uppercase tracking-widest text-[#8A8A8A] font-bold">Financial Auditing</span>
                <h3 className="font-display text-base uppercase font-bold text-white mt-1">Revenue Report</h3>
              </div>
              <TrendingUp className="h-5 w-5 text-[#E02020]" />
            </div>
            <p className="text-[10px] text-[#8A8A8A] mt-4">Audited gross income breakdowns, plan rates, and cash checkouts.</p>
          </div>

          {/* Card 2: Attendance */}
          <div
            onClick={() => setActiveReport("attendance")}
            className={cn(
              "rounded-xl border p-5 cursor-pointer transition-all flex flex-col justify-between hover:bg-[#111111]/30 relative overflow-hidden select-none",
              activeReport === "attendance"
                ? "bg-[#0A0A0A] border-[#E02020] shadow-lg shadow-[#E02020]/10"
                : "bg-[#0A0A0A] border-[#222222]"
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] uppercase tracking-widest text-[#8A8A8A] font-bold">Gate Analytics</span>
                <h3 className="font-display text-base uppercase font-bold text-white mt-1">Attendance Report</h3>
              </div>
              <Calendar className="h-5 w-5 text-[#E02020]" />
            </div>
            <p className="text-[10px] text-[#8A8A8A] mt-4">Total gate scans, average workout duration, and daily peak hours.</p>
          </div>

          {/* Card 3: Membership */}
          <div
            onClick={() => setActiveReport("membership")}
            className={cn(
              "rounded-xl border p-5 cursor-pointer transition-all flex flex-col justify-between hover:bg-[#111111]/30 relative overflow-hidden select-none",
              activeReport === "membership"
                ? "bg-[#0A0A0A] border-[#E02020] shadow-lg shadow-[#E02020]/10"
                : "bg-[#0A0A0A] border-[#222222]"
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] uppercase tracking-widest text-[#8A8A8A] font-bold">Growth Indicators</span>
                <h3 className="font-display text-base uppercase font-bold text-white mt-1">Membership Audit</h3>
              </div>
              <Users className="h-5 w-5 text-[#E02020]" />
            </div>
            <p className="text-[10px] text-[#8A8A8A] mt-4">Net subscription metrics, churn rate, and active pass accounts.</p>
          </div>

          {/* Card 4: Expiry */}
          <div
            onClick={() => setActiveReport("expiry")}
            className={cn(
              "rounded-xl border p-5 cursor-pointer transition-all flex flex-col justify-between hover:bg-[#111111]/30 relative overflow-hidden select-none",
              activeReport === "expiry"
                ? "bg-[#0A0A0A] border-[#E02020] shadow-lg shadow-[#E02020]/10"
                : "bg-[#0A0A0A] border-[#222222]"
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[8px] uppercase tracking-widest text-[#8A8A8A] font-bold">Churn Risk</span>
                <h3 className="font-display text-base uppercase font-bold text-white mt-1">Expiry Cohorts</h3>
              </div>
              <BarChart2 className="h-5 w-5 text-[#E02020]" />
            </div>
            <p className="text-[10px] text-[#8A8A8A] mt-4">Members expiring in 7 / 15 / 30 days and bulk alert options.</p>
          </div>

        </div>

        {/* Configurations Parameters Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Inputs Section */}
          <div className="rounded-xl border border-[#222222] bg-[#0A0A0A] p-5 space-y-4">
            <h3 className="font-display text-xs tracking-wider uppercase text-white font-bold border-b border-[#222222] pb-2">
              Report Parameters
            </h3>

            <div className="space-y-3.5 text-xs">
              
              {activeReport !== "expiry" && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <Label className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider">Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-[#111111] border-[#222222] text-xs h-9 focus-visible:ring-[#E02020] text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider">End Date</Label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-[#111111] border-[#222222] text-xs h-9 focus-visible:ring-[#E02020] text-white"
                    />
                  </div>
                </div>
              )}

              {activeReport === "attendance" && (
                <div className="space-y-1.5 animate-in slide-in-from-top duration-200">
                  <Label className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider">Filter Member Name</Label>
                  <Input
                    placeholder="All Members"
                    value={memberFilter}
                    onChange={(e) => setMemberFilter(e.target.value)}
                    className="bg-[#111111] border-[#222222] text-xs h-9 focus-visible:ring-[#E02020] text-white"
                  />
                </div>
              )}

              {activeReport === "expiry" && (
                <div className="space-y-1.5 animate-in slide-in-from-top duration-200">
                  <Label className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider">Expiration Range</Label>
                  <div className="flex gap-2">
                    {(["7", "15", "30"] as const).map((days) => (
                      <button
                        key={days}
                        type="button"
                        onClick={() => setExpiryDays(days)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-colors flex-1",
                          expiryDays === days
                            ? "bg-zinc-800 text-white border-zinc-700"
                            : "bg-transparent text-[#8A8A8A] border-[#222222] hover:bg-[#111111]"
                        )}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerateReport}
                disabled={generating}
                className="w-full bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-10 uppercase tracking-wide text-xs flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating Audit...
                  </>
                ) : (
                  <>
                    <BarChart2 className="h-4.5 w-4.5" />
                    Generate Audit Report
                  </>
                )}
              </Button>

            </div>
          </div>

          {/* Interactive Live Preview (col-span-2) */}
          <div className="lg:col-span-2 rounded-xl border border-[#222222] bg-[#0A0A0A] p-6 space-y-6">
            
            {/* Header controls for preview */}
            <div className="flex justify-between items-center border-b border-[#222222] pb-3">
              <div>
                <h3 className="font-display text-sm tracking-wider uppercase text-white font-bold flex items-center gap-1.5">
                  <FileText className="h-4.5 w-4.5 text-[#E02020]" />
                  Interactive Audit Preview
                </h3>
                <p className="text-[10px] text-[#8A8A8A]">Showing calculated totals for specified query parameters.</p>
              </div>

              <div className="flex gap-2 text-xs">
                <Button
                  onClick={handleDownloadPDF}
                  size="sm"
                  className="bg-[#222222] hover:bg-zinc-800 text-white h-8 text-[10px] font-bold uppercase tracking-wider px-3 border border-zinc-800"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  PDF Download
                </Button>
                <Button
                  onClick={handleExportCSV}
                  size="sm"
                  className="bg-[#222222] hover:bg-zinc-800 text-white h-8 text-[10px] font-bold uppercase tracking-wider px-3 border border-zinc-800"
                >
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Excel Export
                </Button>
              </div>
            </div>

            {/* Content panel */}
            <div className="space-y-4">
              
              {/* REVENUE PREVIEW */}
              {activeReport === "revenue" && (
                <div className="space-y-5 animate-in fade-in duration-200 text-xs">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-[#8A8A8A] font-bold">Total Gross Revenue</span>
                      <p className="font-display text-2xl font-bold text-white mt-1">₹1,24,500</p>
                    </div>
                    <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-[#8A8A8A] font-bold">Gross GST collected</span>
                      <p className="font-display text-2xl font-bold text-emerald-400 mt-1">₹18,992</p>
                    </div>
                    <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-[#8A8A8A] font-bold">Subscribers renewed</span>
                      <p className="font-display text-2xl font-bold text-white mt-1">29 passes</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <span className="text-[#8A8A8A] text-[9px] uppercase font-bold tracking-wider">Plan Revenue breakdown</span>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[10px]">
                          <span>Annual Elite Access (₹13,999)</span>
                          <span className="text-white font-bold">₹55,996 (45%)</span>
                        </div>
                        <div className="h-2 rounded bg-zinc-800 overflow-hidden">
                          <div className="h-full bg-[#E02020]" style={{ width: "45%" }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[10px]">
                          <span>Quarterly Premium Access (₹3,999)</span>
                          <span className="text-white font-bold">₹47,988 (38%)</span>
                        </div>
                        <div className="h-2 rounded bg-zinc-800 overflow-hidden">
                          <div className="h-full bg-[#E02020]" style={{ width: "38%" }} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between font-mono text-[10px]">
                          <span>Monthly Standard Access (₹1,499)</span>
                          <span className="text-white font-bold">₹20,516 (17%)</span>
                        </div>
                        <div className="h-2 rounded bg-zinc-800 overflow-hidden">
                          <div className="h-full bg-[#E02020]" style={{ width: "17%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ATTENDANCE PREVIEW */}
              {activeReport === "attendance" && (
                <div className="space-y-5 animate-in fade-in duration-200 text-xs">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-[#8A8A8A] font-bold">Total Gate Check-ins</span>
                      <p className="font-display text-2xl font-bold text-white mt-1">1,420 Scans</p>
                    </div>
                    <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-[#8A8A8A] font-bold">Daily Avg scan events</span>
                      <p className="font-display text-2xl font-bold text-white mt-1">45 Scans</p>
                    </div>
                    <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-[#8A8A8A] font-bold">Avg Session Duration</span>
                      <p className="font-display text-2xl font-bold text-white mt-1">1h 22m</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#222222] p-4 text-left font-mono space-y-1.5 bg-[#111111]">
                    <span className="text-[#8A8A8A] uppercase font-bold text-[8px] tracking-wider">Gate Access Details</span>
                    <div className="space-y-1 text-[#CFCFCF] text-[10px]">
                      <div className="flex justify-between"><span>Morning Peak (06:00 AM - 09:00 AM):</span><span className="text-white font-bold">42% of traffic</span></div>
                      <div className="flex justify-between"><span>Evening Peak (05:00 PM - 08:00 PM):</span><span className="text-white font-bold">38% of traffic</span></div>
                      <div className="flex justify-between"><span>Anomalous checkout overrides:</span><span className="text-red-400 font-bold">12 overrides logged</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* MEMBERSHIP PREVIEW */}
              {activeReport === "membership" && (
                <div className="space-y-5 animate-in fade-in duration-200 text-xs">
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-[#111111] border border-[#222222] rounded-xl p-3.5 text-center">
                      <span className="text-[8px] uppercase tracking-wider text-[#8A8A8A] font-bold">Active passes</span>
                      <p className="font-display text-xl font-bold text-white mt-1">245</p>
                    </div>
                    <div className="bg-[#111111] border border-[#222222] rounded-xl p-3.5 text-center">
                      <span className="text-[8px] uppercase tracking-wider text-[#8A8A8A] font-bold">Expired passes</span>
                      <p className="font-display text-xl font-bold text-zinc-500 mt-1">34</p>
                    </div>
                    <div className="bg-[#111111] border border-[#222222] rounded-xl p-3.5 text-center">
                      <span className="text-[8px] uppercase tracking-wider text-[#8A8A8A] font-bold">New this month</span>
                      <p className="font-display text-xl font-bold text-white mt-1">18</p>
                    </div>
                    <div className="bg-[#111111] border border-[#222222] rounded-xl p-3.5 text-center">
                      <span className="text-[8px] uppercase tracking-wider text-[#8A8A8A] font-bold">Churn rate</span>
                      <p className="font-display text-xl font-bold text-[#E02020] mt-1">4.2%</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#222222] p-4 text-left font-mono space-y-1.5 bg-[#111111]">
                    <span className="text-[#8A8A8A] uppercase font-bold text-[8px] tracking-wider">Cohort growth trends</span>
                    <div className="space-y-1 text-[#CFCFCF] text-[10px]">
                      <div className="flex justify-between"><span>Net month-on-month growth:</span><span className="text-emerald-400 font-bold">+14 members (+6.1%)</span></div>
                      <div className="flex justify-between"><span>Renewal rate:</span><span className="text-white font-bold">88.5%</span></div>
                      <div className="flex justify-between"><span>Biometric compliance index:</span><span className="text-white font-bold">94.2% registered</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* EXPIRY PREVIEW */}
              {activeReport === "expiry" && (
                <div className="space-y-5 animate-in fade-in duration-200 text-xs">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-[#8A8A8A] font-bold">Expiring in 7 Days</span>
                      <p className="font-display text-2xl font-bold text-[#E02020] mt-1">1 Member</p>
                    </div>
                    <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-[#8A8A8A] font-bold">Expiring in 15 Days</span>
                      <p className="font-display text-2xl font-bold text-white mt-1">3 Members</p>
                    </div>
                    <div className="bg-[#111111] border border-[#222222] rounded-xl p-4 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-[#8A8A8A] font-bold">Expiring in 30 Days</span>
                      <p className="font-display text-2xl font-bold text-white mt-1">8 Members</p>
                    </div>
                  </div>

                  <div className="bg-[#111111] border border-red-500/20 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-[#E02020] shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-white uppercase tracking-wider text-[9px]">Expiring warning cohort alert</span>
                        <p className="text-[#8A8A8A] mt-0.5">There are members expiring soon. Dispatch reminder notices immediately.</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleSendRemindersToAllExpiring}
                      className="bg-[#E02020] hover:bg-[#C41818] text-white font-bold h-8 text-[10px] uppercase tracking-wider px-3 shrink-0 flex items-center gap-1.5"
                    >
                      <Send className="h-3 w-3" />
                      Send reminder to all
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </AdminPageLayout>
  );
}
