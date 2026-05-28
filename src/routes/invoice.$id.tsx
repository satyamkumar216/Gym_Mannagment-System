import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { Printer, Download, Send, ArrowLeft, Check, X, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/invoice/$id")({
  head: () => ({
    meta: [
      { title: "GST Tax Invoice — IronForge Gym" },
      { name: "description", content: "Official GST tax invoice receipt." },
    ],
  }),
  component: MemberInvoice,
});

interface InvoiceData {
  name: string;
  memberId: string;
  plan: string;
  mobile: string;
  email: string;
  amount: number;
  baseAmount: number;
  gstAmount: number;
  period: string;
  invoiceNo: string;
  date: string;
  dueDate: string;
  paymentMethod: string;
}

const defaultMembersDb: Record<string, InvoiceData> = {
  "IG-2024-0042": {
    name: "Rahul Sharma",
    memberId: "IG-2024-0042",
    plan: "Quarterly Premium Membership",
    mobile: "+91 98765 43210",
    email: "rahul@gmail.com",
    amount: 3999,
    baseAmount: 3389,
    gstAmount: 610,
    period: "12 Feb 2025 - 15 May 2025",
    invoiceNo: "INV-2025-0284",
    date: "12 Feb 2025",
    dueDate: "12 Feb 2025",
    paymentMethod: "UPI - Google Pay"
  },
  "IG-2024-0071": {
    name: "Priya Patel",
    memberId: "IG-2024-0071",
    plan: "Annual Elite Membership",
    mobile: "+91 98765 43211",
    email: "priya@example.com",
    amount: 16518,
    baseAmount: 13999,
    gstAmount: 2519,
    period: "18 Mar 2025 - 17 Mar 2026",
    invoiceNo: "INV-2025-0371",
    date: "18 Mar 2025",
    dueDate: "18 Mar 2025",
    paymentMethod: "UPI - Paytm"
  },
  "IG-2024-0089": {
    name: "Arjun Mehta",
    memberId: "IG-2024-0089",
    plan: "Monthly Standard Membership",
    mobile: "+91 98765 43212",
    email: "arjun@example.com",
    amount: 1499,
    baseAmount: 1270,
    gstAmount: 229,
    period: "10 Apr 2025 - 10 May 2025",
    invoiceNo: "INV-2025-0389",
    date: "10 Apr 2025",
    dueDate: "10 Apr 2025",
    paymentMethod: "Card Payment"
  },
  "IG-2024-0103": {
    name: "Sneha Reddy",
    memberId: "IG-2024-0103",
    plan: "Quarterly Premium Membership",
    mobile: "+91 98765 43213",
    email: "sneha@example.com",
    amount: 3999,
    baseAmount: 3389,
    gstAmount: 610,
    period: "05 May 2025 - 05 Aug 2025",
    invoiceNo: "INV-2025-0403",
    date: "05 May 2025",
    dueDate: "05 May 2025",
    paymentMethod: "UPI - Paytm"
  },
  "IG-2024-0118": {
    name: "Vikram Singh",
    memberId: "IG-2024-0118",
    plan: "Annual Elite Membership",
    mobile: "+91 98765 43214",
    email: "vikram@example.com",
    amount: 16518,
    baseAmount: 13999,
    gstAmount: 2519,
    period: "15 May 2025 - 15 May 2026",
    invoiceNo: "INV-2025-0418",
    date: "15 May 2025",
    dueDate: "15 May 2025",
    paymentMethod: "Credit Card"
  },
  "IG-2024-0134": {
    name: "Kavya Nambiar",
    memberId: "IG-2024-0134",
    plan: "Monthly Standard Membership",
    mobile: "+91 98765 43215",
    email: "kavya@example.com",
    amount: 1499,
    baseAmount: 1270,
    gstAmount: 229,
    period: "12 Jan 2025 - 12 Feb 2025",
    invoiceNo: "INV-2025-0334",
    date: "12 Jan 2025",
    dueDate: "12 Jan 2025",
    paymentMethod: "Cash Payment"
  },
  "IG-2024-0156": {
    name: "Rohit Gupta",
    memberId: "IG-2024-0156",
    plan: "Quarterly Premium Membership",
    mobile: "+91 98765 43216",
    email: "rohit@example.com",
    amount: 3999,
    baseAmount: 3389,
    gstAmount: 610,
    period: "28 May 2025 - 28 Aug 2025",
    invoiceNo: "INV-2025-0456",
    date: "28 May 2025",
    dueDate: "28 May 2025",
    paymentMethod: "UPI - GPay"
  },
  "IG-2024-0167": {
    name: "Meera Joshi",
    memberId: "IG-2024-0167",
    plan: "Annual Elite Membership",
    mobile: "+91 98765 43217",
    email: "meera@example.com",
    amount: 16518,
    baseAmount: 13999,
    gstAmount: 2519,
    period: "27 May 2025 - 27 May 2026",
    invoiceNo: "INV-2025-0467",
    date: "27 May 2025",
    dueDate: "27 May 2025",
    paymentMethod: "Cash Desk"
  }
};

