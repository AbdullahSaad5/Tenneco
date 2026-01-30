"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAxios } from "../hooks/useAxios";

// ============================================================================
// Types
// ============================================================================

export interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  isDefault: boolean;
  isEnabled: boolean;
  order: number;
}

export interface Translation {
  language: string;
  value: string;
}

interface LanguageContextValue {
  currentLanguage: string;
  availableLanguages: Language[];
  isLoading: boolean;
  error: string | null;
  setLanguage: (languageCode: string) => void;
  getTranslation: (defaultText: string, translations?: Translation[]) => string;
}

// ============================================================================
// Context
// ============================================================================

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

// ============================================================================
// Provider Component
// ============================================================================

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: string;
}

export const LanguageProvider = ({
  children,
  defaultLanguage = "en",
}: LanguageProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(defaultLanguage);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getLanguages } = useAxios();

  // Fetch available languages on mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoading(true);
        const languages = await getLanguages();

        // Filter only enabled languages and sort by order
        const enabledLanguages = languages
          .filter((lang) => lang.isEnabled)
          .sort((a, b) => a.order - b.order);

        setAvailableLanguages(enabledLanguages);

        // Set default language from CMS or use provided default
        const defaultLang = enabledLanguages.find((lang) => lang.isDefault);
        const storedLanguage = typeof window !== "undefined"
          ? localStorage.getItem("tenneco-language")
          : null;

        if (storedLanguage && enabledLanguages.some(lang => lang.code === storedLanguage)) {
          setCurrentLanguage(storedLanguage);
        } else if (defaultLang) {
          setCurrentLanguage(defaultLang.code);
        } else if (enabledLanguages.length > 0) {
          setCurrentLanguage(enabledLanguages[0].code);
        }
      } catch (err) {
        console.error("Failed to fetch languages:", err);
        setError("Failed to load languages");
        // Use default language as fallback
        setAvailableLanguages([
          {
            id: "default-en",
            code: "en",
            name: "English",
            nativeName: "English",
            isDefault: true,
            isEnabled: true,
            order: 1,
          },
        ]);
        setCurrentLanguage("en");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguages();
  }, [getLanguages]);

  // Update language and persist to localStorage
  const setLanguage = useCallback((languageCode: string) => {
    const languageExists = availableLanguages.some(
      (lang) => lang.code === languageCode
    );

    if (languageExists) {
      setCurrentLanguage(languageCode);
      if (typeof window !== "undefined") {
        localStorage.setItem("tenneco-language", languageCode);
      }
    } else {
      console.warn(`Language "${languageCode}" is not available`);
    }
  }, [availableLanguages]);

  // Get translated text based on current language
  const getTranslation = useCallback(
    (defaultText: string, translations?: Translation[]): string => {
      // If no translations provided or empty, return default
      if (!translations || translations.length === 0) {
        return defaultText;
      }

      // If current language is the default language, return default text
      const defaultLang = availableLanguages.find((lang) => lang.isDefault);
      if (defaultLang && currentLanguage === defaultLang.code) {
        return defaultText;
      }

      // Find translation for current language
      const translation = translations.find(
        (t) => t.language === currentLanguage
      );

      // Return translated text or fall back to default
      return translation?.value || defaultText;
    },
    [currentLanguage, availableLanguages]
  );

  const contextValue: LanguageContextValue = {
    currentLanguage,
    availableLanguages,
    isLoading,
    error,
    setLanguage,
    getTranslation,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// ============================================================================
// Hook
// ============================================================================

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
};

export default LanguageProvider;
