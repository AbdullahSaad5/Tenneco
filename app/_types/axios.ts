import { Media } from ".";

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ConfigurationResponse {
  config: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export interface MediaResponse extends Media {
  _id: string;
}

export interface ProductDialog {
  assetId: string;
  media?: MediaResponse;
  buttonText: string;
}

export interface TechnologiesConfig {
  productDialogData: ProductDialog[];
}

export interface SetupConfig {
  images: string[];
  forwardVideos: string[];
  backwardVideos: string[];
}

export interface BenefitsConfig {
  videos: string[];
  reverseVideos: string[];
  stillImages: string[];
}

export interface SetupData {
  images: MediaResponse[];
  forwardVideos: MediaResponse[];
  backwardVideos: MediaResponse[];
}

export interface BenefitsData {
  videos: MediaResponse[];
  reverseVideos: MediaResponse[];
  stillImages: MediaResponse[];
}

export interface TechnologiesData {
  productDialogData: ProductDialog[];
}
