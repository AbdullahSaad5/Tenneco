export type ActiveComponent = "stand" | "nozel" | "machine" | "device" | null;

export type Media = {
  product: string;
  section: string;
  filename: string;
  mimeType: string;
  filesize: number;
  createdAt: string;
  updatedAt: string;
  id: string;
  url: string;
  thumbnailURL: string | null;
};

export type OverviewDialog = {
  title: string;
  description: string;
};

export type ComponentsData = {
  mainData: OverviewDialog;
  overviewDialogsData: OverviewDialog[];
};

export type ProductConfigIds = {
  nozel: string;
  stand: string;
  machine: string;
  device: string;
};

export type AssetsIds = {
  brochure: string;
  manual: string;
  presentation: string;
  trailer: string;
};

export type ProductDialogData = {
  buttonText: string;
  assetId: string;
  media?: Media;
};

export type ModelsData = {
  productConfigIds: ProductConfigIds;
  mediaData: Record<string, Media>;
};

export type ButtonData = ProductDialogData;

export type SetupData = {
  images: string[];
  forwardVideos: string[];
  backwardVideos: string[];
};

export type BenefitsData = {
  videos: string[];
  reverseVideos: string[];
  stillImages: string[];
};
