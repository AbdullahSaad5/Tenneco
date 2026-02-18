"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
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

  const { getLanguages } = useAxios();

  const languagesQuery = useQuery({
    queryKey: ["languages"],
    queryFn: ({ signal }) => getLanguages(signal),
  });

  // Filter and sort enabled languages
  const availableLanguages = useMemo(() => {
    if (!languagesQuery.data) return [];
    return languagesQuery.data
      .filter((lang) => lang.isEnabled)
      .sort((a, b) => a.order - b.order);
  }, [languagesQuery.data]);

  // Set initial language when languages load
  useEffect(() => {
    if (availableLanguages.length === 0) return;

    const defaultLang = availableLanguages.find((lang) => lang.isDefault);
    const storedLanguage =
      typeof window !== "undefined"
        ? localStorage.getItem("tenneco-language")
        : null;

    if (storedLanguage && availableLanguages.some((lang) => lang.code === storedLanguage)) {
      setCurrentLanguage(storedLanguage);
    } else if (defaultLang) {
      setCurrentLanguage(defaultLang.code);
    } else if (availableLanguages.length > 0) {
      setCurrentLanguage(availableLanguages[0].code);
    }
  }, [availableLanguages]);

  // Update language and persist to localStorage
  const setLanguage = useCallback(
    (languageCode: string) => {
      const languageExists = availableLanguages.some(
        (lang) => lang.code === languageCode
      );

      if (languageExists) {
        setCurrentLanguage(languageCode);
        if (typeof window !== "undefined") {
          localStorage.setItem("tenneco-language", languageCode);
        }
      }
    },
    [availableLanguages]
  );

  // Get translated text based on current language
  const getTranslation = useCallback(
    (defaultText: string, translations?: Translation[]): string => {
      if (!translations || translations.length === 0) {
        return defaultText;
      }

      const defaultLang = availableLanguages.find((lang) => lang.isDefault);
      if (defaultLang && currentLanguage === defaultLang.code) {
        return defaultText;
      }

      const translation = translations.find(
        (t) => t.language === currentLanguage
      );

      return translation?.value || defaultText;
    },
    [currentLanguage, availableLanguages]
  );

  const isLoading = languagesQuery.isLoading;
  const error = languagesQuery.error ? (languagesQuery.error as Error).message : null;

  const contextValue = useMemo<LanguageContextValue>(
    () => ({
      currentLanguage,
      availableLanguages,
      isLoading,
      error,
      setLanguage,
      getTranslation,
    }),
    [currentLanguage, availableLanguages, isLoading, error, setLanguage, getTranslation]
  );

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
