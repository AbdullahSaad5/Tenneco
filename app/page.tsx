"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const vehicleCategories = [
    {
      id: "light-vehicles",
      title: "Light Vehicles",
      description: "Advanced braking solutions for passenger cars and light-duty vehicles",
      features: [
        "Superior stopping power",
        "Reduced brake dust",
        "Extended pad life",
        "Quiet operation"
      ],
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
      gradient: "from-blue-600 to-cyan-500"
    },
    {
      id: "commercial-vehicles",
      title: "Commercial Vehicles",
      description: "Heavy-duty braking systems engineered for trucks and commercial fleets",
      features: [
        "High-performance materials",
        "Enhanced durability",
        "Optimized for heavy loads",
        "Cost-effective solutions"
      ],
      image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800&q=80",
      gradient: "from-orange-600 to-red-500"
    },
    {
      id: "rail",
      title: "Rail Systems",
      description: "Precision braking technology for railway and mass transit applications",
      features: [
        "Maximum reliability",
        "Consistent performance",
        "Weather resistant",
        "Safety certified"
      ],
      image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80",
      gradient: "from-purple-600 to-pink-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/tenneco-logo.png"
                alt="Tenneco Logo"
                width={150}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <div className="flex items-center gap-6">
              <a href="#solutions" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Solutions
              </a>
              <a href="#about" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                About
              </a>
              <a href="#contact" className="text-slate-700 hover:text-blue-600 font-medium transition-colors">
                Contact
              </a>
              <button className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all hover:scale-105">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                First Screen
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 leading-tight">
              Welcome to <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Tenneco Braking</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              Where advanced braking technology meets real world performance
            </p>

            <p className="text-lg text-slate-700 max-w-3xl mx-auto">
              We deliver one of the most comprehensive brake pad portfolios available,
              serving passenger cars, commercial vehicles and railway systems
            </p>

            <div className="flex items-center justify-center gap-4 pt-6">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-all hover:scale-105 flex items-center gap-2">
                Explore Solutions
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 bg-white text-slate-700 rounded-lg font-semibold text-lg border-2 border-slate-300 hover:border-blue-600 hover:text-blue-600 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-bold">500+</div>
              <div className="text-blue-100">Brake Pad Solutions</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">50+</div>
              <div className="text-blue-100">Years of Innovation</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">100+</div>
              <div className="text-blue-100">Countries Served</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section id="solutions" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
              Select Your Mobility Sector
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Explore and discover how Tenneco Braking solutions perform across different applications,
              gearing always up for the future, so you can stop worrying about stopping!
            </p>
          </div>

          {/* Vehicle Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {vehicleCategories.map((category) => (
              <div
                key={category.id}
                className="group relative overflow-hidden rounded-2xl bg-white border-2 border-slate-200 hover:border-blue-500 transition-all duration-500 hover:shadow-2xl cursor-pointer"
                onMouseEnter={() => setHoveredCard(category.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-20 group-hover:opacity-30 transition-opacity z-10`} />
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 z-20">
                    <div className={`w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform ${hoveredCard === category.id ? 'scale-110 rotate-45' : ''}`}>
                      <ArrowRight className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {category.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-2 pt-2">
                    {category.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button className="w-full mt-4 px-6 py-3 bg-slate-900 text-white rounded-lg font-semibold group-hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                    Explore {category.title}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Ready to Experience the Future of Braking?
          </h2>
          <p className="text-xl text-blue-100">
            Get in touch with our experts to find the perfect braking solution for your needs
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all hover:scale-105">
              Contact Sales
            </button>
            <button className="px-8 py-4 bg-transparent text-white rounded-lg font-semibold text-lg border-2 border-white hover:bg-white/10 transition-all">
              Download Catalog
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Image
                src="/tenneco-logo.png"
                alt="Tenneco Logo"
                width={150}
                height={40}
                className="h-10 w-auto brightness-0 invert"
              />
              <p className="text-slate-400 text-sm">
                Leading the future of braking technology worldwide
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Products</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Light Vehicles</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Commercial Vehicles</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Rail Systems</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Technical Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Tenneco. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
