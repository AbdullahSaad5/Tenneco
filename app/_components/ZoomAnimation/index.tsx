"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ZoomAnimationProps {
  vehicleType: "light" | "commercial" | "rail";
  onComplete: () => void;
}

const animationData = {
  light: {
    vehicleImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80",
    wheelImage: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1200&q=80",
    brakeImage: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&q=80"
  },
  commercial: {
    vehicleImage: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1200&q=80",
    wheelImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    brakeImage: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&q=80"
  },
  rail: {
    vehicleImage: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1200&q=80",
    wheelImage: "https://images.unsplash.com/photo-1513363287815-e7a0eef0287c?w=1200&q=80",
    brakeImage: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&q=80"
  }
};

const ZoomAnimation: React.FC<ZoomAnimationProps> = ({ vehicleType, onComplete }) => {
  const [stage, setStage] = useState<"vehicle" | "wheel" | "brake" | "complete">("vehicle");
  const images = animationData[vehicleType];

  useEffect(() => {
    const timer1 = setTimeout(() => setStage("wheel"), 1500);
    const timer2 = setTimeout(() => setStage("brake"), 3000);
    const timer3 = setTimeout(() => {
      setStage("complete");
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      <AnimatePresence mode="wait">
        {stage === "vehicle" && (
          <motion.div
            key="vehicle"
            initial={{ scale: 1, opacity: 1 }}
            exit={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images.vehicleImage}
              alt="Vehicle"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <h2 className="text-4xl font-bold text-white mb-2">
                  {vehicleType === "light" && "Light Vehicle"}
                  {vehicleType === "commercial" && "Commercial Vehicle"}
                  {vehicleType === "rail" && "Rail System"}
                </h2>
                <p className="text-white/80">Zooming to braking system...</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {stage === "wheel" && (
          <motion.div
            key="wheel"
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images.wheelImage}
              alt="Wheel"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-black/50 backdrop-blur-sm px-8 py-4 rounded-lg"
              >
                <h3 className="text-3xl font-bold text-white">Wheel System</h3>
              </motion.div>
            </div>
          </motion.div>
        )}

        {stage === "brake" && (
          <motion.div
            key="brake"
            initial={{ scale: 2.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 5, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images.brakeImage}
              alt="Brake Mechanism"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center bg-black/50 backdrop-blur-sm px-8 py-4 rounded-lg"
              >
                <h3 className="text-3xl font-bold text-white">Brake Mechanism</h3>
                <p className="text-white/80 mt-2">Exploring brake pad components...</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        <div className={`w-16 h-1 rounded-full transition-all ${stage === "vehicle" ? "bg-white" : "bg-white/30"}`} />
        <div className={`w-16 h-1 rounded-full transition-all ${stage === "wheel" ? "bg-white" : "bg-white/30"}`} />
        <div className={`w-16 h-1 rounded-full transition-all ${stage === "brake" ? "bg-white" : "bg-white/30"}`} />
      </div>
    </div>
  );
};

export default ZoomAnimation;
