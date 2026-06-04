/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ToastProps {
  title: string;
  message: string;
  icon?: string;
  visible: boolean;
  onClose: () => void;
}

export default function Toast({ title, message, icon = '✨', visible, onClose }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="app-toast"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-white border-l-4 border-emerald-500 shadow-xl rounded-r-2xl p-4 flex items-start gap-4"
        >
          <div className="text-3xl" id="toast-icon">
            {icon}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800 text-sm" id="toast-title">
              {title}
            </h4>
            <p className="text-xs text-slate-600 mt-0.5" id="toast-message">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer self-start"
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
