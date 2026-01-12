import React from "react";
import InfoCard from "./InfoCard";
import { useActiveComponent } from "@/app/providers/ActiveComponentProvider";
import { ArrowLeft, Camera } from "lucide-react";
import DetailsCard from "./DetailsCard";
import LoadingScreen from "../LoadingScreen";

const UIOverlay = () => {
  const { activeComponent, handleSetActiveComponent, showComponentDetails, loading } = useActiveComponent();

  const anyLoading = Object.values(loading).some((value) => value);
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 p-4 z-10 pointer-events-none">
      {anyLoading ? (
        <LoadingScreen />
      ) : !activeComponent ? (
        <InfoCard />
      ) : activeComponent && showComponentDetails ? (
        <DetailsCard />
      ) : null}

      <div className="absolute bottom-5 left-5 right-5 p-4 z-10">
        <div className="flex justify-between pointer-events-auto">
          {activeComponent ? (
            <div className="flex gap-4">
              <button
                className="bg-primary text-white font-bold p-2 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary group"
                onClick={() => {
                  handleSetActiveComponent(null);
                }}
                aria-label="Close video"
              >
                <ArrowLeft className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white group-hover:text-primary" />
              </button>
              <button
                className="bg-primary text-white font-bold p-2 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary group"
                onClick={() => {
                  const link = document.createElement("a");
                  const canvas = document.querySelector("canvas") as HTMLCanvasElement; // this was the gl dom element
                  link.setAttribute("download", `Screenshot-${Date.now()}.png`);
                  link.setAttribute(
                    "href",
                    canvas // instead of gl.domElement
                      .toDataURL("image/png")
                      .replace("image/png", "image/octet-stream")
                  );
                  link.click();
                  link.remove();
                }}
                aria-label="Take photo"
              >
                <Camera className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white group-hover:text-primary" />
              </button>
            </div>
          ) : (
            <button
              className="bg-primary text-white font-bold p-2 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary group"
              onClick={() => {
                const link = document.createElement("a");
                const canvas = document.querySelector("canvas") as HTMLCanvasElement; // this was the gl dom element
                link.setAttribute("download", `Screenshot-${Date.now()}.png`);
                link.setAttribute(
                  "href",
                  canvas // instead of gl.domElement
                    .toDataURL("image/png")
                    .replace("image/png", "image/octet-stream")
                );
                link.click();
                link.remove();
              }}
              aria-label="Take photo"
            >
              <Camera className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-white group-hover:text-primary" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
