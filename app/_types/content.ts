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
// Zoom Animation Types
// ----------------------------------------------------------------------------

export interface AnimationEffects {
  scale: {
    from: number
    to: number
  }
  blur: {
    from: number
    to: number
  }
  rotation?: {
    from: number
    to: number
  }
}

export interface AnimationLabel {
  text: string
  textTranslations?: Translation[]
  subtext?: string
  subtextTranslations?: Translation[]
  color: {
    primary: string
    secondary: string
  }
}

export interface AnimationStage {
  order: number
  name: string
  imageMediaId: string
  title: string
  titleTranslations?: Translation[]
  label: AnimationLabel
  duration: number
  effects: AnimationEffects
}

export type VehicleType = 'light' | 'commercial' | 'rail'

export interface ZoomAnimationContent {
  id: string
  vehicleType: VehicleType
  stages: AnimationStage[]
}

// ----------------------------------------------------------------------------
// Model Configuration Types
// ----------------------------------------------------------------------------

export interface Vector3 {
  x: number
  y: number
  z: number
}

export interface Transform {
  scale: number
  position: Vector3
  rotation: Vector3
  groundY: number
  groundOffset: number
}

export interface HotspotAction {
  type: 'navigate' | 'modal' | 'info'
  payload: string
}

export interface Hotspot {
  id: string
  order: number
  position: Vector3
  label: string
  labelTranslations?: Translation[]
  color: string
  targetModel?: string
  action: HotspotAction
  isEnabled: boolean
}

export interface ColorConfig {
  gradient?: GradientColors
  solid?: string
}

export interface SpecItem {
  spec: string
  specTranslations?: Translation[]
}

export interface ModelInfoContent {
  name: string
  nameTranslations?: Translation[]
  description: string
  descriptionTranslations?: Translation[]
  specs: string[] | SpecItem[]
  color: ColorConfig
}

export interface ModelMedia {
  pdfMediaId?: string
  videoMediaId?: string
  fallbackPdfPath?: string
  fallbackVideoUrl?: string
}

export type ModelType = 'lv' | 'asm' | 'j4444' | 'pad'

export interface ModelConfiguration {
  id: string
  modelType: ModelType
  modelFile: MediaReference
  transform: Transform
  hotspots: Hotspot[]
  info: ModelInfoContent
  media: ModelMedia
  version?: string
  isActive?: boolean
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
  defaultModelType: ModelType
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
  modelConfigs: Record<ModelType, ModelConfiguration | null>
  loadingScreen: LoadingScreenContent | null
  zoomAnimations: Record<VehicleType, ZoomAnimationContent | null>
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
  position: Vector3
  tirePosition: Vector3
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

export interface BrakeConfiguration {
  id: string
  vehicleType: VehicleType
  name: string
  modelFile: MediaReference
  scale: Vector3
  rotation: Vector3
  position: Vector3
  centerModel: boolean
  scaleConfig: ScaleConfig
  explosionHotspot: ExplosionHotspot
  media?: ModelMedia
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
  targetModel?: ModelType
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
  vehicleConfigs: Record<VehicleType, VehicleConfiguration | null>
  brakeConfigs: Record<VehicleType, BrakeConfiguration | null>
  hotspotConfigs: Record<VehicleType, HotspotConfiguration | null>
}
