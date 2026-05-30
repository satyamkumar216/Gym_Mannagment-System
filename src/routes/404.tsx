import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/404")({
  head: () => ({
    meta: [
      { title: "Page Not Found — IronForge Gym" },
      { name: "description", content: "Error 404: Looks like this page skipped leg day." },
    ],
  }),
  component: NotFoundPage,
});

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans select-none">
      
      {/* Red ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#E02020] opacity-[0.04] blur-[150px] pointer-events-none" />

      {/* Subtle animated red geometric lines in the background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.08]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            d="M -100,200 L 800,-100 L 1200,600 L 400,900 Z"
            fill="none"
            stroke="#E02020"
            strokeWidth="1.5"
            animate={{
              d: [
                "M -100,200 L 800,-100 L 1200,600 L 400,900 Z",
                "M -50,220 L 780,-80 L 1220,580 L 380,920 Z",
                "M -100,200 L 800,-100 L 1200,600 L 400,900 Z"
              ]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.path
            d="M 1500,100 L 500,800 L -200,400 Z"
            fill="none"
            stroke="#E02020"
            strokeWidth="1"
            animate={{
              d: [
                "M 1500,100 L 500,800 L -200,400 Z",
                "M 1480,120 L 520,780 L -180,420 Z",
                "M 1500,100 L 500,800 L -200,400 Z"
              ]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
        </svg>
      </div>

      {/* Main card */}
      <div className="w-full max-w-sm text-center relative z-10 space-y-6">
        
        {/* Massive 404 text with glowing border */}
        <div className="relative inline-block">
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="font-display text-[120px] font-black tracking-tight leading-none text-[#E02020] select-none"
          >
            404
          </motion.h1>
          <div className="absolute -inset-1 blur-lg bg-[#E02020] opacity-10 -z-10" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-2xl uppercase tracking-wider text-white font-bold">Page Not Found</h2>
          <p className="text-sm font-medium text-[#CFCFCF] tracking-wide">
            "Looks like this page skipped leg day 🦵"
          </p>
          <p className="text-xs text-[#8A8A8A] max-w-xs mx-auto leading-relaxed">
            The link you followed is broken, or the directory was cleared during portal maintenance checks.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/">
            <Button
              className="px-6 bg-[#E02020] hover:bg-[#C41818] text-white h-10 font-bold uppercase text-xs tracking-wider"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
export default NotFoundPage;
