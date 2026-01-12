"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-200/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-purple-200/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-lg w-full relative z-10">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 space-y-6 border border-slate-200">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative h-16 w-40 mb-4">
              <Image
                src="/tenneco-logo.png"
                alt="Tenneco Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-6 rounded-2xl shadow-lg">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-3 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Oops! Something went wrong
            </h1>
            <p className="text-slate-600 text-lg">
              We encountered an unexpected error. Don&apos;t worry, our team has been notified.
            </p>
            {error.message && (
              <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm text-red-600 font-mono break-words">{error.message}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={reset}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>

            <button
              onClick={handleGoHome}
              className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 border border-slate-200 hover:scale-105"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>
          </div>

          {/* Footer */}
          <div className="pt-4 text-center border-t border-slate-200">
            <p className="text-sm text-slate-500">Tenneco 3D Model Viewer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
