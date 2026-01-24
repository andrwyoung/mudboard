import { allowedUploadExtensions } from "@/types/upload-settings";

const imageExtensionRegex = new RegExp(
  `\\.(${allowedUploadExtensions
    .map((ext) => ext.replace("jpg", "jpe?g").replace("jfif", "jpe?g"))
    .join("|")})$`,
  "i"
);

export function isImageUrl(url: string): boolean {
  const cleanUrl = url.split("?")[0];
  return imageExtensionRegex.test(cleanUrl);
}
