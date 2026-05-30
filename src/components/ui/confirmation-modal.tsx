import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel"
}: ConfirmationModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay">
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 40 }}
            className="modal-sheet p-6 relative space-y-4 text-left"
          >
            <button 
              type="button"
              onClick={onClose} 
              className="absolute top-4 right-4 text-[#8A8A8A] hover:text-white transition-colors cursor-pointer bg-transparent border-0 touch-target flex items-center justify-center"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 pr-8">
              <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base text-white font-bold uppercase tracking-wide break-words">{title}</h3>
            </div>

            <p className="text-xs text-[#8A8A8A] leading-relaxed font-medium break-words">
              {description}
            </p>

            <div className="flex flex-col max-md:gap-2 sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-[#222222] text-[#CFCFCF] hover:bg-[#1A1A1A] h-11 font-bold uppercase text-xs max-md:w-full"
              >
                {cancelText}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 bg-[#E02020] hover:bg-[#C41818] text-white h-11 font-bold uppercase text-xs border-0 max-md:w-full"
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
