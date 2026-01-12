import { X } from "lucide-react";
import React from "react";

const VideoPlayer = ({
  videoRef,
  videoSrc,
  handleCloseModal,
  handleVideoEnd,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoSrc: string;
  handleCloseModal: () => void;
  handleVideoEnd: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center pointer-events-auto z-50">
      <div className="w-3/4 relative">
        <button
          onClick={() => handleCloseModal()}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-6 md:right-6 lg:top-8 lg:right-8 z-10 p-2  rounded-lg sm:rounded-xl  md:rounded-2xl bg-primary hover:bg-secondary transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 sm:h-8 sm:w-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-white" />
        </button>

        <div className="w-full relative">
          <video
            ref={videoRef}
            className="w-full h-auto rounded-lg"
            autoPlay
            controls
            playsInline
            onEnded={handleVideoEnd}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
