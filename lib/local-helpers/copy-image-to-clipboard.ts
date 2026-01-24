import { toast } from "sonner";

export async function copyImageToClipboard(url: string): Promise<void> {
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");

    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png")
    );
    if (!blob) throw new Error("Failed to convert image to PNG");

    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);

    toast.success("Image copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy image to clipboard:", err);
    toast.error("Could not copy image.");
  }
}
