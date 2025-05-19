import { MAX_IMAGE_WIDTH } from "@/types/upload-settings";

export async function rasterizeVectorImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    img.onerror = () => reject(new Error("Failed to load vector image"));
    reader.onerror = () => reject(new Error("Failed to read vector file"));

    img.onload = () => {
      // Use default canvas size based on intrinsic SVG size or fallback
      const naturalWidth = img.width || MAX_IMAGE_WIDTH;
      const naturalHeight = img.height || MAX_IMAGE_WIDTH;

      const scale = MAX_IMAGE_WIDTH / naturalWidth;
      const shouldScale = naturalWidth > MAX_IMAGE_WIDTH;

      const width = shouldScale ? MAX_IMAGE_WIDTH : naturalWidth;
      const height = shouldScale
        ? Math.round(naturalHeight * scale)
        : naturalHeight;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context missing"));

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Rasterization failed"));

          const rasterFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".webp"),
            { type: "image/webp" }
          );

          resolve(rasterFile);
        },
        "image/webp",
        0.95 // good default quality
      );
    };

    reader.readAsDataURL(file);
  });
}
