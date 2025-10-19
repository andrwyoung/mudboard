import { getImageBlobSmart } from "./fetch-image-from-url";
import { upgradePinterestImage } from "./upgrade-pinterets-image";
import { toast } from "sonner";

export async function tryImportImageFromUrl(imageUrl: string) {
  const toastId = toast.loading("Fetching Image...", {
    duration: Infinity,
  });

  // Pinterest 236x → 736x upgrade
  const upgradedUrl = upgradePinterestImage(imageUrl);

  // grab the image itself
  // Try high-res version first
  let blob = await getImageBlobSmart(upgradedUrl);

  // If that fails, fallback to original 236x
  if (!blob && upgradedUrl !== imageUrl) {
    blob = await getImageBlobSmart(imageUrl);
  }

  toast.dismiss(toastId);

  if (blob) {
    const filename = imageUrl.split("/").pop() ?? "image.jpg";
    const file = new File([blob], filename, { type: blob.type });
    return file;
  } else {
    toast.error("Failed to load image — source may block downloads.");
  }
}
