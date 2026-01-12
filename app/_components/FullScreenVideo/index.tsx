import { ArrowLeft } from "lucide-react";
import React, { useState } from "react";

const FullScreenVideo = ({
  videoRef,
  videoSrc,
  handleCloseVideo,
  handleVideoEnd,
  handleVideoStart,
  showCloseButton,
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  videoSrc: string;
  handleCloseVideo: () => void;
  handleVideoEnd: () => void;
  handleVideoStart?: () => void;
  showCloseButton: boolean;
}) => {
  const [disabled, setDisabled] = useState(false);

  return (
    <div className="absolute inset-0">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        muted
        playsInline
        onPlay={() => {
          setDisabled(true);
          if (handleVideoStart) handleVideoStart();
        }}
        onEnded={() => {
          setDisabled(false);
          handleVideoEnd();
        }}
        src={videoSrc}
      ></video>
      {showCloseButton && (
        <div className="absolute bottom-5 left-5 right-5 p-4 z-10">
          <div className="flex justify-between">
            <button
              className="bg-primary text-white font-bold p-2 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary group"
              onClick={handleCloseVideo}
              aria-label="Close video"
              disabled={disabled}
            >
              <ArrowLeft className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white group-hover:text-primary" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FullScreenVideo;
