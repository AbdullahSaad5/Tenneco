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
