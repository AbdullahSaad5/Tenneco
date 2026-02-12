"use client";

import { useEffect } from "react";
import { useContent } from "../providers/ContentProvider";
import { getMediaUrl } from "../utils/mediaUrl";

export function FaviconUpdater() {
  const { appSettings } = useContent();

  useEffect(() => {
    const faviconUrl = appSettings?.branding?.favicon
      ? (getMediaUrl(appSettings.branding.favicon.mediaUrl) || appSettings.branding.favicon.fallbackPath || "/favicon.ico")
      : "/favicon.ico";

    // Update existing favicon links
    const iconLinks = document.querySelectorAll("link[rel*='icon']");
    iconLinks.forEach((link) => {
      (link as HTMLLinkElement).href = faviconUrl;
    });

    // If no favicon links exist, create them
    if (iconLinks.length === 0) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/x-icon";
      link.href = faviconUrl;
      document.head.appendChild(link);
    }
  }, [appSettings]);

  return null;
}
