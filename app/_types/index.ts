// Media type for Payload CMS media items
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
