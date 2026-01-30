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
import {
  FALLBACK_HOMEPAGE_CONTENT,
  FALLBACK_APP_SETTINGS,
  FALLBACK_MODEL_CONFIG_LV,
  FALLBACK_MODEL_CONFIG_ASM,
  FALLBACK_MODEL_CONFIG_J4444,
  FALLBACK_MODEL_CONFIG_PAD,
  FALLBACK_LOADING_SCREEN,
  FALLBACK_ZOOM_ANIMATION_LIGHT,
  FALLBACK_ZOOM_ANIMATION_COMMERCIAL,
  FALLBACK_ZOOM_ANIMATION_RAIL,
} from "../app/config/fallbacks";

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
  lvModel: string;
  asmModel: string;
  j4444Model: string;
  padModel: string;
  pdf: string;
  lightVehicleImage: string;
  commercialVehicleImage: string;
  railVehicleImage: string;
  lightStage1: string;
  lightStage2: string;
  lightStage3: string;
  lightStage4: string;
  commercialStage1: string;
  commercialStage2: string;
  commercialStage3: string;
  commercialStage4: string;
  railStage1: string;
  railStage2: string;
  railStage3: string;
  railStage4: string;
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
    lvModel: await question("LV Model (lv_file.glb) Media ID: "),
    asmModel: await question("ASM Model (asm.glb) Media ID: "),
    j4444Model: await question("J-4444 Model (J-4444.glb) Media ID: "),
    padModel: await question("Pad Model (pad.glb) Media ID: "),
    pdf: await question("Pads.pdf Media ID: "),
    lightVehicleImage: await question("Light Vehicle Homepage Image Media ID: "),
    commercialVehicleImage: await question("Commercial Vehicle Homepage Image Media ID: "),
    railVehicleImage: await question("Rail Vehicle Homepage Image Media ID: "),
    lightStage1: await question("Light Animation Stage 1 Image Media ID: "),
    lightStage2: await question("Light Animation Stage 2 Image Media ID: "),
    lightStage3: await question("Light Animation Stage 3 Image Media ID: "),
    lightStage4: await question("Light Animation Stage 4 Image Media ID: "),
    commercialStage1: await question("Commercial Animation Stage 1 Image Media ID: "),
    commercialStage2: await question("Commercial Animation Stage 2 Image Media ID: "),
    commercialStage3: await question("Commercial Animation Stage 3 Image Media ID: "),
    commercialStage4: await question("Commercial Animation Stage 4 Image Media ID: "),
    railStage1: await question("Rail Animation Stage 1 Image Media ID: "),
    railStage2: await question("Rail Animation Stage 2 Image Media ID: "),
    railStage3: await question("Rail Animation Stage 3 Image Media ID: "),
    railStage4: await question("Rail Animation Stage 4 Image Media ID: "),
  };
}