function MemberInvoice() {
  const { id } = Route.useParams();
  
  // Modals state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  // Force Light Theme Background for Printable Invoice Route
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    const originalColor = document.body.style.color;

    document.body.style.backgroundColor = "#F3F4F6"; // Slate-100 on screen
    document.body.style.color = "#000000";

    return () => {
      document.body.style.backgroundColor = originalBg;
      document.body.style.color = originalColor;
    };
  }, []);

  // Look up member data dynamically
  const invoice = useMemo<InvoiceData>(() => {
    const normalized = id.toUpperCase();
    
    // 1. Check local static database
    const matchedKey = Object.keys(defaultMembersDb).find(
      key => key === normalized || key.endsWith(normalized)
    );
    if (matchedKey) {
      return defaultMembersDb[matchedKey];
    }
    
    const matchedInvoice = Object.values(defaultMembersDb).find(
      m => m.invoiceNo === normalized || m.invoiceNo.endsWith(normalized)
    );
    if (matchedInvoice) {
      return matchedInvoice;
    }

    const matchedName = Object.values(defaultMembersDb).find(
      m => m.name.toUpperCase().replace(/\s+/g, "-") === normalized ||
           m.name.toUpperCase() === normalized
    );
    if (matchedName) {
      return matchedName;
    }

    // 2. Check localStorage database
    if (typeof window !== "undefined") {
      const usersStr = localStorage.getItem("registered_users");
      if (usersStr) {
        try {
          const users = JSON.parse(usersStr);
          if (Array.isArray(users)) {
            const u = users.find(
              (usr: any) =>
                usr.memberId === normalized ||
                (usr.memberId && usr.memberId.toUpperCase().endsWith(normalized)) ||
                usr.fullName.toUpperCase().replace(/\s+/g, "-") === normalized ||
                usr.fullName.toUpperCase() === normalized
            );
            if (u) {
              const isAnnual = u.plan === "annual";
              const isMonthly = u.plan === "monthly";
              const base = isAnnual ? 13999 : isMonthly ? 1270 : 3389;
              const gst = isAnnual ? 2519 : isMonthly ? 229 : 610;
              const total = base + gst;
              
              return {
                name: u.fullName,
                memberId: u.memberId || "IG-2024-TEMP",
                plan: isAnnual ? "Annual Elite Membership" : isMonthly ? "Monthly Standard Membership" : "Quarterly Premium Membership",
                mobile: u.mobile.startsWith("+91") ? u.mobile : `+91 ${u.mobile}`,
                email: u.email,
                amount: total,
                baseAmount: base,
                gstAmount: gst,
                period: isAnnual ? "28 May 2026 - 27 May 2027" : isMonthly ? "28 May - 28 Jun 2026" : "28 May - 28 Aug 2026",
                invoiceNo: `INV-2025-${u.memberId ? u.memberId.slice(-4) : "0000"}`,
                date: "28 May 2026",
                dueDate: "28 May 2026",
                paymentMethod: u.paymentMode === "online" ? "UPI - Razorpay" : "Pay at Gym Desk"
              };
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    // 3. Fallback default
    return defaultMembersDb["IG-2024-0042"];
  }, [id]);

  useEffect(() => {
    setEmailInput(invoice.email);
    setPhoneInput(invoice.mobile.replace("+91 ", ""));
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    toast.info("Generating high-fidelity PDF invoice layout...");
    setTimeout(() => {
      setIsDownloading(false);
      window.print();
    }, 1200);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success(`GST Invoice sent to ${emailInput}!`);
    setEmailModalOpen(false);
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phoneInput.trim())) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }
    toast.success(`Invoice link dispatched to WhatsApp +91 ${phoneInput}!`);
    setWhatsappModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] text-black pb-12 font-sans antialiased relative">
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-shadow-none {
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
          @page {
            size: A4;
            margin: 1.5cm;
          }
        }
      `}</style>

      {/* Control bar / Top bar */}
      <div className="no-print bg-[#0A0A0A] text-white border-b border-[#222] py-4 px-6 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link 
          to="/admin" 
          className="text-xs text-[#8A8A8A] hover:text-white flex items-center gap-1.5 transition-colors uppercase font-bold tracking-wider"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Staff Desk
        </Link>
        <div className="flex gap-2.5">
          <Button 
            onClick={handlePrint}
            className="bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-white text-xs font-bold uppercase py-2 h-9 flex items-center gap-2"
          >
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="bg-white hover:bg-gray-100 text-black text-xs font-bold uppercase py-2 h-9 flex items-center gap-2 border border-gray-300"
          >
            <Download className="h-4 w-4" /> 
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
          <Button 
            onClick={() => setEmailModalOpen(true)}
            className="bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-white text-xs font-bold uppercase py-2 h-9 flex items-center gap-2"
          >
            <Send className="h-4 w-4" /> Send Email
          </Button>
          <Button 
            onClick={() => setWhatsappModalOpen(true)}
            className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold uppercase py-2 h-9 flex items-center gap-2 border-0"
          >
            <Smartphone className="h-4 w-4" /> WhatsApp
          </Button>
        </div>
      </div>

      {/* Invoice Sheet */}
      <div className="print-shadow-none max-w-4xl bg-white text-black shadow-xl border border-gray-200 rounded-xl p-8 md:p-12 mx-auto relative overflow-hidden">
        
        {/* Paid Stamp Diagonal */}
        <div className="absolute top-10 right-10 md:top-14 md:right-16 select-none pointer-events-none transform rotate-12 z-10">
          <div className="border-4 border-[#10B981] text-[#10B981] bg-[#10B981]/5 text-2xl md:text-3xl font-black px-6 py-2 uppercase tracking-widest rounded-lg opacity-85">
            PAID
          </div>
        </div>

        {/* GST TAX INVOICE Header */}
        <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-gray-200 pb-8 gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-wider text-[#E02020]">IRONFORGE GYM</h1>
            <p className="text-xs text-gray-500 max-w-xs font-medium leading-relaxed">
              Plot 42, Road 5, Banjara Hills,<br />
              Hyderabad, Telangana - 500034
            </p>
          </div>
          <div className="text-left md:text-right space-y-1 font-mono text-xs text-gray-600">
            <div className="text-sm font-bold text-black uppercase tracking-wide mb-1 font-sans">Corporate Details</div>
            <div>GSTIN: <strong className="text-black font-semibold">36XXXXX1234X1ZX</strong></div>
            <div>Phone: <strong className="text-black font-semibold">+91 98765 43210</strong></div>
            <div>Email: <strong className="text-black font-semibold">accounts@ironforge.in</strong></div>
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-gray-200">
          {/* Bill To */}
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block">Bill To</span>
            <div className="text-base font-extrabold text-black">{invoice.name}</div>
            <div className="text-xs font-mono text-gray-600 space-y-1">
              <div>Member ID: <strong className="text-black font-semibold">{invoice.memberId}</strong></div>
              <div>Phone: <strong className="text-black font-semibold">{invoice.mobile}</strong></div>
              <div>Email: <strong className="text-black font-semibold">{invoice.email}</strong></div>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="md:text-right space-y-2">
            <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold block md:text-right">Invoice Metadata</span>
            <div className="text-base font-extrabold text-black">{invoice.invoiceNo}</div>
            <div className="text-xs font-mono text-gray-600 space-y-1 md:text-right">
              <div>Invoice Date: <strong className="text-black font-semibold">{invoice.date}</strong></div>
              <div>Due Date: <strong className="text-black font-semibold">{invoice.dueDate}</strong></div>
              <div>Payment Mode: <strong className="text-black font-semibold">{invoice.paymentMethod}</strong></div>
            </div>
          </div>
        </div>

        {/* GST-Itemized Table */}
        <div className="py-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="py-3 text-xs uppercase tracking-widest text-gray-500 font-bold">Item Description</th>
                  <th className="py-3 text-xs uppercase tracking-widest text-gray-500 font-bold">Validity Period</th>
                  <th className="py-3 text-right text-xs uppercase tracking-widest text-gray-500 font-bold">Base Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 text-sm">
                  <td className="py-4">
                    <div className="font-bold text-black">{invoice.plan}</div>
                    <div className="text-xs text-gray-500 mt-1">Access to fitness studios, free weights area & digital locker access.</div>
                  </td>
                  <td className="py-4 text-xs font-mono font-semibold text-gray-600">{invoice.period}</td>
                  <td className="py-4 text-right font-mono font-bold text-black">₹{invoice.baseAmount.toLocaleString("en-IN")}</td>
                </tr>
                <tr className="text-sm">
                  <td className="py-3 text-gray-500">CGST @ 9%</td>
                  <td className="py-3"></td>
                  <td className="py-3 text-right font-mono text-gray-600">₹{(invoice.gstAmount / 2).toLocaleString("en-IN")}</td>
                </tr>
                <tr className="border-b border-gray-200 text-sm">
                  <td className="py-3 text-gray-500">SGST @ 9%</td>
                  <td className="py-3"></td>
                  <td className="py-3 text-right font-mono text-gray-600">₹{(invoice.gstAmount / 2).toLocaleString("en-IN")}</td>
                </tr>
                <tr className="text-base font-extrabold border-b-2 border-gray-300">
                  <td className="py-4 text-black uppercase tracking-wider">Total Amount Paid (Incl. GST)</td>
                  <td className="py-4"></td>
                  <td className="py-4 text-right font-mono text-lg text-black">₹{invoice.amount.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* GST Breakout note & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-gray-500 font-medium">
          <div>
            <div className="font-bold text-black uppercase tracking-wider text-[10px] mb-2">Terms & Conditions</div>
            <ul className="list-decimal pl-4 space-y-1 leading-relaxed">
              <li>Membership subscriptions are strictly non-refundable and non-transferable.</li>
              <li>Please keep a digital copy of this tax invoice for access logging and keycard replacement.</li>
              <li>GST calculation is based on standard 18% services tax schedules in Telangana state.</li>
            </ul>
          </div>
          <div className="md:text-right flex flex-col justify-end">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Authorised Signatory</p>
            <p className="font-display text-lg text-black font-semibold uppercase tracking-wide">IronForge Accounts Desk</p>
            <p className="text-[9px] text-gray-400 font-mono mt-1">Generated electronically, no physical signature required.</p>
          </div>
        </div>
      </div>

      {/* EMAIL MODAL */}
      {emailModalOpen && (
        <div className="no-print fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] text-white border border-[#222] rounded-xl p-6 w-full max-w-md space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-xl uppercase tracking-wide font-bold">Email GST Invoice</h3>
              <button onClick={() => setEmailModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#8A8A8A] font-semibold">Recipient Email Address</label>
                <input 
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#222] text-white text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E02020]"
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="flex gap-2 pt-2 justify-end">
                <Button 
                  type="button" 
                  onClick={() => setEmailModalOpen(false)}
                  className="bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-white text-xs font-bold uppercase"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#E02020] hover:bg-[#C41818] text-white text-xs font-bold uppercase border-0"
                >
                  Dispatch Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WHATSAPP MODAL */}
      {whatsappModalOpen && (
        <div className="no-print fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] text-white border border-[#222] rounded-xl p-6 w-full max-w-md space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-display text-xl uppercase tracking-wide font-bold">WhatsApp Dispatch</h3>
              <button onClick={() => setWhatsappModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSendWhatsApp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider text-[#8A8A8A] font-semibold">Mobile Number (+91)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8A8A8A] font-semibold">+91</span>
                  <input 
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full bg-[#0A0A0A] border border-[#222] text-white text-sm pl-11 pr-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E02020]"
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2 justify-end">
                <Button 
                  type="button" 
                  onClick={() => setWhatsappModalOpen(false)}
                  className="bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] text-white text-xs font-bold uppercase"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold uppercase border-0"
                >
                  Send WhatsApp
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
