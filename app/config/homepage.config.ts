// ============================================================================
// Homepage Configuration - Matches HomepageContent interface from content.ts
// ============================================================================

import { HomepageContent } from "../_types/content";

/**
 * Homepage content configuration matching CMS HomepageContent interface
 */
export const HOMEPAGE_CONFIG: HomepageContent = {
  id: "homepage-static",
  logo: {
    mediaId: "",
    alt: "Tenneco Logo",
    altTranslations: [
      { language: "it", value: "Logo Tenneco" },
    ],
    width: 180,
    height: 50,
    fallbackPath: "/tenneco-logo.png",
  },
  hero: {
    title: "Welcome to Tenneco Braking",
    titleTranslations: [
      { language: "it", value: "Benvenuti in Tenneco Braking" },
    ],
    subtitle: "Where advanced braking technology meets real world performance",
    subtitleTranslations: [
      { language: "it", value: "Dove la tecnologia avanzata dei freni incontra le prestazioni del mondo reale" },
    ],
    description:
      "We deliver one of the most comprehensive brake pad portfolios available, serving passenger cars, commercial vehicles and railway systems",
    descriptionTranslations: [
      { language: "it", value: "Offriamo uno dei portfolio più completi di pastiglie freno disponibili, al servizio di auto passeggeri, veicoli commerciali e sistemi ferroviari" },
    ],
  },
  section: {
    sectionTitle: "Select the mobility sector you want to explore",
    sectionTitleTranslations: [
      { language: "it", value: "Seleziona il settore di mobilità che vuoi esplorare" },
    ],
    sectionSubtitle: "Discover how Tenneco Braking solutions perform across different applications, gearing always up for the future, so you can stop worrying about stopping!",
    sectionSubtitleTranslations: [
      { language: "it", value: "Scopri come le soluzioni Tenneco Braking funzionano nelle diverse applicazioni, sempre proiettati verso il futuro, così puoi smettere di preoccuparti di fermarti!" },
    ],
  },
  vehicleCategories: [
    {
      id: "light-vehicles",
      vehicleType: "light",
      order: 1,
      title: "Light Vehicles",
      titleTranslations: [
        { language: "it", value: "Veicoli Leggeri" },
      ],
      subtitle: "Passenger cars and light trucks",
      subtitleTranslations: [
        { language: "it", value: "Auto passeggeri e camion leggeri" },
      ],
      imageMediaId: "",
      gradient: {
        from: "blue-500",
        to: "cyan-500",
      },
      targetRoute: "/viewer?vehicle=light&animate=true",
      isEnabled: true,
    },
    {
      id: "commercial-vehicles",
      vehicleType: "commercial",
      order: 2,
      title: "Commercial Vehicles",
      titleTranslations: [
        { language: "it", value: "Veicoli Commerciali" },
      ],
      subtitle: "Heavy duty trucks and buses",
      subtitleTranslations: [
        { language: "it", value: "Camion pesanti e autobus" },
      ],
      imageMediaId: "",
      gradient: {
        from: "orange-500",
        to: "red-500",
      },
      targetRoute: "/viewer?vehicle=commercial&animate=true",
      isEnabled: true,
    },
    {
      id: "rail",
      vehicleType: "rail",
      order: 3,
      title: "Rail",
      titleTranslations: [
        { language: "it", value: "Ferroviario" },
      ],
      subtitle: "Trains and railway systems",
      subtitleTranslations: [
        { language: "it", value: "Treni e sistemi ferroviari" },
      ],
      imageMediaId: "",
      gradient: {
        from: "purple-500",
        to: "pink-500",
      },
      targetRoute: "/viewer?vehicle=rail&animate=true",
      isEnabled: true,
    },
  ],
};

/**
 * Fallback images for vehicle categories when CMS media is unavailable
 */
export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  light: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80",
  commercial: "https://images.unsplash.com/photo-1602721186896-1b21c7405c0b?w=800&q=80",
  rail: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800&q=80",
};
