import { allowedUploadExtensions } from "@/types/upload-settings";

const imageExtensionRegex = new RegExp(
  `\\.(${allowedUploadExtensions
    .map((ext) => ext.replace("jpg", "jpe?g").replace("jfif", "jpe?g"))
    .join("|")})$`,
  "i"
);

export function isImageUrl(url: string): boolean {
  return imageExtensionRegex.test(url);
}
