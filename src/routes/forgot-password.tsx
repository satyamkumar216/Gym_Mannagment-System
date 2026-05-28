import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import { Dumbbell, ArrowLeft, KeyRound, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — IronForge Gym" },
      { name: "description", content: "Reset your IronForge Gym password using mobile verification." },
    ],
  }),
  component: ForgotPassword,
});

type Step = "mobile" | "otp" | "reset" | "success";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("mobile");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  
  const [timer, setTimer] = useState(60);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [loading, setLoading] = useState(false);

  // OTP resend timer countdown
  useEffect(() => {
    if (step === "otp" && timer > 0) {
      timerRef.current = setTimeout(() => setTimer((t) => t - 1), 1000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step, timer]);

  const startTimer = () => {
    setTimer(60);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      startTimer();
      toast.success("OTP sent to +91 " + phone);
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      toast.error("Enter a 6-digit OTP code");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Simulate verification (any 6 digit OTP works for demo)
      setStep("reset");
      toast.success("OTP verified successfully!");
    }, 800);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      // Find and update the user's password in localStorage
      const usersStr = localStorage.getItem("registered_users");
      if (usersStr) {
        try {
          const users = JSON.parse(usersStr);
          if (Array.isArray(users)) {
            const updatedUsers = users.map((u: any) => {
              if (u.mobile.replace(/\D/g, "") === phone) {
                return { ...u, password };
              }
              return u;
            });
            localStorage.setItem("registered_users", JSON.stringify(updatedUsers));
          }
        } catch (err) {
          console.error("Error updating password in local DB", err);
        }
      }

      setLoading(false);
      setStep("success");
      toast.success("Password reset completed successfully!");
    }, 1000);
  };

  const handleResendOtp = () => {
    if (timer > 0) return;
    toast.success("New OTP sent to +91 " + phone);
    startTimer();
  };

  // Password strength logic
  const pwdStrength = useMemo(() => {
    const p = password;
    if (!p) return { score: 0, label: "Empty", color: "bg-[#222222]" };
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    switch (score) {
      case 1: return { score: 1, label: "Weak", color: "bg-red-500" };
      case 2: return { score: 2, label: "Medium", color: "bg-amber-500" };
      case 3: return { score: 3, label: "Good", color: "bg-indigo-500" };
      case 4: return { score: 4, label: "Strong", color: "bg-emerald-500" };
      default: return { score: 0, label: "Weak", color: "bg-red-500" };
    }
  }, [password]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#E02020] opacity-5 blur-[120px] pointer-events-none" />

      <Link to="/login" className="absolute top-6 left-6 text-sm text-[#8A8A8A] hover:text-white flex items-center gap-1.5 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Login
      </Link>

      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-[#E02020] items-center justify-center mb-4">
            <Dumbbell className="h-6 w-6 text-white" />
          </div>
          <h1 className="font-display text-4xl tracking-wide uppercase">Password Recovery</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">Reset your membership credentials</p>
        </div>

        <div className="rounded-2xl bg-[#111111] border border-[#222222] p-6 shadow-xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === "mobile" && (
              <motion.form
                key="mobile"
                onSubmit={handleSendOtp}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Mobile Number</Label>
                  <div className="flex gap-2">
                    <span className="flex items-center justify-center px-3 rounded-md bg-[#0A0A0A] border border-[#222222] text-sm text-[#8A8A8A] font-semibold">+91</span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      required
                      className="bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020] flex-1"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading || phone.length !== 10}
                  className="w-full bg-[#E02020] hover:bg-[#C41818] text-white h-11 font-semibold mt-2"
                >
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : "Send Verification OTP"}
                </Button>
              </motion.form>
            )}

            {step === "otp" && (
              <motion.form
                key="otp"
                onSubmit={handleVerifyOtp}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <Label htmlFor="otp" className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Enter 6-Digit OTP</Label>
                    <span className="text-[10px] text-[#8A8A8A]">Sent to +91 {phone}</span>
                  </div>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    inputMode="numeric"
                    className="bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020] text-center tracking-[1em] text-lg font-bold pl-[1em]"
                  />
                </div>

                <div className="flex justify-between items-center text-xs text-[#8A8A8A] pt-1">
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={timer > 0}
                    className={cn(
                      "font-semibold transition-colors",
                      timer > 0 ? "text-[#555555] cursor-not-allowed" : "text-[#E02020] hover:underline"
                    )}
                  >
                    {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-[#E02020] hover:bg-[#C41818] text-white h-11 font-semibold mt-2"
                >
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verifying...</> : "Verify OTP Code"}
                </Button>
              </motion.form>
            )}

            {step === "reset" && (
              <motion.form
                key="reset"
                onSubmit={handleResetPassword}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPwd ? "text" : "password"}
                      placeholder="Min 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                  {/* Strength Bar */}
                  {password && (
                    <div className="space-y-1 pt-1">
                      <div className="h-1.5 w-full bg-[#1A1A1A] rounded-full overflow-hidden">
                        <div
                          className={cn("h-full transition-all duration-300", pwdStrength.color)}
                          style={{ width: `${(pwdStrength.score / 4) * 100}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-[#8A8A8A] flex justify-between">
                        <span>Complexity</span>
                        <span className="font-semibold text-white">{pwdStrength.label}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm"
                      type={showConfirmPwd ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-white"
                    >
                      {showConfirmPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading || password.length < 8 || password !== confirmPassword}
                  className="w-full bg-[#E02020] hover:bg-[#C41818] text-white h-11 font-semibold mt-2"
                >
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Resetting...</> : "Update Password"}
                </Button>
              </motion.form>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4 space-y-4"
              >
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-base text-white">Password Reset Successful!</h3>
                  <p className="text-xs text-[#8A8A8A]">Your credentials have been securely updated. You can now log in.</p>
                </div>
                <Button
                  onClick={() => navigate({ to: "/login" })}
                  className="w-full bg-[#E02020] hover:bg-[#C41818] text-white h-11 font-semibold mt-2"
                >
                  Go to Login Portal
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
