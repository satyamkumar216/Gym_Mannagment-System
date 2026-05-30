import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState, useRef, useEffect } from "react";
import {
  ArrowLeft, ArrowRight, Check, X, Dumbbell, CheckCircle2,
  CreditCard, Building2, MessageCircle, Printer, Loader2,
  Download, Eye, EyeOff, Copy
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join Now — IronForge Gym" },
      { name: "description", content: "Sign up for IronForge Gym Hyderabad in 6 quick steps. Personal details, fitness profile, plans and payment." },
    ],
  }),
  component: JoinFlow,
});

type Goal = "Weight Loss" | "Muscle Gain" | "Strength" | "Endurance" | "Flexibility" | "General Fitness";
type Condition = "Heart Issues" | "Diabetes" | "High BP" | "Knee Issues" | "None";
type WorkoutTime = "Morning" | "Evening" | "Flexible" | "";
type PlanKey = "monthly" | "quarterly" | "annual";

interface FormState {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  height: string;
  weight: string;
  bloodGroup: string;
  goals: Goal[];
  conditions: Condition[];
  workoutTime: WorkoutTime;
  emergencyName: string;
  emergencyMobile: string;
  aadhaar: string;

  agreeTerms: boolean;
  agreeAadhaar: boolean;
  agreeWaiver: boolean;
  signature: string;

  plan: PlanKey;
  addPT: boolean;
  addDiet: boolean;
  useEMI: boolean;
  
  paymentMode: "online" | "gym" | "";
}

const initialForm: FormState = {
  fullName: "",
  mobile: "",
  email: "",
  password: "",
  confirmPassword: "",
  
  height: "",
  weight: "",
  bloodGroup: "",
  goals: [],
  conditions: [],
  workoutTime: "",
  emergencyName: "",
  emergencyMobile: "",
  aadhaar: "",

  agreeTerms: false,
  agreeAadhaar: false,
  agreeWaiver: false,
  signature: "",

  plan: "quarterly",
  addPT: false,
  addDiet: false,
  useEMI: false,
  
  paymentMode: "",
};

const plans: Record<PlanKey, { name: string; base: number; period: string; saveText?: string; badge?: string }> = {
  monthly: { name: "Monthly", base: 1499, period: "/mo" },
  quarterly: { name: "Quarterly", base: 3999, period: "/3 mo", saveText: "Saves ₹500", badge: "Most Popular" },
  annual: { name: "Annual", base: 13999, period: "/yr", saveText: "Saves ₹4,989", badge: "Best Value" },
};

const STEPS = [
  "Create Account",
  "Health Profile",
  "Terms & Signature",
  "Choose Plan",
  "Payment Details",
  "Submission Success"
];

function randomDigits(n: number) {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join("");
}

function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

function JoinFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate IDs once on the client
  const memberId = useMemo(() => `IG-2025-${randomDigits(4)}`, []);
  const referenceId = useMemo(() => `IG-REF-${randomDigits(6)}`, []);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Live BMI calculation
  const bmi = useMemo(() => {
    const h = parseFloat(form.height), w = parseFloat(form.weight);
    if (!h || !w) return null;
    const m = h / 100;
    return +(w / (m * m)).toFixed(1);
  }, [form.height, form.weight]);

  const bmiBand = (b: number | null) => {
    if (b === null) return { label: "—", color: "text-[#8A8A8A]" };
    if (b < 18.5) return { label: "Underweight", color: "text-amber-400" };
    if (b < 25) return { label: "Healthy", color: "text-emerald-400" };
    if (b < 30) return { label: "Overweight", color: "text-amber-400" };
    return { label: "Obese", color: "text-red-500" };
  };

  // Pricing calculations
  const planBase = plans[form.plan].base;
  const addonsPerMonth = (form.addPT ? 2000 : 0) + (form.addDiet ? 500 : 0);
  const monthsForAddons = form.plan === "monthly" ? 1 : form.plan === "quarterly" ? 3 : 12;
  const addonsTotal = addonsPerMonth * monthsForAddons;
  const subtotal = planBase + addonsTotal;
  const gst = Math.floor(subtotal * 0.18);
  const total = subtotal + gst;
  const emiAmount = Math.floor(total / 12);

  // Validation checks per step
  const isStepValid = (currentStep: number): boolean => {
    if (currentStep === 0) {
      const isPhoneValid = /^\d{10}$/.test(form.mobile);
      const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
      const isPasswordValid = form.password.length >= 8;
      const isConfirmValid = form.confirmPassword === form.password;
      return (
        form.fullName.trim().length > 0 &&
        isPhoneValid &&
        isEmailValid &&
        isPasswordValid &&
        isConfirmValid
      );
    }
    if (currentStep === 1) {
      const h = parseFloat(form.height);
      const w = parseFloat(form.weight);
      const isHeightValid = !isNaN(h) && h >= 100 && h <= 250;
      const isWeightValid = !isNaN(w) && w >= 25 && w <= 250;
      const isEmergencyPhoneValid = /^\d{10}$/.test(form.emergencyMobile);
      return (
        isHeightValid &&
        isWeightValid &&
        form.bloodGroup !== "" &&
        form.goals.length > 0 &&
        form.conditions.length > 0 &&
        form.workoutTime !== "" &&
        form.emergencyName.trim().length > 0 &&
        isEmergencyPhoneValid
      );
    }
    if (currentStep === 2) {
      const signatureMatch = form.signature.trim().toLowerCase() === form.fullName.trim().toLowerCase();
      const aadhaarFilled = form.aadhaar.length > 0;
      const aadhaarValid = !aadhaarFilled || /^\d{12}$/.test(form.aadhaar);
      const aadhaarConsent = !aadhaarFilled || form.agreeAadhaar;
      return (
        form.agreeTerms &&
        form.agreeWaiver &&
        aadhaarValid &&
        aadhaarConsent &&
        signatureMatch
      );
    }
    if (currentStep === 3) {
      return true; // Plan selection is always pre-selected (quarterly)
    }
    if (currentStep === 4) {
      return form.paymentMode !== "";
    }
    return true;
  };

  const next = () => {
    if (!isStepValid(step)) return;

    if (step === 4) {
      setSubmitting(true);
      // Simulate API submit and persist in localStorage
      setTimeout(() => {
        const newUser = {
          fullName: form.fullName,
          mobile: form.mobile,
          email: form.email,
          password: form.password,
          memberId,
          plan: form.plan,
          paymentMode: form.paymentMode,
          addPT: form.addPT,
          addDiet: form.addDiet,
          totalPrice: total,
          totalPriceFormatted: formatINR(total),
          referenceId: form.paymentMode === "gym" ? referenceId : undefined,
          emergencyName: form.emergencyName,
          emergencyMobile: form.emergencyMobile
        };
        
        // Push user to registered users database in localStorage
        const existingUsers = JSON.parse(localStorage.getItem("registered_users") || "[]");
        localStorage.setItem("registered_users", JSON.stringify([...existingUsers, newUser]));

        setSubmitting(false);
        setStep(5);
        toast.success("Application submitted successfully!");
      }, 1000);
      return;
    }

    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const copyMemberId = () => {
    navigator.clipboard.writeText(memberId);
    setCopied(true);
    toast.success("Member ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadReceipt = () => {
    const receiptText = `=========================================
IRONFORGE GYM - REGISTRATION RECEIPT
=========================================
Reference ID: ${referenceId}
Member ID: ${memberId}
Generated On: ${new Date().toLocaleDateString()}
Valid For: Next 48 Hours

MEMBER DETAILS:
Name: ${form.fullName}
Mobile: +91 ${form.mobile}
Email: ${form.email}

HEALTH PROFILE:
Height: ${form.height} cm
Weight: ${form.weight} kg
Blood Group: ${form.bloodGroup}

MEMBERSHIP DETAILS:
Plan Selected: ${plans[form.plan].name}
Add-ons:
- Personal Training: ${form.addPT ? "Active (+₹2,000/mo)" : "Inactive"}
- Diet Consultation: ${form.addDiet ? "Active (+₹500/mo)" : "Inactive"}

PRICING SUMMARY:
Plan Base: ${formatINR(planBase)}
Add-ons Total: ${formatINR(addonsTotal)}
Subtotal: ${formatINR(subtotal)}
GST (18%): ${formatINR(gst)}
-----------------------------------------
TOTAL AMOUNT DUE: ${formatINR(total)} (incl. GST)
-----------------------------------------

INSTRUCTIONS:
Please visit our Banjara Hills branch within 48 hours to clear payment and activate your biometric login.
Address: Plot 42, Road 5, Banjara Hills, Hyderabad - 500034.

=========================================
Thank you for joining IronForge!
`;
    const blob = new Blob([receiptText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `IronForge_Receipt_${referenceId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Receipt downloaded!");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-between font-sans overflow-x-hidden">
      {/* Top bar & progress */}
      <header className="border-b border-[#1A1A1A] sticky top-0 bg-[#0A0A0A]/95 backdrop-blur z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#E02020] flex items-center justify-center">
              <Dumbbell className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-xl tracking-wide">IronForge Gym</span>
          </Link>
          <Link to="/" className="text-[#8A8A8A] hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </Link>
        </div>
        
        {/* Red step progress bar */}
        <div className="w-full px-4 sm:px-6 pb-4 max-w-5xl mx-auto">
          {/* Desktop: step labels */}
          <div className="hidden md:flex items-center justify-between mb-2 text-xs uppercase tracking-widest text-[#8A8A8A]">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={cn(
                  "flex-1 text-center font-bold truncate px-1",
                  i <= step ? "text-[#E02020]" : "text-[#3A3A3A]"
                )}
              >
                {s}
              </div>
            ))}
          </div>
          {/* Mobile: dot indicators */}
          <div className="flex md:hidden items-center justify-center gap-2 mb-3" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-colors",
                  i <= step ? "bg-[#E02020] scale-110" : "bg-[#1A1A1A] border border-[#333333]"
                )}
                aria-hidden
              />
            ))}
          </div>
          <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#E02020]"
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      </header>

      {/* Main body */}
      <main className="flex-1 flex flex-col justify-center py-6 sm:py-8 px-4 w-full max-w-full sm:max-w-5xl mx-auto min-w-0">
        <div className="w-full max-w-full sm:max-w-3xl mx-auto min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && <Step1CreateAccount form={form} set={set} memberId={memberId} />}
              {step === 1 && <Step2HealthProfile form={form} set={set} bmi={bmi} bmiBand={bmiBand(bmi)} />}
              {step === 2 && <Step3Terms form={form} set={set} />}
              {step === 3 && (
                <Step4ChoosePlan
                  form={form}
                  set={set}
                  planBase={planBase}
                  addonsPerMonth={addonsPerMonth}
                  addonsTotal={addonsTotal}
                  subtotal={subtotal}
                  gst={gst}
                  total={total}
                  emiAmount={emiAmount}
                  monthsForAddons={monthsForAddons}
                />
              )}
              {step === 4 && (
                <Step5Payment
                  form={form}
                  set={set}
                  total={total}
                  referenceId={referenceId}
                  downloadReceipt={downloadReceipt}
                />
              )}
              {step === 5 && (
                <Step6Success
                  fullName={form.fullName}
                  mobile={form.mobile}
                  memberId={memberId}
                  copied={copied}
                  copyMemberId={copyMemberId}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Nav buttons */}
          {step < 5 && (
            <div className="mt-8 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#1A1A1A] pt-6">
              <Button
                variant="outline"
                onClick={back}
                disabled={step === 0}
                className="border-[#222222] bg-transparent text-white hover:bg-[#1A1A1A] disabled:opacity-30 h-11 min-h-[44px] px-5 w-full sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
              </Button>
              <div className="text-xs text-[#8A8A8A] text-center sm:hidden">
                Step {step + 1} of {STEPS.length}
              </div>
              <Button
                onClick={next}
                disabled={submitting || !isStepValid(step)}
                className="bg-[#E02020] hover:bg-[#C41818] text-white font-semibold min-w-0 sm:min-w-[130px] h-11 min-h-[44px] w-full sm:w-auto"
              >
                {submitting ? (
                  <span className="flex items-center gap-1.5"><Loader2 className="h-4 w-4 animate-spin" /> Submitting</span>
                ) : step === 4 ? (
                  <span className="flex items-center gap-1.5">Submit Application <ArrowRight className="h-4 w-4" /></span>
                ) : (
                  <span className="flex items-center gap-1.5">Continue <ArrowRight className="h-4 w-4" /></span>
                )}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Mini footer */}
      <footer className="border-t border-[#1A1A1A] py-4 text-center text-xs text-[#555555]">
        IronForge Gym Banjara Hills, Hyderabad. Dedicated to Strength.
      </footer>
    </div>
  );
}

// ================= STEP 1: CREATE ACCOUNT =================
function Step1CreateAccount({
  form, set, memberId
}: { form: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void; memberId: string }) {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);

  // Password strength logic
  const pwdStrength = useMemo(() => {
    const p = form.password;
    if (!p) return { score: 0, label: "Empty", color: "bg-[#222222]" };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    switch (score) {
      case 1: return { score: 1, label: "Weak (Requires min 8 chars)", color: "bg-red-500" };
      case 2: return { score: 2, label: "Medium (Mix letters & digits)", color: "bg-amber-500" };
      case 3: return { score: 3, label: "Good (Add capital & special)", color: "bg-indigo-500" };
      case 4: return { score: 4, label: "Strong! Ready to Lift", color: "bg-emerald-500" };
      default: return { score: 0, label: "Too Weak", color: "bg-red-500" };
    }
  }, [form.password]);

  const confirmPwdMatch = form.confirmPassword ? form.confirmPassword === form.password : true;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-4xl uppercase tracking-wide break-words">Create Your Account</h2>
        <p className="text-sm text-[#8A8A8A] mt-1">Get started on your fitness journey with IronForge.</p>
      </div>

      <div className="rounded-xl bg-[#111111] border border-[#222222] px-4 py-3 flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-[#8A8A8A]">Generated Member ID</span>
        <span className="font-display text-lg text-[#8A8A8A] select-none bg-[#1A1A1A] border border-[#222222] px-3 py-0.5 rounded">{memberId}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Full Name</Label>
          <Input
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="Rahul Sharma"
            required
            className="bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Mobile Number</Label>
          <div className="flex gap-2">
            <span className="flex items-center justify-center px-3 rounded-md bg-[#111111] border border-[#222222] text-sm text-[#8A8A8A] font-medium">+91</span>
            <Input
              value={form.mobile}
              onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876543210"
              inputMode="numeric"
              required
              className="bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020] flex-1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Email Address</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="rahul@example.com"
            required
            className="bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Create Password</Label>
          <div className="relative">
            <Input
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="Min 8 characters"
              required
              className="bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-white"
            >
              {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Strength Indicator */}
          {form.password && (
            <div className="space-y-1 pt-1">
              <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                <div
                  className={cn("h-full transition-all duration-300", pwdStrength.color)}
                  style={{ width: `${(pwdStrength.score / 4) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-[#8A8A8A] flex justify-between">
                <span>Password Strength</span>
                <span className="font-semibold text-white">{pwdStrength.label}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Confirm Password</Label>
          <div className="relative">
            <Input
              type={showConfirmPwd ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => set("confirmPassword", e.target.value)}
              placeholder="Confirm password"
              required
              className={cn(
                "bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020] pr-10",
                !confirmPwdMatch && "border-red-500 focus-visible:ring-red-500"
              )}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPwd(!showConfirmPwd)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-white"
            >
              {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {!confirmPwdMatch && (
            <span className="text-[10px] text-red-400 block mt-1">Passwords do not match</span>
          )}
        </div>
      </div>

      <div className="p-4 rounded-lg bg-[#E02020]/5 border border-[#E02020]/20 text-xs text-[#CFCFCF] leading-relaxed">
        <strong>Important:</strong> Remember your password — you'll use it along with your phone number to login to your dashboard.
      </div>
    </div>
  );
}

// ================= STEP 2: HEALTH PROFILE =================
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const GOALS: Goal[] = ["Weight Loss", "Muscle Gain", "Strength", "Endurance", "Flexibility", "General Fitness"];
const CONDITIONS: Condition[] = ["Heart Issues", "Diabetes", "High BP", "Knee Issues", "None"];

function Step2HealthProfile({
  form, set, bmi, bmiBand
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  bmi: number | null;
  bmiBand: { label: string; color: string };
}) {
  const toggleGoal = (g: Goal) => {
    if (form.goals.includes(g)) {
      set("goals", form.goals.filter(x => x !== g));
    } else {
      set("goals", [...form.goals, g]);
    }
  };

  const toggleCondition = (c: Condition) => {
    if (c === "None") {
      set("conditions", ["None"]);
    } else {
      const filtered = form.conditions.filter(x => x !== "None");
      if (filtered.includes(c)) {
        const next = filtered.filter(x => x !== c);
        set("conditions", next.length === 0 ? ["None"] : next);
      } else {
        set("conditions", [...filtered, c]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-4xl uppercase tracking-wide break-words">Health & Fitness Profile</h2>
        <p className="text-sm text-[#8A8A8A] mt-1">Provide details to help our training staff coordinate workouts safely.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Height (cm)</Label>
          <Input
            value={form.height}
            onChange={(e) => set("height", e.target.value.replace(/[^\d]/g, ""))}
            placeholder="175"
            inputMode="numeric"
            className="bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Weight (kg)</Label>
          <Input
            value={form.weight}
            onChange={(e) => set("weight", e.target.value.replace(/[^\d]/g, ""))}
            placeholder="72"
            inputMode="numeric"
            className="bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020]"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">BMI Status</Label>
          <div className="h-11 rounded-md bg-[#111111] border border-[#222222] px-3 flex items-center justify-between">
            <span className="font-display text-lg tracking-wide">{bmi ?? "—"}</span>
            <span className={cn("text-xs font-bold", bmiBand.color)}>{bmiBand.label}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Blood Group</Label>
          <Select value={form.bloodGroup} onValueChange={(v) => set("bloodGroup", v)}>
            <SelectTrigger className="bg-[#0A0A0A] border-[#222222] h-11 focus:ring-[#E02020]">
              <SelectValue placeholder="Select Blood Group" />
            </SelectTrigger>
            <SelectContent className="bg-[#111111] border-[#222222] text-white">
              {BLOOD_GROUPS.map(bg => (
                <SelectItem key={bg} value={bg} className="focus:bg-[#E02020] focus:text-white">{bg}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Aadhaar (Optional for KYC)</Label>
          <Input
            value={form.aadhaar}
            onChange={(e) => set("aadhaar", e.target.value.replace(/\D/g, "").slice(0, 12))}
            placeholder="XXXX XXXX XXXX"
            inputMode="numeric"
            className="bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020] tracking-widest"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold block">Fitness Goals</Label>
        <div className="flex flex-wrap gap-2">
          {GOALS.map(g => {
            const active = form.goals.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGoal(g)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                  active
                    ? "bg-[#E02020] border-[#E02020] text-white"
                    : "bg-[#111111] border-[#222222] text-[#8A8A8A] hover:border-[#E02020]/40"
                )}
              >
                {active && <Check className="inline h-3.5 w-3.5 mr-1" />}
                {g}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold block">Medical Conditions</Label>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map(c => {
            const active = form.conditions.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => toggleCondition(c)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors",
                  active
                    ? "bg-[#E02020] border-[#E02020] text-white"
                    : "bg-[#111111] border-[#222222] text-[#8A8A8A] hover:border-[#E02020]/40"
                )}
              >
                {active && <Check className="inline h-3.5 w-3.5 mr-1" />}
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Preferred Time Segment</Label>
          <Select value={form.workoutTime} onValueChange={(v) => set("workoutTime", v as WorkoutTime)}>
            <SelectTrigger className="bg-[#0A0A0A] border-[#222222] h-11 focus:ring-[#E02020]">
              <SelectValue placeholder="Select Preferred Time" />
            </SelectTrigger>
            <SelectContent className="bg-[#111111] border-[#222222] text-white">
              <SelectItem value="Morning">Morning (5 - 9 AM)</SelectItem>
              <SelectItem value="Evening">Evening (5 - 9 PM)</SelectItem>
              <SelectItem value="Flexible">Flexible / Anytime</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Emergency Contact Name</Label>
          <Input
            value={form.emergencyName}
            onChange={(e) => set("emergencyName", e.target.value)}
            placeholder="Parent / Spouse / Friend"
            className="bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020]"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Emergency Mobile Number</Label>
          <div className="flex gap-2">
            <span className="flex items-center justify-center px-3 rounded-md bg-[#111111] border border-[#222222] text-sm text-[#8A8A8A] font-medium">+91</span>
            <Input
              value={form.emergencyMobile}
              onChange={(e) => set("emergencyMobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="9876501234"
              inputMode="numeric"
              className="bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020] flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ================= STEP 3: TERMS & DIGITAL SIGNATURE =================
function Step3Terms({
  form, set
}: { form: FormState; set: <K extends keyof FormState>(k: K, v: FormState[K]) => void }) {
  const termsRef = useRef<HTMLDivElement>(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = () => {
    const el = termsRef.current;
    if (!el) return;
    
    // Check if scrolled near bottom (with 4px buffer)
    const reached = el.scrollHeight - el.scrollTop - el.clientHeight <= 4;
    if (reached) {
      setScrolledToBottom(true);
    }
  };

  // Run scroll check on load in case the content is small and doesn't need scroll
  useEffect(() => {
    const el = termsRef.current;
    if (el) {
      if (el.scrollHeight <= el.clientHeight) {
        setScrolledToBottom(true);
      }
    }
  }, []);

  const signatureMatches = form.signature.trim().toLowerCase() === form.fullName.trim().toLowerCase();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-4xl uppercase tracking-wide break-words">Terms & Digital Signature</h2>
        <p className="text-sm text-[#8A8A8A] mt-1">Review guidelines and digitally sign your agreement.</p>
      </div>

      <div
        ref={termsRef}
        onScroll={handleScroll}
        className="rounded-xl bg-[#111111] border border-[#222222] p-5 max-h-56 overflow-y-auto text-xs text-[#8A8A8A] space-y-3 leading-relaxed"
      >
        <p><strong className="text-white">1. Membership & Access.</strong> Membership is personal and non-transferable. Members must carry their pass or check in biometric details at reception.</p>
        <p><strong className="text-white">2. Health Declaration.</strong> You declare that you are in good physical condition and have no medical impairments that would prevent you from exercising safely. You agree to seek advice from gym trainers or doctors prior to using specialized equipment.</p>
        <p><strong className="text-white">3. Liability Waiver.</strong> Physical activity involves risks. By signing, you acknowledge and agree that IronForge Gym, its owners, and trainers shall not be held liable for any damages or injuries unless caused by gross negligence.</p>
        <p><strong className="text-white">4. Payment & Cancellation.</strong> Subscription plan fees are inclusive of GST. Plans are non-refundable. Pauses/extensions are only allowed under specific medical or travel circumstances with validation.</p>
        <p><strong className="text-white">5. Code of Conduct.</strong> We expect all members to wipe down equipment after use, re-rack weights, and treat staff and other members with respect. Failure to follow safety protocols will result in suspension.</p>
        <p><strong className="text-white">6. Data Consent.</strong> We store basic contact and medical details solely to support training recommendations. If Aadhaar KYC is completed, it is securely held for validation and will not be shared externally.</p>
        <p className="text-center font-bold text-white pt-2 border-t border-[#222222]">*** END OF AGREEMENT ***</p>
      </div>

      {!scrolledToBottom && (
        <div className="text-[10px] text-amber-500 font-medium animate-pulse text-center">
          ⚠ Please scroll to the bottom of the terms box to unlock the agreement checkbox.
        </div>
      )}

      <div className="space-y-3">
        <label className={cn(
          "flex items-start gap-3 rounded-lg bg-[#111111] border px-4 py-3 transition-all select-none",
          scrolledToBottom ? "border-[#222222] cursor-pointer hover:border-[#E02020]/40" : "border-[#1A1A1A] opacity-40 cursor-not-allowed"
        )}>
          <Checkbox
            checked={form.agreeTerms}
            onCheckedChange={(v) => scrolledToBottom && set("agreeTerms", Boolean(v))}
            disabled={!scrolledToBottom}
            className="mt-0.5"
          />
          <span className="text-xs text-[#CFCFCF]">I agree to IronForge Gym terms and conditions (requires reading terms).</span>
        </label>

        {form.aadhaar && (
          <label className="flex items-start gap-3 rounded-lg bg-[#111111] border border-[#222222] px-4 py-3 cursor-pointer hover:border-[#E02020]/40 transition-colors">
            <Checkbox
              checked={form.agreeAadhaar}
              onCheckedChange={(v) => set("agreeAadhaar", Boolean(v))}
              className="mt-0.5"
            />
            <span className="text-xs text-[#CFCFCF]">I consent to Aadhaar data usage for identity validation and KYC.</span>
          </label>
        )}

        <label className="flex items-start gap-3 rounded-lg bg-[#111111] border border-[#222222] px-4 py-3 cursor-pointer hover:border-[#E02020]/40 transition-colors">
          <Checkbox
            checked={form.agreeWaiver}
            onCheckedChange={(v) => set("agreeWaiver", Boolean(v))}
            className="mt-0.5"
          />
          <span className="text-xs text-[#CFCFCF]">I accept the liability waiver and health responsibility.</span>
        </label>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold block">
          Digital Signature (Type your full name exactly: <span className="text-white italic">{form.fullName || "Rahul Sharma"}</span>)
        </Label>
        <Input
          value={form.signature}
          onChange={(e) => set("signature", e.target.value)}
          placeholder={form.fullName || "Rahul Sharma"}
          className={cn(
            "bg-[#0A0A0A] border-[#222222] h-12 font-display text-lg tracking-wide uppercase focus-visible:ring-[#E02020]",
            form.signature && !signatureMatches && "border-red-500 focus-visible:ring-red-500"
          )}
        />
        {form.signature && !signatureMatches && (
          <span className="text-[10px] text-red-400 block mt-1">Signature must match the Full Name in Step 1 exactly (case insensitive).</span>
        )}
      </div>
    </div>
  );
}

// ================= STEP 4: CHOOSE PLAN =================
function Step4ChoosePlan({
  form, set, planBase, addonsPerMonth, addonsTotal, subtotal, gst, total, emiAmount, monthsForAddons
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  planBase: number;
  addonsPerMonth: number;
  addonsTotal: number;
  subtotal: number;
  gst: number;
  total: number;
  emiAmount: number;
  monthsForAddons: number;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-4xl uppercase tracking-wide break-words">Choose Your Plan</h2>
        <p className="text-sm text-[#8A8A8A] mt-1">All subscription fees include 18% GST in final invoice.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.keys(plans) as PlanKey[]).map(key => {
          const p = plans[key];
          const active = form.plan === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => set("plan", key)}
              className={cn(
                "relative text-left rounded-xl border p-5 bg-[#111111] transition-all flex flex-col justify-between h-44",
                active 
                  ? "border-[#E02020] ring-1 ring-[#E02020] shadow-lg shadow-[#E02020]/10" 
                  : "border-[#222222] hover:border-[#E02020]/40"
              )}
            >
              {p.badge && (
                <div className="absolute -top-2.5 left-4 bg-[#E02020] text-white text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {p.badge}
                </div>
              )}
              <div className="space-y-1">
                <div className="font-display text-xl tracking-wide uppercase">{p.name}</div>
                {p.saveText && <div className="text-[10px] text-emerald-400 font-bold uppercase">{p.saveText}</div>}
              </div>

              <div className="space-y-1 mt-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold">{formatINR(p.base)}</span>
                  <span className="text-[10px] text-[#8A8A8A] uppercase font-semibold">{p.period}</span>
                </div>
                <div className="text-[10px] text-[#8A8A8A] leading-none">
                  {key === "monthly" ? "₹1,499 bill / mo" : key === "quarterly" ? "₹1,333 effective / mo" : "₹1,166 effective / mo"}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Addons section */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Select Training Add-ons (Optional)</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className={cn(
            "flex items-center justify-between rounded-xl border px-4 py-3.5 cursor-pointer transition-colors bg-[#111111]",
            form.addPT ? "border-[#E02020]" : "border-[#222222] hover:border-[#E02020]/40"
          )}>
            <div className="flex items-center gap-3">
              <Checkbox checked={form.addPT} onCheckedChange={(v) => set("addPT", Boolean(v))} />
              <div>
                <div className="text-sm font-semibold text-white">Personal Training</div>
                <div className="text-xs text-[#8A8A8A]">Get assigned a personal coach</div>
              </div>
            </div>
            <span className="text-xs font-bold text-white shrink-0">+₹2,000/mo</span>
          </label>

          <label className={cn(
            "flex items-center justify-between rounded-xl border px-4 py-3.5 cursor-pointer transition-colors bg-[#111111]",
            form.addDiet ? "border-[#E02020]" : "border-[#222222] hover:border-[#E02020]/40"
          )}>
            <div className="flex items-center gap-3">
              <Checkbox checked={form.addDiet} onCheckedChange={(v) => set("addDiet", Boolean(v))} />
              <div>
                <div className="text-sm font-semibold text-white">Diet Consultation</div>
                <div className="text-xs text-[#8A8A8A]">Custom monthly diet matrices</div>
              </div>
            </div>
            <span className="text-xs font-bold text-white shrink-0">+₹500/mo</span>
          </label>
        </div>
      </div>

      {/* EMI option for Annual Plan */}
      {form.plan === "annual" && (
        <div className="rounded-xl bg-[#E02020]/5 border border-[#E02020]/25 p-4 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-white font-bold">No-Cost EMI Available</div>
            <div className="text-xs text-[#8A8A8A] mt-0.5">Pay only {formatINR(emiAmount)}/month for 12 months.</div>
          </div>
          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer shrink-0">
            <Checkbox checked={form.useEMI} onCheckedChange={(v) => set("useEMI", Boolean(v))} />
            <span>Enable EMI Payment</span>
          </label>
        </div>
      )}

      {/* Live Order Summary */}
      <div className="rounded-xl bg-[#111111] border border-[#222222] p-5 space-y-3">
        <h3 className="font-display text-lg tracking-wide uppercase text-white pb-2 border-b border-[#222222]">Order Summary</h3>
        <div className="flex justify-between text-xs text-[#CFCFCF]">
          <span>{plans[form.plan].name} Base Gym Access</span>
          <span>{formatINR(planBase)}</span>
        </div>
        {addonsTotal > 0 && (
          <div className="flex justify-between text-xs text-[#CFCFCF]">
            <span>Addons ({formatINR(addonsPerMonth)}/mo × {monthsForAddons} months)</span>
            <span>{formatINR(addonsTotal)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs text-[#CFCFCF]">
          <span>Subtotal</span>
          <span>{formatINR(subtotal)}</span>
        </div>
        <div className="flex justify-between text-xs text-[#CFCFCF]">
          <span>GST (18%)</span>
          <span>{formatINR(gst)}</span>
        </div>
        <div className="border-t border-[#222222] my-2 pt-2 flex justify-between items-baseline">
          <span className="font-bold text-sm uppercase">Total Due (Incl. GST)</span>
          <span className="font-display text-2xl text-[#E02020] font-semibold">
            {formatINR(total)}
          </span>
        </div>
        {form.plan === "annual" && form.useEMI && (
          <div className="text-[10px] text-[#8A8A8A] text-right">
            (Equivalent to {formatINR(emiAmount)}/month for 12 months)
          </div>
        )}
      </div>
    </div>
  );
}

// ================= STEP 5: PAYMENT OPTION =================
function Step5Payment({
  form, set, total, referenceId, downloadReceipt
}: {
  form: FormState;
  set: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
  total: number;
  referenceId: string;
  downloadReceipt: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl sm:text-4xl uppercase tracking-wide break-words">Complete Payment</h2>
        <p className="text-sm text-[#8A8A8A] mt-1">Select your preferred payment path below.</p>
      </div>

      <RadioGroup
        value={form.paymentMode}
        onValueChange={(v) => set("paymentMode", v as FormState["paymentMode"])}
        className="flex flex-col gap-3"
      >
        {/* Online Razorpay Card */}
        <div className={cn(
          "rounded-xl border p-5 transition-all bg-[#111111] w-full",
          form.paymentMode === "online" ? "border-[#E02020] shadow-lg shadow-[#E02020]/5" : "border-[#222222]"
        )}>
          <div className="flex items-start gap-3">
            <RadioGroupItem value="online" id="pay-online" className="mt-1 border-[#333] text-[#E02020]" />
            <div className="flex-1 space-y-1">
              <label htmlFor="pay-online" className="font-bold text-sm text-white cursor-pointer flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#E02020]" /> Pay Online via Razorpay
              </label>
              <p className="text-xs text-[#8A8A8A]">Instant activation. Accepts UPI, Credit/Debit Cards, Net Banking, and Wallet.</p>
              
              {form.paymentMode === "online" && (
                <div className="pt-3">
                  <Button
                    type="button"
                    onClick={(e) => { e.preventDefault(); toast.success("Razorpay gateway loaded! (Simulation Mode)"); }}
                    className="bg-[#E02020] hover:bg-[#C41818] text-white font-bold text-xs h-10 px-4"
                  >
                    Pay {formatINR(total)} via Razorpay
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pay at Gym Card */}
        <div className={cn(
          "rounded-xl border p-5 transition-all bg-[#111111]",
          form.paymentMode === "gym" ? "border-[#E02020] shadow-lg shadow-[#E02020]/5" : "border-[#222222]"
        )}>
          <div className="flex items-start gap-3">
            <RadioGroupItem value="gym" id="pay-gym" className="mt-1 border-[#333] text-[#E02020]" />
            <div className="flex-1 space-y-1">
              <label htmlFor="pay-gym" className="font-bold text-sm text-white cursor-pointer flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#E02020]" /> Pay at Gym Desk
              </label>
              <p className="text-xs text-[#8A8A8A]">Generate reference invoice. Pay cash/card at our reception desk within 48 hours.</p>

              {form.paymentMode === "gym" && (
                <div className="pt-4 space-y-4">
                  {/* Detailed receipt card */}
                  <div className="rounded-lg bg-[#0A0A0A] border border-dashed border-[#E02020]/30 p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                      <div>
                        <div className="text-[9px] uppercase tracking-widest text-[#8A8A8A]">Invoice Reference ID</div>
                        <div className="font-display text-2xl text-[#E02020] font-semibold mt-0.5">{referenceId}</div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          to="/receipt/$refid"
                          params={{ refid: referenceId }}
                          target="_blank"
                          className="text-[10px] text-white hover:bg-[#E02020] flex items-center gap-1 bg-[#1A1A1A] border border-[#222222] px-2 py-1 rounded transition-colors"
                        >
                          Digital Page
                        </Link>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="text-[10px] text-[#8A8A8A] hover:text-white flex items-center gap-1 bg-[#111111] border border-[#222222] px-2 py-1 rounded"
                        >
                          <Printer className="h-3 w-3" /> Print
                        </button>
                        <button
                          type="button"
                          onClick={downloadReceipt}
                          className="text-[10px] text-[#8A8A8A] hover:text-white flex items-center gap-1 bg-[#111111] border border-[#222222] px-2 py-1 rounded transition-colors"
                        >
                          <Download className="h-3 w-3" /> Save File
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs text-[#CFCFCF]">
                      <div>
                        <div className="text-[#8A8A8A]">Member Name</div>
                        <div className="font-semibold text-white">{form.fullName}</div>
                      </div>
                      <div>
                        <div className="text-[#8A8A8A]">Total Amount Due</div>
                        <div className="font-semibold text-[#E02020]">{formatINR(total)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] leading-relaxed pt-2 border-t border-[#222222] text-[#8A8A8A]">
                      <div>
                        <strong>Instructions:</strong> Please present this Reference ID to the gym staff within 48 hours. Bring a valid government photo ID card.
                      </div>
                      <div>
                        <strong>సూచనలు (Telugu):</strong> దయచేసి 48 గంటలలోపు ఈ రిఫరెన్స్ నంబర్‌తో జిమ్‌ను సందర్శించండి. ఏదైనా ప్రభుత్వ ఫోటో ఐడీ తీసుకురండి.
                      </div>
                    </div>
                    
                    <div className="text-[10px] text-[#8A8A8A] pt-1">
                      <strong>Branch Address:</strong> Plot 42, Road 5, Banjara Hills, Hyderabad - 500034.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </RadioGroup>
    </div>
  );
}

// ================= STEP 6: SUBMISSION SUCCESS =================
function Step6Success({
  fullName, mobile, memberId, copied, copyMemberId
}: {
  fullName: string;
  mobile: string;
  memberId: string;
  copied: boolean;
  copyMemberId: () => void;
}) {
  const navigate = useNavigate();
  const maskMobile = (m: string) => {
    const formatted = m.replace(/\D/g, "");
    if (formatted.length < 10) return m;
    return `+91 ${formatted.slice(0,5)} ${formatted.slice(5)}`;
  };

  const whatsappLink = `https://wa.me/919876543210?text=${encodeURIComponent(
    `Hi IronForge Gym, my name is ${fullName}. I just registered online! Member ID: ${memberId}.`
  )}`;

  // Automatically log user in upon completion and direct them properly
  const handleGoToLogin = () => {
    // Locate the registered user from localStorage and set as logged in
    const usersStr = localStorage.getItem("registered_users");
    if (usersStr) {
      try {
        const users = JSON.parse(usersStr);
        const thisUser = users.find((u: any) => u.memberId === memberId);
        if (thisUser) {
          localStorage.setItem("is_member_logged_in", "true");
          localStorage.setItem("logged_in_member", JSON.stringify(thisUser));
          navigate({ to: "/dashboard" });
          return;
        }
      } catch (err) {
        console.error(err);
      }
    }
    navigate({ to: "/login" });
  };

  return (
    <div className="text-center py-6 space-y-6">
      {/* Animated Success Ring */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 14 }}
          className="h-20 w-20 rounded-full bg-[#E02020]/15 border border-[#E02020] flex items-center justify-center"
        >
          <CheckCircle2 className="h-10 w-10 text-[#E02020]" />
        </motion.div>
      </div>

      <div className="space-y-2">
        <h2 className="font-display text-4xl sm:text-5xl uppercase tracking-wide">APPLICATION SUBMITTED!</h2>
        <p className="text-lg font-bold text-[#E02020]">Welcome to the Forge, {fullName}! 🎉</p>
        <p className="text-sm text-[#8A8A8A] max-w-md mx-auto">
          Your membership details have been stored. Account activation takes up to 24 hours after verification.
        </p>
      </div>

      {/* Member ID Copy Section */}
      <div className="max-w-md mx-auto rounded-xl bg-[#111111] border border-[#222222] p-5 space-y-4 text-left shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-[#8A8A8A]">Your Member ID</div>
            <div className="font-display text-2xl text-white tracking-wide mt-0.5">{memberId}</div>
          </div>
          <Button
            size="sm"
            onClick={copyMemberId}
            variant="outline"
            className="border-[#222222] bg-[#0A0A0A] hover:bg-[#1A1A1A] h-9 px-3 text-xs"
          >
            {copied ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold"><Check className="h-3.5 w-3.5" /> Copied!</span>
            ) : (
              <span className="flex items-center gap-1"><Copy className="h-3.5 w-3.5" /> Copy ID</span>
            )}
          </Button>
        </div>
        
        <div className="border-t border-[#222222] pt-3 text-[11px] text-[#8A8A8A] leading-relaxed">
          An SMS confirmation has been dispatched to <strong>{maskMobile(mobile)}</strong>. Login credentials will be active immediately once verified.
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
        <Button
          onClick={handleGoToLogin}
          className="bg-[#E02020] hover:bg-[#C41818] text-white h-11 px-6 font-semibold"
        >
          Go to Member Login
        </Button>
        
        <Link to="/">
          <Button
            variant="outline"
            className="border-[#222222] bg-transparent text-white hover:bg-[#1A1A1A] h-11 px-6 font-semibold"
          >
            Back to Home
          </Button>
        </Link>

        <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-block">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 px-6 font-semibold"
          >
            <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp Support
          </Button>
        </a>
      </div>
    </div>
  );
}
