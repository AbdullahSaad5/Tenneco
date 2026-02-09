"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useContent } from "./providers/ContentProvider";
import { CATEGORY_FALLBACK_IMAGES } from "./config/homepage.config";
import type { VehicleType } from "./_types/content";
import LoadingScreen from "./_components/LoadingScreen";
import { getMediaUrl } from "./utils/mediaUrl";
import LanguageSwitcher from "./_components/LanguageSwitcher";
import { useLanguage } from "./providers/LanguageProvider";

export default function Home() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { homepage, isLoading } = useContent();
  const { getTranslation } = useLanguage();

  // Show loading screen while content is loading
  if (isLoading || !homepage) {
    return <LoadingScreen />;
  }

  // Get sorted and enabled categories from dynamic content
  const categories = homepage.vehicleCategories
    .filter(cat => cat.isEnabled)
    .sort((a, b) => a.order - b.order);

  const handleCardClick = (vehicleType: string) => {
    // Navigate directly to viewer with animation flag
    router.push(`/viewer?vehicle=${vehicleType}&animate=true`);
  };

  // Get category image - use API image if available, otherwise use fallback
  const getCategoryImage = (vehicleType: string, apiImageUrl?: string): string => {
    const fullUrl = getMediaUrl(apiImageUrl);
    return fullUrl || CATEGORY_FALLBACK_IMAGES[vehicleType] || "";
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse-slow" />
          <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl top-1/2 -right-48 animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -bottom-48 left-1/3 animate-pulse-slow" style={{ animationDelay: '2s' }} />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="pt-8 pb-4 px-6">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex-1" />
              <Image
                src={getMediaUrl(homepage.logo.mediaUrl) || homepage.logo.fallbackPath || "/tenneco-logo.png"}
                alt={homepage.logo.alt || "Tenneco Logo"}
                width={homepage.logo.width || 180}
                height={homepage.logo.height || 50}
                className="h-12 w-auto brightness-0 invert"
              />
              <div className="flex-1 flex justify-end">
                <LanguageSwitcher variant="dropdown" />
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section className="px-6 pt-16 pb-20">
            <div className="max-w-6xl mx-auto text-center space-y-8">
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                {getTranslation(homepage.hero.title, homepage.hero.titleTranslations)}
              </h1>

              <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                {getTranslation(homepage.hero.subtitle, homepage.hero.subtitleTranslations)}
              </p>

              <p className="text-lg text-white/80 max-w-3xl mx-auto">
                {getTranslation(homepage.hero.description, homepage.hero.descriptionTranslations)}
              </p>
            </div>
          </section>

          {/* Selection Section */}
          <section className="px-6 pb-20">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {getTranslation(homepage.section?.sectionTitle || '', homepage.section?.sectionTitleTranslations)}
                </h2>
                {homepage.section?.sectionSubtitle && (
                  <p className="text-lg text-blue-100">
                    {getTranslation(homepage.section.sectionSubtitle, homepage.section.sectionSubtitleTranslations)}
                  </p>
                )}
              </div>

              {/* Vehicle Category Cards */}
              <div className={`grid grid-cols-1 gap-6 ${
                categories.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' :
                categories.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' :
                categories.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' :
                'md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCardClick(category.vehicleType)}
                    className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer text-left w-full"
                    onMouseEnter={() => setHoveredCard(category.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    {/* Image Container */}
                    <div className="relative h-72 overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br from-${category.gradient.from} to-${category.gradient.to} opacity-30 group-hover:opacity-40 transition-opacity z-10`} />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getCategoryImage(category.vehicleType, category.imageUrl)}
                        alt={category.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20" />

                      {/* Arrow Icon */}
                      <div className="absolute top-4 right-4 z-30">
                        <div className={`w-12 h-12 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 ${hoveredCard === category.id ? 'scale-110 rotate-45' : ''}`}>
                          <ArrowRight className="w-6 h-6 text-slate-900" />
                        </div>
                      </div>

                      {/* Title Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
                        <h3 className="text-2xl font-bold text-white mb-1">
                          {getTranslation(category.title, category.titleTranslations)}
                        </h3>
                        <p className="text-white/70 text-sm">
                          {getTranslation(category.subtitle, category.subtitleTranslations)}
                        </p>
                      </div>
                    </div>

                    {/* Hover Effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-600/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
