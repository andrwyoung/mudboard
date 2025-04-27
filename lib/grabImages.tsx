import { GalleryOrder, ImageType } from "@/types/image-type";
import { grabGalleryOrder } from "./grabGalleryOrder";

export function grabOrderedImages(): ImageType[] {
  const galleryData = require("../galleryData.json");

  // grab all the images
  const filtered: ImageType[] = galleryData.filter(
    (item: { src: string }) =>
      item.src.includes("/pencil/") || item.src.includes("/paintings/")
  );

  // now grab the order
  const galleryOrder: GalleryOrder[] = grabGalleryOrder(filtered);

  const imageMap: Record<string, ImageType> = Object.fromEntries(
    filtered.map((img) => [img.id, img])
  );

  const orderedImages: ImageType[] = galleryOrder
    .filter((entry) => imageMap[entry.id]) // get only items with ids (ideally is 0)
    .sort((a, b) => {
      if (a.section != b.section) return a.section - b.section;
      return a.order - b.order;
    })
    .map((entry) => imageMap[entry.id]);

  return orderedImages;
}