// Create Homepage
async function createHomepage(mediaIds: MediaIds) {
  console.log("\n Creating Homepage...");

  const homepageData = {
    logo: {
      media: mediaIds.logo,
      alt: FALLBACK_HOMEPAGE_CONTENT.logo.alt,
      width: FALLBACK_HOMEPAGE_CONTENT.logo.width,
      height: FALLBACK_HOMEPAGE_CONTENT.logo.height,
    },
    hero: FALLBACK_HOMEPAGE_CONTENT.hero,
    vehicleCategories: [
      {
        ...FALLBACK_HOMEPAGE_CONTENT.vehicleCategories[0],
        image: mediaIds.lightVehicleImage,
      },
      {
        ...FALLBACK_HOMEPAGE_CONTENT.vehicleCategories[1],
        image: mediaIds.commercialVehicleImage,
      },
      {
        ...FALLBACK_HOMEPAGE_CONTENT.vehicleCategories[2],
        image: mediaIds.railVehicleImage,
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
      colorPalette: FALLBACK_APP_SETTINGS.branding.colorPalette,
    },
    features: FALLBACK_APP_SETTINGS.features,
    defaults: FALLBACK_APP_SETTINGS.defaults,
    environment: FALLBACK_APP_SETTINGS.environment,
  };

  const result = await apiRequest("POST", "/app-settings", settingsData);
  console.log("✅ App Settings created:", result.doc?.id);
  return result;
}

// Create Model Configuration
async function createModelConfig(
  modelType: string,
  config: any,
  modelMediaId: string,
  pdfMediaId: string
) {
  console.log(`\nCreating Model Configuration: ${modelType}...`);

  const modelData = {
    modelType,
    modelFile: {
      media: modelMediaId,
      fallbackPath: config.modelFile.fallbackPath,
    },
    transform: config.transform,
    hotspots: config.hotspots.map((hs: any) => ({
      order: hs.order,
      position: hs.position,
      label: hs.label,
      color: hs.color,
      targetModel: hs.targetModel,
      action: hs.action,
      isEnabled: hs.isEnabled,
    })),
    info: {
      name: config.info.name,
      description: config.info.description,
      specs: config.info.specs.map((spec: string) => ({ spec })),
      color: config.info.color,
    },
    media: {
      pdf: pdfMediaId,
      fallbackPdfPath: config.media.fallbackPdfPath,
    },
    version: config.version,
    isActive: config.isActive,
  };

  const result = await apiRequest("POST", "/model-configurations", modelData);
  console.log(`✅ Model Configuration ${modelType} created:`, result.doc?.id);
  return result;
}

// Create Loading Screen
async function createLoadingScreen() {
  console.log("\nCreating Loading Screen...");

  const loadingData = {
    logoType: FALLBACK_LOADING_SCREEN.logoType,
    svgPath: FALLBACK_LOADING_SCREEN.svgPath,
    title: FALLBACK_LOADING_SCREEN.title,
    subtitle: FALLBACK_LOADING_SCREEN.subtitle,
    animation: FALLBACK_LOADING_SCREEN.animation,
  };

  const result = await apiRequest("POST", "/loading-screens", loadingData);
  console.log("✅ Loading Screen created:", result.doc?.id);
  return result;
}

// Create Zoom Animation
async function createZoomAnimation(
  vehicleType: string,
  config: any,
  stageMediaIds: string[]
) {
  console.log(`\nCreating Zoom Animation: ${vehicleType}...`);

  const animationData = {
    vehicleType,
    stages: config.stages.map((stage: any, index: number) => ({
      order: stage.order,
      name: stage.name,
      image: stageMediaIds[index],
      title: stage.title,
      label: stage.label,
      duration: stage.duration,
      effects: stage.effects,
    })),
  };

  const result = await apiRequest("POST", "/zoom-animations", animationData);
  console.log(`✅ Zoom Animation ${vehicleType} created:`, result.doc?.id);
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

    // Create model configurations
    await createModelConfig("lv", FALLBACK_MODEL_CONFIG_LV, mediaIds.lvModel, mediaIds.pdf);
    await createModelConfig("asm", FALLBACK_MODEL_CONFIG_ASM, mediaIds.asmModel, mediaIds.pdf);
    await createModelConfig(
      "j4444",
      FALLBACK_MODEL_CONFIG_J4444,
      mediaIds.j4444Model,
      mediaIds.pdf
    );
    await createModelConfig("pad", FALLBACK_MODEL_CONFIG_PAD, mediaIds.padModel, mediaIds.pdf);

    // Create loading screen
    await createLoadingScreen();

    // Create zoom animations
    await createZoomAnimation("light", FALLBACK_ZOOM_ANIMATION_LIGHT, [
      mediaIds.lightStage1,
      mediaIds.lightStage2,
      mediaIds.lightStage3,
      mediaIds.lightStage4,
    ]);

    await createZoomAnimation("commercial", FALLBACK_ZOOM_ANIMATION_COMMERCIAL, [
      mediaIds.commercialStage1,
      mediaIds.commercialStage2,
      mediaIds.commercialStage3,
      mediaIds.commercialStage4,
    ]);

    await createZoomAnimation("rail", FALLBACK_ZOOM_ANIMATION_RAIL, [
      mediaIds.railStage1,
      mediaIds.railStage2,
      mediaIds.railStage3,
      mediaIds.railStage4,
    ]);

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
