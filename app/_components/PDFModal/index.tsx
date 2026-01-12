"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, RotateCw, Monitor, Smartphone } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

interface PDFModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PDFModal: React.FC<PDFModalProps> = ({ isOpen, onClose }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfWidth, setPdfWidth] = useState(1200);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("landscape");

  const pdfUrl = "./assets/pdfs/Pads.pdf";

  useEffect(() => {
    const handleResize = () => {
      const viewportWidth = window.innerWidth;
      
      if (orientation === "landscape") {
        if (viewportWidth < 768) {
          setPdfWidth(viewportWidth - 60);
        } else if (viewportWidth < 1024) {
          setPdfWidth(viewportWidth - 120);
        } else {
          setPdfWidth(viewportWidth - 200);
        }
      } else {
        const baseWidth = viewportWidth < 768 ? viewportWidth - 80 : viewportWidth < 1024 ? 600 : 800;
        setPdfWidth(baseWidth);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [orientation]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setPageNumber(1);
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleOrientationToggle = () => {
    setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"));
  };

  const handleDownload = () => {
    window.open(pdfUrl, "_blank");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Technical Documentation</h2>
                  <p className="text-sm text-white/90">Product specifications and details</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors group"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors group"
                  title="Close"
                >
                  <X className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-700">Loading PDF...</p>
                  </div>
                </div>
              )}

              <div className="h-full overflow-auto p-4">
                <div className="flex justify-center items-center min-h-full">
                  <Document
                    file={pdfUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div />}
                    error={
                      <div className="flex flex-col items-center justify-center py-12">
                        <FileText className="w-24 h-24 text-red-300 mb-4" />
                        <p className="text-red-600 text-lg font-semibold">Error loading PDF</p>
                        <p className="text-gray-600 text-sm mt-2">Please try again later</p>
                      </div>
                    }
                  >
                    <Page
                      pageNumber={pageNumber}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      width={pdfWidth * scale}
                      rotate={rotation}
                      className="shadow-2xl rounded-lg overflow-hidden border border-gray-200 max-w-full"
                    />
                  </Document>
                </div>
              </div>
            </div>

            <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleZoomOut}
                    disabled={scale <= 0.6}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-5 h-5 text-gray-700" />
                  </button>
                  <span className="text-sm text-gray-700 font-semibold min-w-[60px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    disabled={scale >= 2.0}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-5 h-5 text-gray-700" />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-2" />
                  <button
                    onClick={handleRotate}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Rotate"
                  >
                    <RotateCw className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    onClick={handleOrientationToggle}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={orientation === "portrait" ? "Switch to Landscape" : "Switch to Portrait"}
                  >
                    {orientation === "portrait" ? (
                      <Monitor className="w-5 h-5 text-gray-700" />
                    ) : (
                      <Smartphone className="w-5 h-5 text-gray-700" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrevPage}
                    disabled={pageNumber <= 1}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-700 group-hover:text-red-600" />
                  </button>
                  <span className="text-sm text-gray-700 font-semibold">
                    Page {pageNumber} of {numPages || "..."}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={pageNumber >= (numPages || 1)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                    title="Next Page"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PDFModal;
