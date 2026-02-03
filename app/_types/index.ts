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

// Active component type
export type ActiveComponent = "device" | "machine" | "nozel" | null;

// Components data type
export interface ComponentsData {
  mainData: {
    title: string;
    description: string;
  };
  overviewDialogsData: Array<{
    title: string;
    description: string;
  }>;
}

// Models data type
export interface ModelsData {
  mediaData: {
    stand?: { url: string };
    nozel?: { url: string };
    machine?: { url: string };
    device?: { url: string };
  };
}
