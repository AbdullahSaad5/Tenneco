"use client";

import React from "react";
import { motion } from "framer-motion";
import { useContent } from "../../providers/ContentProvider";
import { useLanguage } from "../../providers/LanguageProvider";
import Image from "next/image";
import { getMediaUrlById } from "../../utils/mediaUrl";

const LoadingScreen = () => {
  const { loadingScreen } = useContent();
  const { getTranslation } = useLanguage();

  const primaryColor = loadingScreen?.animation.colors.primary || "#2563eb";
  const secondaryColor = loadingScreen?.animation.colors.secondary || "#0ea5e9";
  const duration = (loadingScreen?.animation.duration || 2000) / 1000;

  return (
    <div className="h-screen w-screen bg-slate-900 flex items-center justify-center relative z-50">
      {/* Loading Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo/Icon */}
        <motion.div
          className="relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <div
            className="w-24 h-24 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: primaryColor }}
          >
            {loadingScreen?.logoType === "image" && loadingScreen.logoMediaId ? (
              <Image
                src={getMediaUrlById(loadingScreen.logoMediaId) || "/tenneco-logo.png"}
                alt="Logo"
                width={48}
                height={48}
                className="w-12 h-12"
              />
            ) : (
              <motion.svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: 360 }}
                transition={{ duration: duration, repeat: Infinity, ease: "linear" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={loadingScreen?.svgPath || "M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z"}
                />
              </motion.svg>
            )}
          </div>
        </motion.div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-2">
            {getTranslation(loadingScreen?.title || "Tenneco 3D Viewer", loadingScreen?.titleTranslations)}
          </h2>
          <p className="text-slate-400 text-lg">
            {getTranslation(loadingScreen?.subtitle || "Loading 3D models...", loadingScreen?.subtitleTranslations)}
          </p>
        </motion.div>

        {/* Loading Bar */}
        <div className="w-64 h-2 bg-slate-800 rounded overflow-hidden">
          <motion.div
            className="h-full rounded"
            style={{ backgroundColor: primaryColor }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Dots Animation */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: i === 1 ? secondaryColor : primaryColor }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
