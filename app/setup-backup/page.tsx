"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../_components/LoadingSpinner";

const images = [
  "/assets/images/Vista iniziale-1.png",
  "/assets/images/Step 0 FRAME.png",
  "/assets/images/Step 1 FRAME.png",
  "/assets/images/Step 2 FRAME.png",
  "/assets/images/Step 3 FRAME.png",
  "/assets/images/Step 4 FRAME.png",
  "/assets/images/Step 5 FRAME.png",
  "/assets/images/Step 6 FRAME.png",
  "/assets/images/Step 7 FRAME.png",
];

const forwardVideos = [
  "/assets/videos/forwards/s0 avanti compr.mp4",
  "/assets/videos/forwards/s1 avanti compr.mp4",
  "/assets/videos/forwards/s2 avanti compr.mp4",
  "/assets/videos/forwards/s3 avanti compr.mp4",
  "/assets/videos/forwards/s4 avanti compr.mp4",
  "/assets/videos/forwards/s5 avanti compr.mp4",
  "/assets/videos/forwards/s6 avanti compr.mp4",
  "/assets/videos/forwards/s7 avanti compr.mp4",
];

const backwardVideos = [
  "/assets/videos/backwards/s0 back compr.mp4",
  "/assets/videos/backwards/s1 back compr.mp4",
  "/assets/videos/backwards/s2 back compr.mp4",
  "/assets/videos/backwards/s3 back compr.mp4",
  "/assets/videos/backwards/s4 back compr.mp4",
  "/assets/videos/backwards/s5 back compr.mp4",
  "/assets/videos/backwards/s6 back compr.mp4",
  "/assets/videos/backwards/s7 back compr.mp4",
];

const Setup = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showingVideo, setShowingVideo] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [allLoaded, setAllLoaded] = useState(Array(images.length).fill(false));
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  // Preload all videos on mount
  useEffect(() => {
    const preloadVideo = (src: string) => {
      const video = document.createElement("video");
      video.preload = "auto";
      video.src = src;
      video.load();
    };

    [...forwardVideos, ...backwardVideos].forEach(preloadVideo);
  }, []);

  const handleNext = (): void => {
    if (currentIndex === images.length - 1) {
      router.push("/benefits");
      return;
    }

    if (!showingVideo && currentIndex < images.length - 1) {
      setDirection("forward");
      setShowingVideo(true);
    }
  };

  const handlePrevious = (): void => {
    if (!showingVideo && currentIndex > 0) {
      setDirection("backward");
      setShowingVideo(true);
    }
  };

  const currentVideoSrc = direction === "forward" ? forwardVideos[currentIndex] : backwardVideos[currentIndex - 1];

  useEffect(() => {
    if (videoRef.current && showingVideo) {
      const playVideo = async () => {
        try {
          videoRef.current!.currentTime = 0;
          await videoRef.current!.play();
        } catch (error) {
          console.error("Error playing video:", error);
          // Fallback: move to next image if video fails
          if (direction === "forward") {
            setCurrentIndex((prev) => prev + 1);
          } else {
            setCurrentIndex((prev) => prev - 1);
          }
          setShowingVideo(false);
        }
      };

      videoRef.current.load();
      // Small delay for Safari compatibility
      setTimeout(playVideo, 100);

      return () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      };
    }
  }, [showingVideo, currentVideoSrc, direction]);

  const handleVideoPlay = () => {
    if (direction === "forward") {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleVideoEnd = () => {
    setShowingVideo(false);
  };

  const handleImageLoad = (index: number) => {
    setAllLoaded((prev) => {
      const newLoaded = [...prev];
      newLoaded[index] = true;
      return newLoaded;
    });
  };

  return (
    <div className="min-h-screen bg-white relative w-full h-screen">
      {allLoaded.some((loaded) => !loaded) && <LoadingSpinner />}

      {/* Render all images at once with opacity control */}
      {images.map((image, index) => (
        <Image
          key={image}
          src={image}
          alt={`Step ${index}`}
          fill
          className={`object-cover h-full w-full transition-opacity duration-300
            ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
          priority
          quality={100}
          onLoad={() => handleImageLoad(index)}
          onError={() => {
            console.error("Failed to load image:", image);
            handleImageLoad(index); // Mark as loaded even on error to prevent stuck state
          }}
        />
      ))}

      {/* Video overlay */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300
          ${showingVideo ? "opacity-100" : "opacity-0"}`}
        playsInline
        muted
        onPlay={handleVideoPlay}
        onEnded={handleVideoEnd}
        onError={(e) => {
          console.error("Video error:", e);
          handleVideoEnd();
        }}
      >
        <source src={currentVideoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Navigation buttons */}
      <div className="absolute bottom-5 left-5 right-5 p-4 z-10">
        <div className="flex justify-between">
          <button
            className="bg-primary text-white font-bold p-2 rounded-2xl shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary group
              transition-colors duration-200"
            onClick={handlePrevious}
            disabled={currentIndex === 0 || showingVideo}
          >
            <ArrowLeft
              className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14
              text-white group-hover:text-primary transition-colors duration-200"
            />
          </button>
          <button
            className="bg-primary text-white font-bold p-2 rounded-2xl shadow-lg
              disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary group
              transition-colors duration-200"
            onClick={handleNext}
            disabled={showingVideo}
          >
            <ArrowRight
              className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14
              text-white group-hover:text-primary transition-colors duration-200"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setup;
