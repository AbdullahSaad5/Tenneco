#!/usr/bin/env ts-node

/**
 * Seed Script for Tenneco 3D Viewer CMS
 *
 * This script helps populate the Payload CMS with initial data based on fallback constants.
 * You will need to manually upload media files first and provide their IDs when prompted.
 *
 * Usage:
 *   npx tsx scripts/seedCmsData.ts
 *
 * Prerequisites:
 *   1. Upload media files to Payload CMS at tenneco-admin.vercel.app/admin
 *   2. Note down the media IDs
 *   3. Run this script and enter the IDs when prompted
 */

import * as readline from "readline";
import axios from "axios";

// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const TIMEOUT = 10000;

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify readline question
const question = (query: string): Promise<string> => {
  return new Promise((resolve) => rl.question(query, resolve));
};

// Media ID storage
interface MediaIds {
  logo: string;
  lightVehicleImage: string;
  commercialVehicleImage: string;
  railVehicleImage: string;
}

// Helper to make API requests
async function apiRequest(method: string, endpoint: string, data?: any) {
  try {
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      timeout: TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(`API Error on ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

// Collect media IDs from user
async function collectMediaIds(): Promise<MediaIds> {
  console.log("\n=== MEDIA IDs COLLECTION ===");
  console.log("Please enter the media IDs from your Payload CMS uploads.");
  console.log("You can find these in the admin panel at tenneco-admin.vercel.app/admin/media\n");

  return {
    logo: await question("Logo Media ID: "),
    lightVehicleImage: await question("Light Vehicle Homepage Image Media ID: "),
    commercialVehicleImage: await question("Commercial Vehicle Homepage Image Media ID: "),
    railVehicleImage: await question("Rail Vehicle Homepage Image Media ID: "),
  };
}

// Create Homepage
async function createHomepage(mediaIds: MediaIds) {
  console.log("\n Creating Homepage...");

  const homepageData = {
    logo: {
      media: mediaIds.logo,
      alt: "Tenneco Logo",
      width: 180,
      height: 50,
    },
    hero: {
      title: "The Future of Braking Technology",
      subtitle: "Experience Innovation",
      description: "Explore Tenneco's advanced brake systems in immersive 3D",
    },
    vehicleCategories: [
      {
        vehicleType: "light",
        title: "Light Vehicles",
        subtitle: "Passenger Cars & SUVs",
        image: mediaIds.lightVehicleImage,
        gradient: { from: "blue-600", to: "cyan-500" },
        isEnabled: true,
        order: 1,
      },
      {
        vehicleType: "commercial",
        title: "Commercial Vehicles",
        subtitle: "Trucks & Heavy Duty",
        image: mediaIds.commercialVehicleImage,
        gradient: { from: "blue-700", to: "indigo-600" },
        isEnabled: true,
        order: 2,
      },
      {
        vehicleType: "rail",
        title: "Rail",
        subtitle: "Trains & Transit",
        image: mediaIds.railVehicleImage,
        gradient: { from: "slate-700", to: "blue-800" },
        isEnabled: true,
        order: 3,
      },
    ],
  };

  const result = await apiRequest("POST", "/homepage", homepageData);
  console.log("✅ Homepage created:", result.doc?.id);
  return result;
}

// Create App Settings
async function createAppSettings(mediaIds: MediaIds) {
  console.log("\nCreating App Settings...");

  const settingsData = {
    branding: {
      primaryLogo: {
        media: mediaIds.logo,
        alt: "Tenneco Logo",
        width: 180,
        height: 50,
      },
      colorPalette: {
        primary: "#012e87",
        secondary: "#0ea5e9",
        accent: "#012e87",
        background: "#0f172a",
        text: "#ffffff",
      },
    },
    features: {
      enableHomepage: true,
      enableAnimations: true,
      enableModelInfo: true,
      enableHotspots: true,
      enableVideoModal: true,
      enablePdfModal: true,
    },
    defaults: {},
    environment: {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
    },
  };

  const result = await apiRequest("POST", "/app-settings", settingsData);
  console.log("✅ App Settings created:", result.doc?.id);
  return result;
}

// Create Loading Screen
async function createLoadingScreen() {
  console.log("\nCreating Loading Screen...");

  const loadingData = {
    logoType: "svg",
    svgPath: "M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z",
    title: "Tenneco 3D Viewer",
    subtitle: "Loading 3D models...",
    animation: {
      colors: { primary: "#012e87", secondary: "#0ea5e9" },
      duration: 2000,
    },
  };

  const result = await apiRequest("POST", "/loading-screens", loadingData);
  console.log("✅ Loading Screen created:", result.doc?.id);
  return result;
}

// Main execution
async function main() {
  try {
    console.log("=".repeat(60));
    console.log("  Tenneco 3D Viewer CMS Seed Script");
    console.log("=".repeat(60));

    console.log("\nThis script will populate your Payload CMS with initial data.");
    console.log("Make sure you have already uploaded media files to the CMS.\n");

    const proceed = await question("Do you want to proceed? (yes/no): ");
    if (proceed.toLowerCase() !== "yes" && proceed.toLowerCase() !== "y") {
      console.log("\nSeed process cancelled.");
      rl.close();
      return;
    }

    // Collect media IDs
    const mediaIds = await collectMediaIds();

    console.log("\n" + "=".repeat(60));
    console.log("  Starting data creation...");
    console.log("=".repeat(60));

    // Create all documents
    await createHomepage(mediaIds);
    await createAppSettings(mediaIds);

    // Create loading screen
    await createLoadingScreen();

    console.log("\n" + "=".repeat(60));
    console.log("  🎉 Seeding Complete!");
    console.log("=".repeat(60));
    console.log("\nAll configurations have been successfully created in your CMS.");
    console.log("You can now view them at: tenneco-admin.vercel.app/admin");
    console.log("\nThe frontend will automatically fetch this content on the next page load.");
  } catch (error: any) {
    console.error("\n❌ Error during seeding:", error.message);
    console.error("\nPlease check your media IDs and try again.");
  } finally {
    rl.close();
  }
}

// Run the script
main();
