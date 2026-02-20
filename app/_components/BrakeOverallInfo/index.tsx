"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Markdown from "react-markdown";
import { OverallBrakeInfo } from "../../_types/content";
import { useLanguage } from "../../providers/LanguageProvider";

interface BrakeOverallInfoProps {
  info: OverallBrakeInfo;
  isCollapsed: boolean;
}

const BrakeOverallInfo: React.FC<BrakeOverallInfoProps> = ({ info, isCollapsed }) => {
  const { getTranslation } = useLanguage();

  const title = getTranslation(info.title || "", info.titleTranslations).trim();
  const description = getTranslation(info.description || "", info.descriptionTranslations).trim();

  if (!title && !description) return null;

  return (
    <AnimatePresence>
      {isCollapsed && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ duration: 0.3, type: "spring" }}
          className="fixed bottom-4 left-3 right-3 sm:bottom-8 sm:left-auto sm:right-6 z-20 w-auto sm:w-96 bg-white/95 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden shadow-2xl"
        >
          {title && (
            <div className="p-3 sm:p-5 flex items-center gap-2 sm:gap-3 border-b border-slate-200">
              <div className="w-3 h-3 rounded-full bg-primary shadow-lg" />
              <h3 className="text-slate-800 font-bold text-lg sm:text-xl">{title}</h3>
            </div>
          )}

          {description && (
            <div className="p-3 sm:p-5 max-h-[50vh] overflow-y-auto">
              <div className="text-sm sm:text-base text-slate-600 leading-relaxed prose prose-sm prose-slate max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-1">
                <Markdown>{description}</Markdown>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrakeOverallInfo;
