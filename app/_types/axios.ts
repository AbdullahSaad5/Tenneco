import { Media } from ".";
import { MediaCategory } from "./content";

export interface MediaResponse extends Media {
  _id: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  description?: string;
  tags?: Array<{ tag: string }>;
  category?: MediaCategory;
}

export interface ProductDialog {
  buttonText: string;
  media?: Media;
}

export interface TechnologiesData {
  productDialogData?: ProductDialog[];
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SetupData {
  // Add setup data properties as needed
}

export interface BenefitsData {
  videos: Array<{
    url: string;
  }>;
  reverseVideos: Array<{
    url: string;
  }>;
  stillImages: Array<{
    url: string;
  }>;
}
