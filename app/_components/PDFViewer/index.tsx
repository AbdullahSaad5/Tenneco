import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure PDF.js worker
// pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  pdfUrl: string;
  handleCloseModal: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl, handleCloseModal }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const pdfWidth = 1000; // Fixed PDF width in pixels
  const [pdfWidth, setPdfWidth] = useState(1000); // Fixed PDF width in pixels

  // Dynamically set PDF width based on window width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setPdfWidth(window.innerWidth - 80); // 32px padding on each side
      } else {
        setPdfWidth(1000);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center pointer-events-auto p-4">
      <div
        className="h-4/5 relative bg-white rounded-lg overflow-hidden"
        style={{ width: `${pdfWidth + 64}px` }} // PDF width + 32px padding on each side
      >
        <button
          onClick={() => handleCloseModal()}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-primary hover:bg-secondary transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="w-full h-full overflow-y-auto px-8 py-6">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-lg font-medium text-gray-700">Loading PDF...</div>
            </div>
          )}

          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            className="flex flex-col items-center"
            error={
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-red-500 text-lg">Error loading PDF. Please try again later.</p>
              </div>
            }
          >
            {Array.from(new Array(numPages || 0), (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                width={pdfWidth}
                className="mb-8 shadow-md"
              />
            ))}
          </Document>

          {!isLoading && numPages && <div className="text-center text-gray-600 mt-4 mb-2">Total Pages: {numPages}</div>}
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
