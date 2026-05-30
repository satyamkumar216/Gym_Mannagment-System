import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const VISIT_COUNT_KEY = "ironforge_visit_count";
const IOS_DISMISSED_KEY = "ironforge_ios_install_dismissed";
const ANDROID_DISMISSED_KEY = "ironforge_android_install_dismissed";
const VISIT_THRESHOLD = 3;

// ─── Utilities ──────────────────────────────────────────────────────────────────

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isInStandaloneMode(): boolean {
  if (typeof window === "undefined") return false;
  return (
    ("standalone" in window.navigator && (window.navigator as any).standalone) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

// ─── Shared Styles ──────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 9999,
  background: "linear-gradient(to top, #111111, #1A1A1A)",
  borderTop: "2px solid #E02020",
  padding: "20px 24px",
  display: "flex",
  alignItems: "flex-start",
  gap: "16px",
  fontFamily: "'Inter', system-ui, sans-serif",
  color: "#F5F5F5",
  boxShadow: "0 -4px 24px rgba(224, 32, 32, 0.15)",
};

const closeButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  color: "#666",
  fontSize: "20px",
  cursor: "pointer",
  padding: "4px",
  lineHeight: 1,
  flexShrink: 0,
};

const installButtonStyle: React.CSSProperties = {
  background: "#E02020",
  color: "#fff",
  border: "none",
  padding: "10px 24px",
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "background 0.2s",
};

const slideUp = {
  initial: { y: 200, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: "spring" as const, damping: 25, stiffness: 300 } },
  exit: { y: 200, opacity: 0, transition: { duration: 0.25 } },
};

// ─── Component ──────────────────────────────────────────────────────────────────

export function InstallPrompt() {
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  // ── Track visits for iOS banner ──
  useEffect(() => {
    if (isInStandaloneMode()) return;

    // iOS: track visit count
    if (isIOS()) {
      const dismissed = localStorage.getItem(IOS_DISMISSED_KEY);
      if (dismissed) return;

      const count = parseInt(localStorage.getItem(VISIT_COUNT_KEY) || "0", 10) + 1;
      localStorage.setItem(VISIT_COUNT_KEY, String(count));

      if (count >= VISIT_THRESHOLD) {
        setShowIOSPrompt(true);
      }
      return;
    }

    // Android / Desktop: listen for native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      const dismissed = localStorage.getItem(ANDROID_DISMISSED_KEY);
      if (dismissed) return;

      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroidPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // ── Handlers ──
  const dismissIOS = useCallback(() => {
    localStorage.setItem(IOS_DISMISSED_KEY, "1");
    setShowIOSPrompt(false);
  }, []);

  const dismissAndroid = useCallback(() => {
    localStorage.setItem(ANDROID_DISMISSED_KEY, "1");
    setShowAndroidPrompt(false);
    setDeferredPrompt(null);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowAndroidPrompt(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  // ── Render ──
  return (
    <AnimatePresence>
      {/* ── iOS Safari Banner ── */}
      {showIOSPrompt && (
        <motion.div
          key="ios-install"
          style={cardStyle}
          {...slideUp}
        >
          <span style={{ fontSize: "28px", flexShrink: 0, marginTop: "2px" }}>🏋️</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: "15px", margin: 0 }}>
              Add IronForge to your home screen
            </p>
            <p style={{ fontSize: "13px", color: "#999", marginTop: "6px", lineHeight: 1.5 }}>
              Tap the{" "}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "#222",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontSize: "12px",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Share
              </span>{" "}
              button, then <strong>"Add to Home Screen"</strong> for quick access.
            </p>
          </div>
          <button
            onClick={dismissIOS}
            style={closeButtonStyle}
            aria-label="Dismiss install prompt"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* ── Android / Desktop Banner ── */}
      {showAndroidPrompt && (
        <motion.div
          key="android-install"
          style={cardStyle}
          {...slideUp}
        >
          <span style={{ fontSize: "28px", flexShrink: 0, marginTop: "2px" }}>🏋️</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: "15px", margin: 0 }}>
              Install IronForge Gym
            </p>
            <p style={{ fontSize: "13px", color: "#999", marginTop: "6px", lineHeight: 1.5 }}>
              Add the app to your home screen for a faster, full-screen experience.
            </p>
            <div style={{ marginTop: "12px", display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={handleInstall}
                style={installButtonStyle}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.background = "#C41A1A")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.background = "#E02020")}
              >
                Install
              </button>
              <button
                onClick={dismissAndroid}
                style={{
                  background: "none",
                  border: "1px solid #333",
                  color: "#999",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Not now
              </button>
            </div>
          </div>
          <button
            onClick={dismissAndroid}
            style={closeButtonStyle}
            aria-label="Dismiss install prompt"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
