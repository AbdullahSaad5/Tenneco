import { NextResponse } from "next/server";

// Revalidate the favicon every hour
export const revalidate = 3600;

export const size = { width: 32, height: 32 };
export const contentType = "image/x-icon";

/**
 * Dynamic favicon route handler.
 * Fetches the favicon from the CMS at build time and revalidates every hour.
 * Falls back to a simple default icon if the CMS is unreachable.
 */
export default async function Icon() {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
  const baseUrl = apiUrl.replace("/api", "");

  try {
    // Fetch app settings from CMS
    const settingsRes = await fetch(`${apiUrl}/app-settings`, {
      next: { revalidate: 3600 },
    });

    if (!settingsRes.ok) throw new Error("Failed to fetch app settings");

    const settingsData = await settingsRes.json();
    const data = Array.isArray(settingsData?.docs)
      ? settingsData.docs[0]
      : settingsData;

    const faviconUrl = data?.branding?.favicon?.media?.url;

    if (faviconUrl) {
      // Build full URL from relative CMS path
      const fullUrl = faviconUrl.startsWith("/")
        ? `${baseUrl}${faviconUrl}`
        : faviconUrl;

      const imageRes = await fetch(fullUrl, {
        next: { revalidate: 3600 },
      });

      if (imageRes.ok) {
        const buffer = await imageRes.arrayBuffer();
        const detectedType =
          imageRes.headers.get("content-type") || "image/x-icon";

        return new NextResponse(buffer, {
          headers: {
            "Content-Type": detectedType,
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        });
      }
    }
  } catch {
    // Fall through to default icon
  }

  // Fallback: serve the static favicon from public/
  try {
    const { readFile } = await import("fs/promises");
    const { join } = await import("path");
    const fallbackPath = join(process.cwd(), "public", "favicon.png");
    const fallbackBuffer = await readFile(fallbackPath);

    return new NextResponse(fallbackBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    // Last resort: return a tiny transparent 1x1 PNG
    const TRANSPARENT_PNG = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );
    return new NextResponse(TRANSPARENT_PNG, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=60",
      },
    });
  }
}
