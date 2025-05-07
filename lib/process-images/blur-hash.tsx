import { encode } from "blurhash";

export async function generateBlurhashFromImage(
  img: HTMLImageElement
): Promise<string> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Failed to get canvas context");

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0, img.width, img.height);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return encode(imageData.data, imageData.width, imageData.height, 4, 3); // you can tweak components (4x3 is solid)
}
