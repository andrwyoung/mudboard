import { INDEX_MULTIPLIER } from "@/types/constants";
import { GalleryOrder, ImageType } from "@/types/image-type";
import path from "path";
import fs from "fs";

export function grabGalleryOrder(galleryData: ImageType[]): GalleryOrder[] {
  const publicDir = path.join(process.cwd(), "public");
  const orderPath = path.join(process.cwd(), "app", "../galleryOrder.json"); // adjust if you want it somewhere else

  try {
    const fileContents = fs.readFileSync(orderPath, "utf-8");
    return JSON.parse(fileContents) as GalleryOrder[];
  } catch (e) {
    console.warn("No galleryOrder.json found! Generating default order...", e);

    const generatedOrder = galleryData
      .filter((img) => {
        const imgPath = path.join(publicDir, img.src);
        if (!fs.existsSync(imgPath)) {
          console.warn(`⨯ Missing image file: ${img.src}`);
          return false; // exclude missing image
        }
        return true;
      })
      .map(
        (img, index) =>
          ({
            id: img.id,
            section: 0,
            order: index * INDEX_MULTIPLIER,
          } as GalleryOrder)
      );

    // Save it!
    try {
      fs.writeFileSync(orderPath, JSON.stringify(generatedOrder, null, 2));
      console.log(`✅ Created new galleryOrder.json at ${orderPath}`);
    } catch (err) {
      console.error("❌ Failed to write galleryOrder.json", err);
    }

    return generatedOrder;
  }
}
