# Dynamic Content Implementation Guide

## Overview

This document describes the dynamic content management system implemented for the Tenneco 3D Viewer. The system transforms static content into fully CMS-driven content with robust static fallbacks.

## Architecture

### Three-Tier Fallback System

1. **Tier 1 - CMS Success**: Content fetched from Payload CMS
2. **Tier 2 - CMS Failure**: Graceful fallback to hardcoded constants
3. **Tier 3 - Component Level**: Each component has default values

### Components

#### Backend (Payload CMS)
- **Enhanced Media Collection**: Categorized media with metadata
- **Homepage Collection**: Logo, hero section, vehicle categories
- **AppSettings Collection**: Global settings and feature flags
- **ModelConfigurations Collection**: 3D models with transforms, hotspots, info
- **LoadingScreens Collection**: Loading screen customization
- **ZoomAnimations Collection**: Animation sequences by vehicle type

#### Frontend (Next.js)
- **TypeScript Types**: `app/_types/content.ts` - Complete type definitions
- **Fallback Constants**: `app/config/fallbacks.ts` - Static fallback data
- **Content Provider**: `app/providers/ContentProvider.tsx` - Global state management
- **useContent Hook**: Access content from any component
- **useAxios Extensions**: New methods for fetching CMS content

## Implementation Status

### ✅ Completed

#### Backend
- [x] Enhanced Media collection with category and metadata fields
- [x] Created Homepage collection
- [x] Created AppSettings collection
- [x] Created ModelConfigurations collection (with transforms, hotspots, info, media)
- [x] Created LoadingScreens collection
- [x] Created ZoomAnimations collection
- [x] All collections registered in payload.config.ts

#### Frontend Infrastructure
- [x] TypeScript interfaces for all content types
- [x] Comprehensive fallback constants
- [x] ContentProvider with useContent hook
- [x] useAxios enhanced with 6 new methods:
  - `getHomepageContent()`
  - `getAppSettings()`
  - `getModelConfiguration(modelType)`
  - `getLoadingScreenContent()`
  - `getZoomAnimationContent(vehicleType)`
  - `getMediaById(id)`
- [x] App wrapped with ContentProvider in layout.tsx
- [x] Environment variables configuration

### 🚧 Remaining Frontend Component Updates

The following components need to be updated to use dynamic content:

1. **Homepage (page.tsx)**: Use `homepage` from useContent()
2. **Model Components** (lv.tsx, asm.tsx, j4444.tsx, pad.tsx): Use `modelConfigs` from useContent()
3. **Scene Component**: Pass dynamic configs to models
4. **LV Component**: Map dynamic hotspots array
5. **ModelInfo Component**: Use dynamic model info
6. **LoadingScreen Component**: Use dynamic loading screen content
7. **ZoomAnimation Component**: Use dynamic animation stages

## Usage Guide

### Accessing Dynamic Content in Components

```tsx
import { useContent } from "@/app/providers/ContentProvider";

function MyComponent() {
  const { homepage, appSettings, modelConfigs, isLoading, error } = useContent();

  if (isLoading) return <LoadingScreen />;
  if (error) console.warn("CMS error, using fallbacks:", error);

  return (
    <div>
      <h1>{homepage?.hero.title}</h1>
      {/* Component will use fallbacks if CMS fails */}
    </div>
  );
}
```

### Example: Dynamic Homepage

```tsx
"use client";

import { useContent } from "./providers/ContentProvider";

export default function Home() {
  const { homepage } = useContent();

  // homepage is guaranteed to have a value (either from CMS or fallback)
  const categories = homepage?.vehicleCategories
    .filter(cat => cat.isEnabled)
    .sort((a, b) => a.order - b.order);

  return (
    <div>
      <h1>{homepage?.hero.title}</h1>
      {categories?.map(category => (
        <Card key={category.id} {...category} />
      ))}
    </div>
  );
}
```

### Example: Dynamic Model Configuration

```tsx
"use client";

import { useContent } from "@/app/providers/ContentProvider";

function LV({ onHotspotClick }) {
  const { modelConfigs } = useContent();
  const config = modelConfigs.lv;

  const { scene } = useGLTF(config.modelFile.fallbackPath);

  return (
    <group>
      <primitive object={scene} scale={config.transform.scale} />
      {config.hotspots.filter(hs => hs.isEnabled).map(hotspot => (
        <Hotspot
          key={hotspot.id}
          position={[hotspot.position.x, hotspot.position.y, hotspot.position.z]}
          label={hotspot.label}
          color={hotspot.color}
          onClick={() => onHotspotClick(hotspot.targetModel)}
        />
      ))}
    </group>
  );
}
```

## Environment Configuration

### Client (.env.local)

```env
NEXT_PUBLIC_API_URL=https://tenneco-admin.vercel.app/api
NEXT_PUBLIC_ENABLE_CMS=true
NEXT_PUBLIC_FALLBACK_TIMEOUT=5000
NEXT_PUBLIC_CACHE_DURATION=300000
```

### Disabling CMS (Testing Fallbacks)

Set `NEXT_PUBLIC_ENABLE_CMS=false` to test the complete fallback system.

## Data Population

### Option 1: Manual Upload via Payload Admin

1. Navigate to https://tenneco-admin.vercel.app/admin
2. Login with your credentials
3. Upload media files to the Media collection with appropriate categories:
   - Logo: `category: "logo"`
   - 3D Models: `category: "3d-model"`
   - Images: `category: "image"`
   - PDFs: `category: "pdf"`
   - Videos: `category: "video"`
