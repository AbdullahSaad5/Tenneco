"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import { useContent } from "../../providers/ContentProvider";
import { FALLBACK_ZOOM_ANIMATION_IMAGES } from "../../config/fallbacks";

interface ZoomAnimationProps {
  vehicleType: "light" | "commercial" | "rail";
  onComplete: () => void;
}

const ZoomAnimation: React.FC<ZoomAnimationProps> = ({ vehicleType, onComplete }) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const { zoomAnimations } = useContent();

  // Get animation config for this vehicle type
  const animationConfig = useMemo(() => {
    return zoomAnimations?.[vehicleType];
  }, [zoomAnimations, vehicleType]);

  // Get sorted stages
  const stages = useMemo(() => {
    if (!animationConfig?.stages) return [];
    return [...animationConfig.stages].sort((a, b) => a.order - b.order);
  }, [animationConfig]);

  const currentStage = stages[currentStageIndex];

  // Get image URL with fallback
  const getImageUrl = (stageIndex: number): string => {
    const stage = stages[stageIndex];
    if (!stage) return "";

    if (stage.imageMediaId) {
      return `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}/media/${stage.imageMediaId}`;
    }

    // Fallback to Unsplash images
    const fallbackImages = FALLBACK_ZOOM_ANIMATION_IMAGES[vehicleType];
    const stageName = stage.name as keyof typeof fallbackImages;
    return fallbackImages[stageName] || "";
  };

  useEffect(() => {
    if (!stages.length) return;

    // Calculate cumulative duration for this stage
    let cumulativeDuration = 0;
    for (let i = 0; i <= currentStageIndex; i++) {
      cumulativeDuration += stages[i]?.duration || 2000;
    }

    const timer = setTimeout(() => {
      if (currentStageIndex < stages.length - 1) {
        setCurrentStageIndex(currentStageIndex + 1);
      } else {
        onComplete();
      }
    }, currentStage?.duration || 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [currentStageIndex, stages, currentStage, onComplete]);

  if (!currentStage || !stages.length) {
    return null;
  }

  const imageUrl = getImageUrl(currentStageIndex);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/80 z-10 pointer-events-none" />

      {/* Animated Scan Lines */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
        }}
      />

      <AnimatePresence mode="wait">
        {/* Dynamic Stage Rendering */}
        {currentStage && (
          <motion.div
            key={currentStage.name}
            className="absolute inset-0"
          >
            {/* Background Image with Blur Effect */}
            <motion.div
              initial={{
                scale: currentStage.effects.scale.from,
                opacity: 0,
                filter: `blur(${currentStage.effects.blur.from}px)`
              }}
              animate={{
                scale: currentStage.effects.scale.to,
                opacity: 1,
                filter: `blur(${currentStage.effects.blur.to}px)`
              }}
              exit={{
                scale: currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1].effects.scale.from : 8,
                opacity: 0,
                filter: `blur(${currentStageIndex < stages.length - 1 ? stages[currentStageIndex + 1].effects.blur.from : 50}px)`,
                rotate: currentStage.effects.rotation?.to || 0
              }}
              transition={{
                duration: (currentStage.duration / 1000) || 2,
                ease: [0.43, 0.13, 0.23, 0.96]
              }}
              className="absolute inset-0"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={currentStage.title}
                className="w-full h-full object-cover"
              />
            </motion.div>


            {/* Visual Effect Ring - Sharp (not blurred) */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute inset-0 flex items-center justify-center z-10"
            >
              <div className="relative w-96 h-96">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2"
                  style={{
                    borderColor: `${currentStage.label?.color.primary}80`,
                    boxShadow: `0 0 30px ${currentStage.label?.color.primary}80, inset 0 0 30px ${currentStage.label?.color.primary}50`
                  }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 rounded-full border"
                  style={{
                    borderColor: `${currentStage.label?.color.secondary}50`
                  }}
                />
              </div>
            </motion.div>

            {/* Label - Sharp (not blurred) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-center"
              >
                {currentStageIndex === 0 && (
                  <h2 className="text-5xl font-bold text-white mb-4 tracking-wider"
                      style={{ textShadow: "0 0 20px rgba(0,0,0,0.8)" }}>
                    {currentStage.title}
                  </h2>
                )}
                <div
                  className="bg-gradient-to-r backdrop-blur-md px-8 py-4 rounded-full border-2"
                  style={{
                    background: `linear-gradient(to right, ${currentStage.label?.color.primary}e6, ${currentStage.label?.color.secondary}e6)`,
                    borderColor: currentStage.label?.color.primary,
                    boxShadow: `0 0 40px ${currentStage.label?.color.primary}99`
                  }}
                >
                  <p className="text-white font-bold text-3xl tracking-wide text-center">
                    {currentStage.label?.text}
                  </p>
                  {currentStage.label?.subtext && (
                    <p className="text-white/90 text-sm text-center mt-1">
                      {currentStage.label.subtext}
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Light Rays Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-30">
        <motion.div
          animate={{
            rotate: 360,
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%]"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, rgba(59, 130, 246, 0.1) 60deg, transparent 120deg, rgba(6, 182, 212, 0.1) 180deg, transparent 240deg, rgba(59, 130, 246, 0.1) 300deg, transparent 360deg)"
          }}
        />
      </div>
    </div>
  );
};

export default ZoomAnimation;
