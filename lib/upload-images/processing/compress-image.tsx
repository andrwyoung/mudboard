// compress images based on the sizes we provide in IMAGE_VARIANT_MAP

import { IMAGE_VARIANT_MAP, imageNames } from "@/types/upload-settings";

export type CompressedImage = {
  file: File;
  width: number;
  height: number;
};

export async function convertToWebP(
  file: File
): Promise<Record<imageNames, CompressedImage>> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    img.onerror = () => reject(new Error("Image failed to load"));
    reader.onerror = () => reject(new Error("Failed to read file"));

    img.onload = () => {
      const variants: Partial<Record<imageNames, CompressedImage>> = {};
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));

      const processSize = (name: imageNames): Promise<void> => {
        return new Promise((res, rej) => {
          const { width: maxWidth, quality } = IMAGE_VARIANT_MAP[name];
          const scale = Math.min(1, maxWidth / img.width);
          const width = img.width * scale;
          const height = img.height * scale;

          canvas.width = width;
          canvas.height = height;
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) return rej(new Error("Canvas toBlob failed"));
              const webpFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, ".webp"),
                { type: "image/webp" }
              );
              variants[name] = { file: webpFile, width, height };
              res();
            },
            "image/webp",
            quality
          );
        });
      };

      Promise.all(
        (Object.keys(IMAGE_VARIANT_MAP) as imageNames[]).map((name) =>
          processSize(name)
        )
      )
        .then(() => resolve(variants as Record<imageNames, CompressedImage>))
        .catch(reject);
    };

    reader.readAsDataURL(file);
  });
}
