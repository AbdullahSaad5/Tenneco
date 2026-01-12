"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const vehicleCategories = [
    {
      id: "lv",
      title: "Light Vehicles",
      subtitle: "Passenger Cars & Light-Duty Vehicles",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
      gradient: "from-blue-600 to-cyan-500"
    },
    {
      id: "asm",
      title: "Commercial Vehicles",
      subtitle: "Trucks & Commercial Fleets",
      image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80",
      gradient: "from-orange-600 to-red-500"
    },
    {
      id: "pad",
      title: "Rail",
      subtitle: "Railway & Mass Transit Systems",
      image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80",
      gradient: "from-purple-600 to-pink-500"
    }
  ];

  return (
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
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <Image
              src="/tenneco-logo.png"
              alt="Tenneco Logo"
              width={180}
              height={50}
              className="h-12 w-auto brightness-0 invert"
            />
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 pt-16 pb-20">
          <div className="max-w-6xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Welcome to Tenneco Braking
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Where advanced braking technology meets real world performance
            </p>

            <p className="text-lg text-white/80 max-w-3xl mx-auto">
              We deliver one of the most comprehensive brake pad portfolios available,
              serving passenger cars, commercial vehicles and railway systems
            </p>
          </div>
        </section>

        {/* Selection Section */}
        <section className="px-6 pb-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Select the mobility sector you want to explore
              </h2>
              <p className="text-lg text-blue-100">
                Discover how Tenneco Braking solutions perform across different applications,
                gearing always up for the future, so you can stop worrying about stopping!
              </p>
            </div>

            {/* Vehicle Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vehicleCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/viewer?model=${category.id}`}
                  className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer"
                  onMouseEnter={() => setHoveredCard(category.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Image Container */}
                  <div className="relative h-72 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-30 group-hover:opacity-40 transition-opacity z-10`} />
                    <img
                      src={category.image}
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
                        {category.title}
                      </h3>
                      <p className="text-white/70 text-sm">
                        {category.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
