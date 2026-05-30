"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedPage — fade + upward slide wrapper for page-level transitions
// ─────────────────────────────────────────────────────────────────────────────

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StaggerContainer + StaggerItem — staggered fade-in for lists/grids of cards
// ─────────────────────────────────────────────────────────────────────────────

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  /** Delay between each child in seconds (default: 0.05 = 50ms) */
  staggerDelay?: number;
}

const staggerContainerVariants = {
  hidden: { opacity: 0 },
  visible: (staggerDelay: number) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  }),
};

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.05,
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      custom={staggerDelay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

const staggerItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CountUpNumber — animated counter from 0 → target value on mount
// Formats with Indian number system commas (e.g. 4,82,500)
// ─────────────────────────────────────────────────────────────────────────────

interface CountUpNumberProps {
  /** Target numeric value to count up to */
  value: number;
  /** Prefix string, e.g. "₹" */
  prefix?: string;
  /** Suffix string, e.g. "%" */
  suffix?: string;
  /** Animation duration in seconds (default: 1.5) */
  duration?: number;
  className?: string;
}

/**
 * Format a number using the Indian numbering system.
 * e.g. 482500 → "4,82,500"
 */
function formatIndianNumber(num: number): string {
  const isNegative = num < 0;
  const absNum = Math.abs(Math.round(num));
  const str = absNum.toString();

  if (str.length <= 3) return (isNegative ? "-" : "") + str;

  // Last 3 digits, then groups of 2
  let result = str.slice(-3);
  let remaining = str.slice(0, -3);

  while (remaining.length > 0) {
    const chunk = remaining.slice(-2);
    result = chunk + "," + result;
    remaining = remaining.slice(0, -2);
  }

  return (isNegative ? "-" : "") + result;
}

export function CountUpNumber({
  value,
  prefix = "",
  suffix = "",
  duration = 1.5,
  className,
}: CountUpNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const startTimeRef = React.useRef<number | null>(null);
  const rafRef = React.useRef<number>(0);

  React.useEffect(() => {
    startTimeRef.current = null;

    function animate(timestamp: number) {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(eased * value));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {formatIndianNumber(displayValue)}
      {suffix}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedProgressBar — progress bar animating from 0% → value on mount
// ─────────────────────────────────────────────────────────────────────────────

interface AnimatedProgressBarProps {
  /** Progress value 0–100 */
  value: number;
  /** Animation duration in seconds (default: 1) */
  duration?: number;
  className?: string;
  /** Bar color class (default: bg-primary / brand red) */
  barClassName?: string;
  /** Height class (default: h-2) */
  height?: string;
}

export function AnimatedProgressBar({
  value,
  duration = 1,
  className,
  barClassName = "bg-primary",
  height = "h-2",
}: AnimatedProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-full bg-primary/20",
        height,
        className
      )}
    >
      <motion.div
        initial={{ width: "0%" }}
        animate={{ width: `${clampedValue}%` }}
        transition={{
          duration,
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.2,
        }}
        className={cn("h-full rounded-full", barClassName)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HoverScaleCard — wrapper adding subtle scale(1.01) hover effect
// ─────────────────────────────────────────────────────────────────────────────

interface HoverScaleCardProps {
  children: React.ReactNode;
  className?: string;
  /** Scale factor on hover (default: 1.01) */
  scale?: number;
}

export function HoverScaleCard({
  children,
  className,
  scale = 1.01,
}: HoverScaleCardProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CopyButton — copies text to clipboard, shows "Copied!" for 2s
// ─────────────────────────────────────────────────────────────────────────────

interface CopyButtonProps {
  /** The text to copy to clipboard */
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium",
        "bg-[#1A1A1A] border border-[#222222] text-[#8A8A8A]",
        "hover:border-[#E02020]/40 hover:text-white",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E02020] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]",
        className
      )}
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {copied ? (
          <motion.span
            key="copied"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1 text-emerald-400"
          >
            <Check className="h-3.5 w-3.5" />
            Copied!
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
