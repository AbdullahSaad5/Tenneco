"use client";

import React, { useRef, useState } from "react";
import VideoPlayer from "../../VideoPlayer";
import dynamic from "next/dynamic";
const PDFViewer = dynamic(() => import("../../PDFViewer"), { ssr: false });

type Button = {
  text: string;
  resourceType: "video" | "pdf";
  src: string;
};

const BenefitsCard = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState<Button | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoEnd = () => {
    if (selectedButton?.resourceType === "video") {
      setModalOpen(false);
      setSelectedButton(null);
    }
  };

  const buttons: Button[] = [
    {
      text: "Teaser",
      resourceType: "video",
      src: "/assets/videos/TRAILER FINAL V7 16.12_LQ2.mp4",
    },
    {
      text: "Brochure",
      resourceType: "pdf",
      src: "/assets/pdfs/Brochure Dolphin ITA (1)_compressed.pdf",
    },
    {
      text: "Glossario",
      resourceType: "pdf",
      src: "/assets/pdfs/AB Medica Mockup brochure_compressed.pdf",
    },
    {
      text: "Manuale d'uso",
      resourceType: "pdf",
      src: "/assets/pdfs/MU 1 03 01 01 REV.01.pdf",
    },
  ];
  return (
    <div className="mt-[calc(10vh+2rem)] flex w-full justify-start z-10">
      <div className="w-[35vw] bg-white/75  rounded-3xl shadow-lg py-[2vh] px-[2.2vw] space-y-3  pointer-events-auto">
        <p className="text-[36px] text-primary font-semibold">Dolphin</p>
        <p className="text-[2.2vh] text-black">
          Dolphin è un dispositivo medico brevettato per l&apos;interventistica laparoscopica, mini-laparoscopica e
          robotica.{" "}
        </p>
        <div className="flex items-center justify-center flex-wrap gap-4 ">
          {buttons.map((button, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedButton(button);
                setModalOpen(true);
              }}
              className="bg-secondary text-[1.85vh] text-primary font-semibold px-4 py-1 rounded-[0.75rem] shadow-custom hover:shadow-custom-hovered transition-all"
            >
              {button.text}
            </button>
          ))}
        </div>
      </div>
      {modalOpen && selectedButton && selectedButton.resourceType === "video" && (
        <VideoPlayer
          videoRef={videoRef}
          videoSrc={selectedButton?.src as string}
          handleCloseModal={() => setModalOpen(false)}
          handleVideoEnd={handleVideoEnd}
        />
      )}
      {modalOpen && selectedButton && selectedButton.resourceType === "pdf" && (
        <PDFViewer
          // pdfUrl={"https://cdn.filestackcontent.com/wcrjf9qPTCKXV3hMXDwK"}
          pdfUrl={selectedButton?.src as string}
          handleCloseModal={() => setModalOpen(false)}
        />
      )}
    </div>
  );
};

export default BenefitsCard;
