"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useActiveComponent } from "../providers/ActiveComponentProvider";
import LoadingSpinner from "../_components/LoadingSpinner";

interface SetupImage {
  url: string;
}

interface SetupVideo {
  url: string;
}

interface SetupData {
  images: SetupImage[];
  forwardVideos: SetupVideo[];
  backwardVideos: SetupVideo[];
}

const DeviceSetup = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showingVideo, setShowingVideo] = useState(false);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const { setupData } = useActiveComponent();
  const typedSetupData = setupData as unknown as SetupData | undefined;
  const router = useRouter();
  // Track whether every setup image is now cached by the browser. When this is
  // true we know subsequent "next/previous" navigations will not trigger extra
  // network requests for the same files.
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  // Pre-cache every image on the first render. We rely on the browser cache,
  // therefore each file is fetched only once and is served from memory on the
  // following renders.
  useEffect(() => {
    if (!typedSetupData?.images?.length) return;

    let cancelled = false;

    const preload = async () => {
      const promises = typedSetupData.images.map(({ url }) => {
        return new Promise<void>((resolve) => {
          const img = new window.Image();
          img.src = url;
          img.onload = () => resolve();
          img.onerror = () => resolve(); // still resolve on error to avoid lock
        });
      });

      await Promise.all(promises);
      if (!cancelled) setImagesPreloaded(true);
    };

    preload();

    return () => {
      cancelled = true;
    };
  }, [typedSetupData?.images]);

  // Handle video playback events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setVideoStarted(true);
    };

    const handleCanPlayThrough = () => {
      if (videoStarted && showingVideo) {
        if (direction === "forward") {
          console.log("forward - changing image after video starts");
          setCurrentImageIndex((prevIndex) => prevIndex + 1);
        } else if (direction === "backward") {
          console.log("backward - changing image after video starts");
          setCurrentImageIndex((prevIndex) => prevIndex - 1);
        }
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("canplaythrough", handleCanPlayThrough);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
    };
  }, [videoStarted, direction, showingVideo]);

  useEffect(() => {
    if (videoRef.current && showingVideo) {
      videoRef.current.load();
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
  }, [showingVideo]);

  // Early return if setupData is not available
  if (!typedSetupData?.images || !typedSetupData?.forwardVideos || !typedSetupData?.backwardVideos) {
    return <LoadingSpinner />;
  }

  const { images, forwardVideos, backwardVideos } = typedSetupData;

  const handleNext = (): void => {
    if (currentImageIndex === images.length - 1) {
      router.push("/benefits");
      return;
    }

    if (!showingVideo && currentImageIndex < images.length - 1) {
      setDirection("forward");
      setCurrentVideoIndex(currentImageIndex);
      setShowingVideo(true);
      setVideoStarted(false);
    }
  };

  const handlePrevious = (): void => {
    if (!showingVideo && currentImageIndex > 0) {
      setDirection("backward");
      setCurrentVideoIndex(currentImageIndex - 1);
      setShowingVideo(true);
      setVideoStarted(false);
    }
  };

  const currentVideoSrc =
    direction === "forward" ? forwardVideos[currentVideoIndex]?.url : backwardVideos[currentVideoIndex]?.url;

  if (!currentVideoSrc) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-white relative w-full h-screen">
      {!imagesPreloaded && <LoadingSpinner />}

      {/* All images stay in the DOM so that React never re-mounts/re-fetches
          them. The CSS opacity toggle merely shows/hides the correct one. */}
      {images.map((image, index) => (
        <Image
          key={image.url}
          src={image.url}
          alt={`Step ${index}`}
          fill
          className={`object-cover h-full w-full transition-opacity duration-300 ${
            index === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
          // Disable Next.js optimisation so the exact same URL is requested and
          // stays cached. This also avoids extra resized variants per render.
          unoptimized
        />
      ))}

      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover ${showingVideo ? "visible" : "invisible"}`}
        playsInline
        muted
        onEnded={() => {
          setShowingVideo(false);
          setVideoStarted(false);
        }}
        onError={(e) => {
          console.error("Video error:", e);
          setShowingVideo(false);
          setVideoStarted(false);
        }}
      >
        <source src={currentVideoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute bottom-5 left-5 right-5 p-4 z-10">
        <div className="flex justify-between">
          <button
            className="bg-primary text-white font-bold p-2 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary group"
            onClick={handlePrevious}
            disabled={currentImageIndex === 0 || showingVideo}
          >
            <ArrowLeft className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white group-hover:text-primary" />
          </button>
          <button
            className="bg-primary text-white font-bold p-2 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary group"
            onClick={handleNext}
            disabled={showingVideo}
          >
            <ArrowRight className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white group-hover:text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeviceSetup;
