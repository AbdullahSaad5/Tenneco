"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Share2, Mail, MessageCircle } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareOptions = [
    {
      name: "Email",
      Icon: Mail,
      bgColor: "bg-red-600",
      action: () => {
        window.location.href = `mailto:?subject=Check out this 3D model&body=View this 3D model: ${currentUrl}`;
      },
    },
    {
      name: "WhatsApp",
      Icon: MessageCircle,
      bgColor: "bg-green-600",
      action: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(currentUrl)}`, "_blank");
      },
    },
    {
      name: "Copy Link",
      Icon: copied ? Check : Copy,
      bgColor: copied ? "bg-green-600" : "bg-blue-600",
      action: handleCopy,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-lg border border-slate-200 w-full max-w-md overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-blue-600 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Share</h2>
                    <p className="text-blue-100 text-sm">Share this 3D model</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* URL Display */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Share Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentUrl}
                      readOnly
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleCopy}
                      className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                        copied
                          ? "bg-green-500 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                  {copied && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-green-600 mt-2 flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Link copied to clipboard!
                    </motion.p>
                  )}
                </div>

                {/* Share Options */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Share via
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {shareOptions.map((option, index) => {
                      const IconComponent = option.Icon;
                      return (
                        <motion.button
                          key={option.name}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={option.action}
                          className="flex flex-col items-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <div className={`w-12 h-12 rounded-lg ${option.bgColor} flex items-center justify-center text-white`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <span className="text-sm font-medium text-slate-700">{option.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;
