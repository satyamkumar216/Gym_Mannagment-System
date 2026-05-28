import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Eye, EyeOff, Lock, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Member Login — IronForge Gym" },
      { name: "description", content: "Access your IronForge Gym Member Dashboard." },
    ],
  }),
  component: MemberLogin,
});

function MemberLogin() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formattedPhone = phone.replace(/\D/g, "");
    if (formattedPhone.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    setTimeout(() => {
      // 1. Fetch registered users from localStorage
      const usersStr = localStorage.getItem("registered_users");
      let authenticatedUser: any = null;

      if (usersStr) {
        try {
          const users = JSON.parse(usersStr);
          if (Array.isArray(users)) {
            // Find user in registered list
            const index = users.findIndex(
              (u: any) => u.mobile.replace(/\D/g, "") === formattedPhone && u.password === password
            );
            if (index !== -1) {
              authenticatedUser = users[index];
              
              // Simulate first login: if the user was recently approved in the admin queue,
              // we flag their session with isFirstLogin: true.
              // We'll set a flag on the user object itself if they are approved but haven't completed first login.
              if (!authenticatedUser.firstLoginCompleted) {
                authenticatedUser.isFirstLogin = true;
                // Mark in db as completed so it doesn't show next time
                users[index].firstLoginCompleted = true;
                localStorage.setItem("registered_users", JSON.stringify(users));
              }
            }
          }
        } catch (err) {
          console.error("Error parsing users database", err);
        }
      }

      if (authenticatedUser) {
        localStorage.setItem("is_member_logged_in", "true");
        localStorage.setItem("logged_in_member", JSON.stringify(authenticatedUser));
        toast.success(`Welcome back, ${authenticatedUser.fullName}!`);
        navigate({ to: "/dashboard" });
      } else {
        // Check for fallback demo account credentials
        if (formattedPhone === "9876543210" && password === "password123") {
          const demoUser = {
            fullName: "Rahul Sharma",
            mobile: "9876543210",
            email: "rahul@example.com",
            memberId: "IG-2024-0042",
            plan: "quarterly",
            paymentMode: "gym" as const,
            addPT: true,
            addDiet: false,
            totalPriceFormatted: "₹3,999",
            referenceId: "IG-REF-284751",
            emergencyName: "Sunita Sharma",
            emergencyMobile: "+91 98760 11111",
            isFirstLogin: false // Demo user is already active/seasoned
          };
          localStorage.setItem("is_member_logged_in", "true");
          localStorage.setItem("logged_in_member", JSON.stringify(demoUser));
          toast.success("Logged in with Demo Account!");
          navigate({ to: "/dashboard" });
        } else {
          setError("Invalid phone number or password. Check credentials.");
          setLoading(false);
        }
      }
    }, 600);
  };

  const handleDemoLogin = () => {
    setPhone("9876543210");
    setPassword("password123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#E02020] opacity-5 blur-[120px] pointer-events-none" />

      {/* Centered Logo at Top */}
      <div className="text-center mb-6">
        <Link to="/" className="inline-flex h-14 w-14 rounded-2xl bg-[#E02020] items-center justify-center shadow-lg shadow-[#E02020]/25 transition-transform hover:scale-105">
          <Dumbbell className="h-7 w-7 text-white" />
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl bg-[#111111] border border-[#222222] p-6 md:p-8 shadow-2xl relative">
          <h2 className="font-display text-3xl tracking-wide uppercase text-center mb-6 text-white">Welcome Back</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 flex gap-2 items-center text-xs text-red-400">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Mobile Number</Label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#8A8A8A] font-semibold">+91</span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  required
                  className="pl-12 bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <Label htmlFor="password" className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Password</Label>
                <Link to="/forgot-password" className="text-[11px] text-[#8A8A8A] hover:text-[#E02020] transition-colors font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A8A]" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#E02020] hover:bg-[#C41818] text-white h-11 font-semibold mt-2 uppercase tracking-wider text-xs pt-0.5"
            >
              {loading ? "Verifying..." : "Login"}
            </Button>
          </form>

          <div className="border-t border-[#222222] my-6" />

          <div className="text-center space-y-4">
            <div className="text-xs text-[#8A8A8A]">
              New member?{" "}
              <Link to="/join" className="text-[#E02020] hover:underline font-bold">
                Join here
              </Link>
            </div>
            
            <div className="pt-2 border-t border-[#1F1F1F] flex justify-between items-center text-[10px]">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-[#8A8A8A] hover:text-white underline font-semibold"
              >
                Autofill Demo Member
              </button>
              <Link to="/admin/login" className="text-[#8A8A8A] hover:text-white underline font-semibold">
                Staff login? Click here
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
