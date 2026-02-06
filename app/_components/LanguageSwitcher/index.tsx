"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface LanguageSwitcherProps {
  className?: string;
  variant?: "dropdown" | "buttons";
  theme?: "light" | "dark";
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  variant = "dropdown",
  theme = "dark",
}) => {
  const { currentLanguage, availableLanguages, setLanguage, isLoading } =
    useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get current language object
  const currentLang = availableLanguages.find(
    (lang) => lang.code === currentLanguage
  );

  // Sort languages: current/default language first, then alphabetically
  const sortedLanguages = [...availableLanguages].sort((a, b) => {
    // Current language comes first
    if (a.code === currentLanguage) return -1;
    if (b.code === currentLanguage) return 1;
    // Then sort alphabetically by native name
    return a.nativeName.localeCompare(b.nativeName);
  });

  // Handle language change
  const handleLanguageChange = (languageCode: string) => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  // Don't render if still loading
  if (isLoading) {
    return null;
  }

  // Button variant - horizontal list of language buttons
  if (variant === "buttons") {
    return (
      <div className={`flex gap-2 ${className}`}>
        {sortedLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
              ${
                lang.code === currentLanguage
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }
            `}
            aria-label={`Switch to ${lang.name}`}
          >
            {lang.code.toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant - default
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
          transition-all duration-200
          ${
            theme === "light"
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
              : "bg-white/10 hover:bg-white/20 text-white border border-white/10"
          }
        `}
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
        <span>{currentLang?.nativeName || "Language"}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`
            absolute top-full right-0 mt-2 w-48 rounded-lg shadow-xl
            overflow-hidden z-50
            ${
              theme === "light"
                ? "bg-white border border-slate-200"
                : "bg-slate-800 border border-white/10"
            }
          `}
        >
          {sortedLanguages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`
                w-full px-4 py-3 text-left text-sm
                transition-all duration-150
                ${
                  lang.code === currentLanguage
                    ? "bg-blue-600 text-white"
                    : theme === "light"
                    ? "text-slate-700 hover:bg-slate-100"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs opacity-70">{lang.name}</div>
                </div>
                {lang.code === currentLanguage && (
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
