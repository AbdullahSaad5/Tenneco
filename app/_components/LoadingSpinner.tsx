import React from "react";

interface LoadingSpinnerProps {
  children?: React.ReactNode;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ children }) => {
  return (
    <div className="fixed inset-0">
      {children}
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-black border-t-transparent border-b-transparent rounded-full animate-[spin_0.5s_linear_infinite]"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
