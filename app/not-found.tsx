"use client";

import { Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-lg border border-slate-200 p-8 space-y-6">
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

          {/* 404 Number */}
          <div className="text-center">
            <h1 className="text-8xl font-bold text-blue-600">
              404
            </h1>
          </div>

          {/* Error Message */}
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-bold text-slate-800">
              Page Not Found
            </h2>
            <p className="text-slate-600 text-lg">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
          </div>

          {/* Illustration or icon */}
          <div className="flex justify-center py-4">
            <div className="bg-blue-600 p-6 rounded-lg">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleGoHome}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Go Home
            </button>

            <button
              onClick={handleGoBack}
              className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 border border-slate-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
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
