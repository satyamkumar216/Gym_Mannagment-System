import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

export interface ToastData {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: React.ReactNode;
  duration?: number;
}

type ToastListener = (toasts: ToastData[]) => void;
let listeners: ToastListener[] = [];
let toastQueue: ToastData[] = [];

const notify = () => {
  listeners.forEach(l => l([...toastQueue]));
};

export const toast = {
  success: (message: React.ReactNode, options?: { duration?: number }) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastQueue = [...toastQueue, { id, type: "success", message, duration: options?.duration || 4000 }];
    notify();
    return id;
  },
  error: (message: React.ReactNode, options?: { duration?: number }) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastQueue = [...toastQueue, { id, type: "error", message, duration: options?.duration || 4000 }];
    notify();
    return id;
  },
  warning: (message: React.ReactNode, options?: { duration?: number }) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastQueue = [...toastQueue, { id, type: "warning", message, duration: options?.duration || 4000 }];
    notify();
    return id;
  },
  info: (message: React.ReactNode, options?: { duration?: number }) => {
    const id = Math.random().toString(36).substring(2, 9);
    toastQueue = [...toastQueue, { id, type: "info", message, duration: options?.duration || 4000 }];
    notify();
    return id;
  },
  dismiss: (id?: string) => {
    if (id) {
      toastQueue = toastQueue.filter(t => t.id !== id);
    } else {
      toastQueue = [];
    }
    notify();
  }
};

const ToastItem = ({ toast: t }: { toast: ToastData }) => {
  const duration = t.duration || 4000;
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const interval = 16; // ~60fps
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (elapsed >= duration) {
        clearInterval(timerRef.current);
        toast.dismiss(t.id);
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [t.id, duration]);

  const handleClose = () => {
    toast.dismiss(t.id);
  };

  // Icon and Style mapping
  const config = {
    success: {
      border: "border-l-4 border-l-emerald-500",
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
      bgBar: "bg-emerald-500",
    },
    error: {
      border: "border-l-4 border-l-red-500",
      icon: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
      bgBar: "bg-red-500",
    },
    warning: {
      border: "border-l-4 border-l-amber-500",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
      bgBar: "bg-amber-500",
    },
    info: {
      border: "border-l-4 border-l-blue-500",
      icon: <Info className="h-5 w-5 text-blue-400 shrink-0" />,
      bgBar: "bg-blue-500",
    },
  }[t.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.9, transition: { duration: 0.15 } }}
      className={`pointer-events-auto w-full rounded-lg bg-[#111111] border border-[#222222] ${config.border} p-4 shadow-2xl relative overflow-hidden flex items-start gap-3 max-md:min-h-[44px]`}
    >
      {config.icon}
      <div className="flex-1 text-xs text-[#CFCFCF] font-medium leading-relaxed pr-6 text-left break-words select-none">
        {t.message}
      </div>
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 text-[#8A8A8A] hover:text-white transition-colors cursor-pointer bg-transparent border-0"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
        <div
          className={`h-full ${config.bgBar} transition-all duration-[16ms] ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
};

export const Toaster = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    const listener = (newToasts: ToastData[]) => {
      setToasts(newToasts);
    };
    listeners.push(listener);
    setToasts([...toastQueue]);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:right-0 max-md:px-3 max-md:pb-[calc(env(safe-area-inset-bottom)+12px)] z-[9999] pointer-events-none flex flex-col gap-3 w-full max-w-sm max-md:max-w-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
};