4. Create documents in each collection:
   - Homepage (1 document)
   - AppSettings (1 document)
   - ModelConfigurations (4 documents: lv, asm, j4444, pad)
   - LoadingScreens (1 document)
   - ZoomAnimations (3 documents: light, commercial, rail)

### Option 2: Seed Script (To Be Created)

A seed script will be provided to automatically populate the CMS with default data from fallback constants.

```bash
cd client
npx tsx scripts/seedCmsData.ts
```

## Content Collections Details

### Homepage
- **Fields**: Logo, hero section, vehicle categories array
- **Singleton**: Only one document needed
- **Categories**: Configurable order, title, subtitle, image, gradient, route, isEnabled

### AppSettings
- **Fields**: Branding, feature flags, defaults, environment
- **Singleton**: Only one document needed
- **Feature Flags**: Enable/disable homepage, animations, model info, hotspots, modals

### ModelConfigurations
- **Fields**: Model type, file, transform, hotspots, info, media
- **Documents**: 4 (one per model type)
- **Transform**: Scale, position, rotation, ground positioning
- **Hotspots**: Position, label, color, target model, action
- **Info**: Name, description, specs array, color theme

### LoadingScreens
- **Fields**: Logo type, SVG path or image, title, subtitle, animation
- **Documents**: 1 (can create multiple for A/B testing)

### ZoomAnimations
- **Fields**: Vehicle type, stages array
- **Documents**: 3 (one per vehicle type)
- **Stages**: Order, name, image, title, label, duration, effects

## API Endpoints

All endpoints are relative to `NEXT_PUBLIC_API_URL`:

- `GET /homepage` - Homepage content
- `GET /app-settings` - Application settings
- `GET /model-configurations?where[modelType][equals]=lv` - Model config by type
- `GET /loading-screens` - Loading screen content
- `GET /zoom-animations?where[vehicleType][equals]=light` - Animation by vehicle type
- `GET /media/:id` - Media item by ID
- `GET /media` - All media items

## Fallback Behavior

The system automatically falls back to static constants when:

1. `NEXT_PUBLIC_ENABLE_CMS=false` (CMS disabled)
2. API request times out (> 5000ms by default)
3. API returns an error
4. CMS collection is empty
5. Network is unavailable

Fallbacks are defined in `app/config/fallbacks.ts` and match the current static content exactly.

## Type Safety

All content is fully typed with TypeScript interfaces. The type system ensures:

- Content structure is consistent between CMS and fallbacks
- Components receive properly typed data
- API responses are validated
- No runtime type errors

## Performance Considerations

- Content is fetched once on app initialization
- All CMS calls use abort controllers for cleanup
- Promise.allSettled() handles partial failures gracefully
- Failed requests fallback immediately (no retries)
- Content can be refetched manually with `refetch()` method

## Testing

### Test CMS Connectivity
1. Set `NEXT_PUBLIC_ENABLE_CMS=true`
2. Open browser DevTools → Network tab
3. Load the app
4. Verify API calls to Payload endpoints
5. Check console for any warnings

### Test Fallback System
1. Set `NEXT_PUBLIC_ENABLE_CMS=false`
2. Reload the app
3. Verify app works identically with fallback data
4. No CMS API calls should appear in Network tab

### Test Partial Failures
1. Set `NEXT_PUBLIC_ENABLE_CMS=true`
2. Delete one CMS collection (e.g., Homepage)
3. App should use CMS data for other collections
4. App should use fallback for missing collection
5. No crashes or errors

## Troubleshooting

### Issue: App shows loading forever
- **Cause**: CMS requests hanging
- **Solution**: Check `NEXT_PUBLIC_FALLBACK_TIMEOUT` setting

### Issue: Content not updating after CMS changes
- **Cause**: Browser cache
- **Solution**: Hard refresh (Cmd+Shift+R) or clear cache

### Issue: CORS errors in console
- **Cause**: Client URL not in Payload CORS whitelist
- **Solution**: Add URL to `cors.origins` in payload.config.ts

### Issue: TypeScript errors
- **Cause**: CMS response doesn't match type definitions
- **Solution**: Check Payload schema matches TypeScript interfaces

## Future Enhancements

- [ ] Visual hotspot editor (drag-and-drop 3D positioning)
- [ ] Content versioning and rollback
- [ ] A/B testing different configurations
- [ ] Scheduled content updates
- [ ] Preview mode before publishing
- [ ] Multi-language support
- [ ] Analytics integration
- [ ] Camera/lighting configuration
- [ ] Material/texture customization

## Files Modified

### Backend (admin/)
- `src/collections/Media.ts` - Enhanced with category field
- `src/collections/Homepage.ts` - New collection
- `src/collections/AppSettings.ts` - New collection
- `src/collections/ModelConfigurations.ts` - New collection
- `src/collections/LoadingScreens.ts` - New collection
- `src/collections/ZoomAnimations.ts` - New collection
- `src/payload.config.ts` - Registered new collections

### Frontend (client/)
- `app/_types/content.ts` - New types file
- `app/config/fallbacks.ts` - New fallbacks file
- `app/providers/ContentProvider.tsx` - New provider
- `app/hooks/useAxios.tsx` - Enhanced with new methods
- `app/layout.tsx` - Wrapped with ContentProvider
- `.env.local` - New environment variables
- `.env.example` - Environment documentation

## Support

For questions or issues with the dynamic content system:

1. Check this documentation
2. Review the fallback constants in `app/config/fallbacks.ts`
3. Check browser console for warnings/errors
4. Verify environment variables are set correctly
5. Test with CMS disabled to isolate issues
