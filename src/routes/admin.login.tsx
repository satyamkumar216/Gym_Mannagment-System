import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Eye, EyeOff, Lock, Mail, ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Staff Login — IronForge Gym" },
      { name: "description", content: "Access the IronForge Gym Staff Portal." },
    ],
  }),
  component: StaffLogin,
});

function StaffLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    setTimeout(() => {
      if (cleanEmail === "admin@ironforge.com" && cleanPassword === "admin123") {
        localStorage.setItem("is_staff_logged_in", "true");
        toast.success("Welcome back to the Control Desk!");
        navigate({ to: "/admin" });
      } else {
        setError("Access Denied. Invalid credentials or unauthorized account.");
        setLoading(false);
      }
    }, 600);
  };

  const handleDemoLogin = () => {
    setEmail("admin@ironforge.com");
    setPassword("admin123");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#E02020] opacity-5 blur-[120px] pointer-events-none" />

      {/* Back to main site link */}
      <Link to="/" className="absolute top-6 left-6 text-xs text-[#8A8A8A] hover:text-white flex items-center gap-1.5 transition-colors font-semibold uppercase tracking-wider">
        <ArrowLeft className="h-4 w-4" /> Back to main site
      </Link>

      <div className="text-center mb-6">
        <div className="inline-flex h-14 w-14 rounded-2xl bg-[#E02020] items-center justify-center shadow-lg shadow-[#E02020]/25">
          <Dumbbell className="h-7 w-7 text-white" />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Card with red left border accent */}
        <div className="rounded-2xl bg-[#111111] border border-[#222222] border-l-4 border-l-[#E02020] p-6 md:p-8 shadow-2xl relative">
          <div className="text-center mb-6">
            <span className="text-[10px] uppercase tracking-widest text-[#E02020] font-bold">Staff & Admin Portal</span>
            <h2 className="font-display text-3xl tracking-wide uppercase text-white mt-1">Portal Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 flex gap-2 items-center text-xs text-red-400">
                <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Staff Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8A8A]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@ironforge.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 bg-[#0A0A0A] border-[#222222] h-11 focus-visible:ring-[#E02020]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-widest text-[#8A8A8A] font-semibold">Password</Label>
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
              {loading ? "Verifying..." : "Access Control"}
            </Button>
          </form>

          <div className="border-t border-[#222222] my-6" />

          <div className="flex justify-between items-center text-[10px]">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="text-[#8A8A8A] hover:text-white underline font-semibold"
            >
              Autofill Staff Credentials
            </button>
            <Link to="/login" className="text-[#8A8A8A] hover:text-white underline font-semibold">
              Are you a Member?
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
