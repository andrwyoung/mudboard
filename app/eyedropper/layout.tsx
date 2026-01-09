import type { Metadata } from "next";
import { metadata as layoutMetadata } from "@/app/layout";

export const metadata: Metadata = {
  ...layoutMetadata,
  title: "Nice Color Picker",
  description:
    "A simple color picker with support for multiple color formats including HEX, RGB, HSL, HSV, and OKLCH.",
  openGraph: {
    ...layoutMetadata.openGraph,
    title: "Eyedropper and Color Picker",
    images: [
      {
        url: "/metadata/colors-og.png",
        width: 1097,
        height: 702,
        alt: "Eyedropper and Color Picker",
      },
    ],
  },
  twitter: {
    ...layoutMetadata.twitter,
    title: "Eyedropper and Color Picker",
    images: ["/metadata/colors-og.png"],
  },
};

export default function ColorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
