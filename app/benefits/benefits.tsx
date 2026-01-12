"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import FullScreenVideo from "../_components/FullScreenVideo";
import NumberHotspot from "../_components/Hotspots/NumberHotspot";
import VideoPlayer from "../_components/VideoPlayer";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActiveComponent } from "../providers/ActiveComponentProvider";
import LoadingSpinner from "../_components/LoadingSpinner";

type Hotspot = {
  x: number;
  y: number;
  color: string;
  video: string;
  reverseVideo?: string;
  displayMode: "modal" | "fullscreen";
  stillImage?: string;
};

const Benefits = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isFullscreenPlaying, setIsFullscreenPlaying] = useState(false);
  const [isPlayingReverse, setIsPlayingReverse] = useState(false);
  const [isDonePlaying, setIsDonePlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  // Keep a mapping of original video URLs -> local objectURL created from a single fetch() so the
  // browser never re-downloads the asset after the initial preload.
  const [videoCache, setVideoCache] = useState<Record<string, string>>({});
  const { benefitsData } = useActiveComponent();

  console.log(benefitsData);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fullscreenVideoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter();

  const DEFAULT_IMAGE = "/assets/images/SCHERMATA PRINCIPALE BENEFICI.png";
  const [currentImage, setCurrentImage] = useState(DEFAULT_IMAGE);

  // Define hotspots as a memoized constant to avoid recreating on each render
  const hotspots = useMemo<Hotspot[]>(
    () => [
      {
        x: 49.65,
        y: 31.5,
        color: "white",
        video: videoCache[benefitsData?.videos[0]?.url ?? ""] ?? benefitsData?.videos[0]?.url ?? "",
        displayMode: "modal",
      },
      {
        x: 44.5,
        y: 20,
        color: "white",
        video: videoCache[benefitsData?.videos[1]?.url ?? ""] ?? benefitsData?.videos[1]?.url ?? "",
        displayMode: "modal",
      },
      {
        x: 62.5,
        y: 55.5,
        color: "white",
        video: videoCache[benefitsData?.videos[2]?.url ?? ""] ?? benefitsData?.videos[2]?.url ?? "",
        reverseVideo:
          videoCache[benefitsData?.reverseVideos[0]?.url ?? ""] ?? benefitsData?.reverseVideos[0]?.url ?? "",
        displayMode: "fullscreen",
        stillImage: benefitsData?.stillImages[0]?.url || "",
      },
      {
        x: 83,
        y: 66.75,
        color: "white",
        video: videoCache[benefitsData?.videos[3]?.url ?? ""] ?? benefitsData?.videos[3]?.url ?? "",
        reverseVideo:
          videoCache[benefitsData?.reverseVideos[1]?.url ?? ""] ?? benefitsData?.reverseVideos[1]?.url ?? "",
        displayMode: "fullscreen",
        stillImage: benefitsData?.stillImages[1]?.url || "",
      },
      {
        x: 56.5,
        y: 42.5,
        color: "secondary",
        video: videoCache[benefitsData?.videos[4]?.url ?? ""] ?? benefitsData?.videos[4]?.url ?? "",
        displayMode: "modal",
      },
      {
        x: 37.25,
        y: 60,
        color: "secondary",
        video: videoCache[benefitsData?.videos[5]?.url ?? ""] ?? benefitsData?.videos[5]?.url ?? "",
        displayMode: "modal",
      },
      {
        x: 51,
        y: 69.75,
        color: "secondary",
        video: videoCache[benefitsData?.videos[6]?.url ?? ""] ?? benefitsData?.videos[6]?.url ?? "",
        displayMode: "modal",
      },
    ],
    [benefitsData, videoCache]
  );

  // Preload images and videos once and set a local cache for videos so we can play them without
  // additional network requests.
  useEffect(() => {
    if (!benefitsData) return;

    let loadedCount = 0;

    const imageUrls: string[] = [DEFAULT_IMAGE, ...benefitsData.stillImages.map((m) => m.url)];
    const videoUrls: string[] = [
      ...benefitsData.videos.map((m) => m.url),
      ...benefitsData.reverseVideos.map((m) => m.url),
    ];

    const totalAssets = imageUrls.length + videoUrls.length;

    const markLoaded = () => {
      loadedCount += 1;
      if (loadedCount === totalAssets) setIsLoading(false);
    };

    // Preload images (browser cache will handle duplicates)
    imageUrls.forEach((src) => {
      const img = new window.Image();
      img.src = src;
      img.onload = markLoaded;
      img.onerror = markLoaded;
    });

    // Preload videos – fetch each URL once and convert to objectURL for instant reuse.
    videoUrls.forEach((src) => {
      if (videoCache[src]) {
        // Already fetched and cached in state
        markLoaded();
        return;
      }

      fetch(src)
        .then((res) => res.blob())
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          setVideoCache((prev) => ({ ...prev, [src]: objectUrl }));
        })
        .catch((err) => console.error("Error preloading video:", err))
        .finally(markLoaded);
    });

    // Cleanup object URLs on unmount to prevent memory leaks
    return () => {
      Object.values(videoCache).forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [benefitsData]);

  // Handle modal video playback
  useEffect(() => {
    const videoInstance = videoRef.current;
    if (!videoInstance) return;

    if (modalOpen) {
      videoInstance.currentTime = 0;
      videoInstance.play().catch((err) => console.error("Error playing modal video:", err));
    } else {
      videoInstance.pause();
    }

    return () => {
      videoInstance.pause();
    };
  }, [modalOpen]);

  // Handle fullscreen video playback
  useEffect(() => {
    const fullscreenVideoInstance = fullscreenVideoRef.current;
    if (!fullscreenVideoInstance) return;

    if (isFullscreenPlaying) {
      fullscreenVideoInstance.currentTime = 0;
      fullscreenVideoInstance.play().catch((err) => console.error("Error playing fullscreen video:", err));
    } else {
      fullscreenVideoInstance.pause();
    }

    return () => {
      fullscreenVideoInstance.pause();
    };
  }, [isFullscreenPlaying]);

  const handleVideoEnd = useCallback(() => {
    if (!selectedHotspot) return;

    if (selectedHotspot.displayMode === "modal") {
      setModalOpen(false);
      setSelectedHotspot(null);
    } else if (isPlayingReverse) {
      // When reverse video ends, reset everything
      setIsPlayingReverse(false);
      setIsFullscreenPlaying(false);
      setSelectedHotspot(null);
      setIsDonePlaying(true);
    }
  }, [selectedHotspot, isPlayingReverse]);

  const handleHotspotClick = useCallback(
    (index: number) => {
      const hotspot = hotspots[index];
      setSelectedHotspot(hotspot);

      if (hotspot.displayMode === "modal") {
        setModalOpen(true);
      } else {
        setIsFullscreenPlaying(true);
        setIsDonePlaying(false);
      }
    },
    [hotspots]
  );

  const handleCloseFullscreen = useCallback(() => {
    if (selectedHotspot?.reverseVideo) {
      setIsPlayingReverse(true);
    } else {
      setIsFullscreenPlaying(false);
      setSelectedHotspot(null);
    }
  }, [selectedHotspot]);

  const handleVideoStart = useCallback(() => {
    setIsDonePlaying(false);

    if (!selectedHotspot?.stillImage) return;

    const newImage = isPlayingReverse ? DEFAULT_IMAGE : selectedHotspot.stillImage;

    // Small delay to ensure timing with video
    // setTimeout(() => {
    setCurrentImage(newImage);
    // }, 50);
  }, [selectedHotspot, isPlayingReverse, DEFAULT_IMAGE]);

  const handleNavigateBack = useCallback(() => {
    router.push("/setup");
  }, [router]);

  return (
    <div className="min-h-screen bg-white relative w-full h-screen">
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Base background image */}
          <Image
            src={currentImage}
            alt="Vista iniziale"
            fill
            className="object-cover h-full w-full"
            priority
            quality={100}
          />

          {/* Fullscreen video background */}
          {isFullscreenPlaying && selectedHotspot && !isDonePlaying && (
            <FullScreenVideo
              videoRef={fullscreenVideoRef}
              handleVideoStart={handleVideoStart}
              videoSrc={isPlayingReverse ? selectedHotspot.reverseVideo! : selectedHotspot.video}
              handleCloseVideo={handleCloseFullscreen}
              handleVideoEnd={handleVideoEnd}
              showCloseButton={!isPlayingReverse}
            />
          )}

          {/* Hotspots */}
          {!isFullscreenPlaying &&
            hotspots.map((hotspot, index) => (
              <NumberHotspot
                color={hotspot.color}
                number={index + 1}
                onClick={() => handleHotspotClick(index)}
                position={{ x: hotspot.x, y: hotspot.y }}
                key={`hotspot-${index}`}
              />
            ))}

          {/* Modal for non-fullscreen videos */}
          {modalOpen && selectedHotspot?.displayMode === "modal" && (
            <VideoPlayer
              videoRef={videoRef}
              videoSrc={selectedHotspot.video}
              handleCloseModal={() => setModalOpen(false)}
              handleVideoEnd={handleVideoEnd}
            />
          )}

          {/* Back button */}
          {!isFullscreenPlaying && (
            <div className="absolute bottom-5 left-5 right-5 p-4 z-10">
              <div className="flex justify-between">
                <button
                  className="bg-primary text-white font-bold p-2 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary group"
                  onClick={handleNavigateBack}
                  aria-label="Back to setup"
                >
                  <ArrowLeft className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white group-hover:text-primary" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Benefits;
