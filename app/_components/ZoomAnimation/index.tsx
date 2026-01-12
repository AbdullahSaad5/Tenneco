"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface ZoomAnimationProps {
  vehicleType: "light" | "commercial" | "rail";
  onComplete: () => void;
}

const animationData = {
  light: {
    vehicleImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=90",
    wheelImage: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1920&q=90",
    brakeImage: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=90",
    title: "Light Vehicle Braking System"
  },
  commercial: {
    vehicleImage: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=1920&q=90",
    wheelImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920&q=90",
    brakeImage: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=90",
    title: "Commercial Vehicle Braking System"
  },
  rail: {
    vehicleImage: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&q=90",
    wheelImage: "https://images.unsplash.com/photo-1513363287815-e7a0eef0287c?w=1920&q=90",
    brakeImage: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1920&q=90",
    title: "Rail Braking System"
  }
};

const ZoomAnimation: React.FC<ZoomAnimationProps> = ({ vehicleType, onComplete }) => {
  const [stage, setStage] = useState<"vehicle" | "wheel" | "brake" | "mechanism" | "complete">("vehicle");
  const images = animationData[vehicleType];

  useEffect(() => {
    const timer1 = setTimeout(() => setStage("wheel"), 2000);
    const timer2 = setTimeout(() => setStage("brake"), 4000);
    const timer3 = setTimeout(() => setStage("mechanism"), 6000);
    const timer4 = setTimeout(() => {
      setStage("complete");
      onComplete();
    }, 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

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
        {/* Stage 1: Full Vehicle */}
        {stage === "vehicle" && (
          <motion.div
            key="vehicle"
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: 4,
              opacity: 0,
              filter: "blur(20px)"
            }}
            transition={{
              duration: 2,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images.vehicleImage}
              alt="Vehicle"
              className="w-full h-full object-cover"
            />

            {/* Circular Focus Ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-96 h-96">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-blue-500/50"
                  style={{
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.5), inset 0 0 30px rgba(59, 130, 246, 0.3)"
                  }}
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 rounded-full border border-cyan-500/30"
                />
              </div>
            </motion.div>

            {/* Title */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-center"
              >
                <h2 className="text-5xl font-bold text-white mb-4 tracking-wider"
                    style={{ textShadow: "0 0 20px rgba(0,0,0,0.8)" }}>
                  {images.title}
                </h2>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ delay: 1, duration: 1 }}
                  className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                />
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Stage 2: Zoom to Wheel */}
        {stage === "wheel" && (
          <motion.div
            key="wheel"
            initial={{
              scale: 4,
              opacity: 0,
              filter: "blur(20px)"
            }}
            animate={{
              scale: 1,
              opacity: 1,
              filter: "blur(0px)"
            }}
            exit={{
              scale: 5,
              opacity: 0,
              filter: "blur(30px)"
            }}
            transition={{
              duration: 2,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images.wheelImage}
              alt="Wheel"
              className="w-full h-full object-cover"
            />

            {/* Targeting Reticle */}
            <motion.div
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="relative w-80 h-80">
                {/* Corner Brackets */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 2, times: [0, 0.2, 0.8, 1] }}
                  className="absolute inset-0"
                >
                  <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-cyan-500" />
                  <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-cyan-500" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-cyan-500" />
                  <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-cyan-500" />
                </motion.div>
              </div>
            </motion.div>

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ delay: 0.5 }}
              className="absolute top-1/2 left-20 -translate-y-1/2"
            >
              <div className="bg-gradient-to-r from-blue-600/90 to-cyan-600/90 backdrop-blur-md px-6 py-3 rounded-r-full border-l-4 border-cyan-400"
                   style={{ boxShadow: "0 0 30px rgba(6, 182, 212, 0.5)" }}>
                <p className="text-white font-bold text-2xl tracking-wide">WHEEL SYSTEM</p>
                <p className="text-cyan-200 text-sm">Analyzing braking components...</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Stage 3: Zoom to Brake */}
        {stage === "brake" && (
          <motion.div
            key="brake"
            initial={{
              scale: 5,
              opacity: 0,
              filter: "blur(30px)"
            }}
            animate={{
              scale: 1,
              opacity: 1,
              filter: "blur(0px)"
            }}
            exit={{
              scale: 8,
              opacity: 0,
              filter: "blur(40px)",
              rotate: 10
            }}
            transition={{
              duration: 2,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images.brakeImage}
              alt="Brake"
              className="w-full h-full object-cover"
            />

            {/* Pulsing Circle */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute w-96 h-96 rounded-full border-4 border-orange-500"
              />
            </motion.div>

            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 2 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2"
            >
              <div className="bg-gradient-to-r from-orange-600/90 to-red-600/90 backdrop-blur-md px-8 py-4 rounded-full border-2 border-orange-400"
                   style={{ boxShadow: "0 0 40px rgba(249, 115, 22, 0.6)" }}>
                <p className="text-white font-bold text-3xl tracking-wide text-center">BRAKE DISC</p>
                <p className="text-orange-200 text-sm text-center mt-1">Friction surface analysis</p>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Stage 4: Deep Zoom to Mechanism */}
        {stage === "mechanism" && (
          <motion.div
            key="mechanism"
            initial={{
              scale: 8,
              opacity: 0,
              filter: "blur(40px)",
              rotate: 10
            }}
            animate={{
              scale: 1,
              opacity: 1,
              filter: "blur(0px)",
              rotate: 0
            }}
            exit={{
              scale: 0,
              opacity: 0,
              filter: "blur(50px)"
            }}
            transition={{
              duration: 2,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
            className="absolute inset-0"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images.brakeImage}
              alt="Mechanism"
              className="w-full h-full object-cover scale-150"
            />

            {/* Grid Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              className="absolute inset-0"
              style={{
                backgroundImage: "linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)",
                backgroundSize: "50px 50px"
              }}
            />

            {/* Central Label */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(59, 130, 246, 0.5)",
                      "0 0 60px rgba(59, 130, 246, 0.8)",
                      "0 0 20px rgba(59, 130, 246, 0.5)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-pink-600/90 backdrop-blur-xl px-12 py-8 rounded-2xl border-2 border-white/30"
                >
                  <p className="text-white font-bold text-4xl tracking-wider mb-2">BRAKE PAD</p>
                  <p className="text-white/90 text-lg">Entering 3D Analysis Mode</p>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mt-4 mx-auto w-8 h-8 border-4 border-white/30 border-t-white rounded-full"
                  />
                </motion.div>
              </div>
            </motion.div>
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
