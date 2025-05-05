export async function convertToWebP(
  file: File,
  maxWidth: number
): Promise<{ file: File; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.src = reader.result as string;
    };

    img.onerror = () => {
      reject(new Error("Image failed to load"));
    };

    img.onload = () => {
      const scaleFactor = Math.min(1, maxWidth / img.width);
      const width = Math.round(img.width * scaleFactor);
      const height = Math.round(img.height * scaleFactor);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return reject(new Error("Failed to get canvas context"));
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error("Canvas conversion to WebP failed"));
          }

          const webpFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".webp"),
            {
              type: "image/webp",
            }
          );

          resolve({
            file: webpFile,
            width,
            height,
          });
        },
        "image/webp",
        0.8 // Compression quality (0 = lowest, 1 = highest)
      );
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file as data URL"));
    };

    reader.readAsDataURL(file);
  });
}
