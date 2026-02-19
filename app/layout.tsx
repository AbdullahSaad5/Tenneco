"use client";
import "@ungap/with-resolvers";
import "globalthis/auto";
import { Urbanist } from "next/font/google";
import "./globals.css";
import "./polyfills";
import { ModelPreloaderProvider, PreloadingScreen, usePreload } from "./_components/ModelPreloader";
import { ContentProvider, useContent } from "./providers/ContentProvider";
import { LanguageProvider } from "./providers/LanguageProvider";
import { QueryProvider } from "./providers/QueryProvider";

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
  weight: ["400", "500", "600", "700", "800"],
});

function AppContent({ children }: { children: React.ReactNode }) {
  const { isPreloaded } = usePreload();
  const { isLoading: isContentLoading } = useContent();

  if (!isPreloaded || isContentLoading) {
    return <PreloadingScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* v3.sas.26 — favicon served dynamically via app/icon.ts */}
        <title>Tenneco 3D Model Viewer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Tenneco 3D Model Viewer - Interactive 3D visualization platform" />
        <meta name="keywords" content="Tenneco, 3D Model Viewer, 3D Visualization, Interactive Models" />
        <meta name="author" content="SAS" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="google" content="notranslate" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="msapplication-navbutton-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Tenneco 3D Viewer" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Tenneco 3D Viewer" />
      </head>
      <body className={`${urbanist.className} antialiased min-h-screen h-full w-full bg-white`}>
        <QueryProvider>
          <ContentProvider>
            <LanguageProvider>
              <ModelPreloaderProvider>
                <AppContent>{children}</AppContent>
              </ModelPreloaderProvider>
            </LanguageProvider>
          </ContentProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
