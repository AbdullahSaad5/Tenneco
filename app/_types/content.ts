// ============================================================================
// Content Type Definitions for Tenneco 3D Viewer CMS
// ============================================================================

// ----------------------------------------------------------------------------
// Multi-Language Types
// ----------------------------------------------------------------------------

export interface Translation {
  language: string
  value: string
}

// ----------------------------------------------------------------------------
// Media Types
// ----------------------------------------------------------------------------

export type MediaCategory = 'image' | 'video' | 'pdf' | '3d-model' | 'icon' | 'logo'

export interface MediaTag {
  tag: string
}

export interface MediaItem {
  id: string
  filename: string
  mimeType?: string
  filesize?: number
  width?: number
  height?: number
  url: string
  category: MediaCategory
  alt?: string
  title?: string
  description?: string
  tags?: MediaTag[]
  product: string
  section: string
  createdAt?: string
  updatedAt?: string
}

export interface MediaReference {
  mediaId: string
  mediaUrl?: string
  alt?: string
  altTranslations?: Translation[]
  width?: number
  height?: number
  fallbackPath?: string
}

// ----------------------------------------------------------------------------
// Homepage Types
// ----------------------------------------------------------------------------

export interface GradientColors {
  from: string
  to: string
}

export interface VehicleCategory {
  id: string
  vehicleType: VehicleType
  order: number
  title: string
  titleTranslations?: Translation[]
  subtitle: string
  subtitleTranslations?: Translation[]
  imageMediaId: string
  imageUrl?: string
  gradient: GradientColors
  targetRoute?: string
  isEnabled: boolean
}

export interface HeroSection {
  title: string
  titleTranslations?: Translation[]
  subtitle: string
  subtitleTranslations?: Translation[]
  description: string
  descriptionTranslations?: Translation[]
}

export interface SectionText {
  sectionTitle?: string
  sectionTitleTranslations?: Translation[]
  sectionSubtitle?: string
  sectionSubtitleTranslations?: Translation[]
}

export interface HomepageContent {
  id: string
  logo: MediaReference
  hero: HeroSection
  section?: SectionText
  vehicleCategories: VehicleCategory[]
}

// ----------------------------------------------------------------------------
// Loading Screen Types
// ----------------------------------------------------------------------------

export interface LoadingScreenContent {
  id: string
  logoType: 'svg' | 'image'
  svgPath?: string
  logoMediaId?: string
  title: string
  titleTranslations?: Translation[]
  subtitle?: string
  subtitleTranslations?: Translation[]
  animation: {
    colors: {
      primary: string
      secondary: string
    }
    duration: number
  }
}

// ----------------------------------------------------------------------------
// Common Types
// ----------------------------------------------------------------------------

export type VehicleType = string

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface ColorConfig {
  gradient?: GradientColors
  solid?: string
}

export interface BrakeMedia {
  pdfMediaId?: string
  videoMediaId?: string
  pdfUrl?: string
  videoUrl?: string
  fallbackPdfPath?: string
  fallbackVideoUrl?: string
}

// ----------------------------------------------------------------------------
// App Settings Types
// ----------------------------------------------------------------------------

export interface BrandingConfig {
  primaryLogo: MediaReference
  favicon?: MediaReference
  colorPalette: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
}

export interface FeatureFlags {
  enableHomepage: boolean
  enableAnimations: boolean
  enableModelInfo: boolean
  enableHotspots: boolean
  enableVideoModal: boolean
  enablePdfModal: boolean
}

export interface DefaultSettings {
  fallbackVideoUrl: string
  fallbackPdfPath: string
}

export interface AppSettings {
  id: string
  branding: BrandingConfig
  features: FeatureFlags
  defaults: DefaultSettings
  environment?: {
    version: string
    lastUpdated: string
  }
}

// ----------------------------------------------------------------------------
// API Response Types
// ----------------------------------------------------------------------------

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

// ----------------------------------------------------------------------------
// Content Provider Context Types
// ----------------------------------------------------------------------------

export interface ContentContextValue {
  homepage: HomepageContent | null
  appSettings: AppSettings | null
  loadingScreen: LoadingScreenContent | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

// ----------------------------------------------------------------------------
// Utility Types
// ----------------------------------------------------------------------------

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface FetchOptions {
  timeout?: number
  retries?: number
  useFallback?: boolean
}

// ----------------------------------------------------------------------------
// Vehicle Configuration Types (keyed by vehicleType)
// ----------------------------------------------------------------------------

export interface ZoomConfig {
  initialScale: number
  initialLookAtTarget: Vector3
  zoomLookAtTarget: Vector3
  zoomIntensity: number
}

export interface VehicleConfiguration {
  id: string
  vehicleType: VehicleType
  name: string
  modelFile: MediaReference
  scale: Vector3
  rotation: Vector3
  cameraStart: Vector3
  cameraZoomTarget: Vector3
  zoomConfig: ZoomConfig
  isActive: boolean
}

// ----------------------------------------------------------------------------
// Brake Configuration Types (keyed by vehicleType)
// ----------------------------------------------------------------------------

export interface ScaleConfig {
  transitionScale: number
  viewerScale: number
}

export interface ExplosionHotspot {
  position: Vector3
  color: string
  label: string
  labelTranslations?: Translation[]
}

export interface CollapseHotspot {
  position: Vector3
  color: string
  label: string
  labelTranslations?: Translation[]
}

export interface BrakeConfiguration {
  id: string
  vehicleType: VehicleType
  name: string
  modelFile: MediaReference
  scale: Vector3
  rotation: Vector3
  scaleConfig: ScaleConfig
  explosionHotspot: ExplosionHotspot
  collapseHotspot: CollapseHotspot
  media?: BrakeMedia
  isActive: boolean
}

// ----------------------------------------------------------------------------
// Hotspot Configuration Types (keyed by vehicleType)
// ----------------------------------------------------------------------------

export interface HotspotInfo {
  title?: string
  titleTranslations?: Translation[]
  description?: string
  descriptionTranslations?: Translation[]
  pdf?: string
  pdfMediaId?: string
  video?: string
  videoMediaId?: string
}

export interface HotspotItem {
  hotspotId: string
  label: string
  labelTranslations?: Translation[]
  position: Vector3
  color: string
  isEnabled: boolean
  info?: HotspotInfo
}

export interface HotspotDefaults {
  pdf?: string
  video?: string
}

export interface HotspotConfiguration {
  id: string
  vehicleType: VehicleType
  defaults?: HotspotDefaults
  hotspots: HotspotItem[]
}

// ----------------------------------------------------------------------------
// Extended Context Types (with new configurations)
// ----------------------------------------------------------------------------

export interface ExtendedContentContextValue extends ContentContextValue {
  vehicleConfigs: Record<string, VehicleConfiguration | null>
  brakeConfigs: Record<string, BrakeConfiguration | null>
  hotspotConfigs: Record<string, HotspotConfiguration | null>
}
