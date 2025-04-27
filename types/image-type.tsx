export type ImageType = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  weight?: number;
  orientation: string;
};

export type GalleryOrder = {
  id: string;
  section: number;
  order: number;
};
