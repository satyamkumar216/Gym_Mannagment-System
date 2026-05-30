"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

/**
 * BackToTop — Floating button that appears when the user scrolls down 300px.
 * Red circular button with an up-arrow icon. Smooth-scrolls to the top on click.
 * Fades in/out with framer-motion.
 */
export function BackToTop() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 300);
    }

    // Check once on mount in case user is already scrolled
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = React.useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#E02020] text-white shadow-lg shadow-[#E02020]/25 hover:bg-[#C41818] active:scale-95 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E02020] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A]"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
