import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Eyedropper & Color Picker (HEX, RGB, HSL, OKLCH)",
  description:
    "Free online eyedropper and color picker for artists and designers. Pick colors from images and convert between HEX, RGB, HSL, HSV, and OKLCH.",

  alternates: {
    canonical: "https://mudboard.com/eyedropper",
  },

  openGraph: {
    title: "Eyedropper & Color Picker",
    description:
      "Pick colors from images and convert between HEX, RGB, HSL, HSV, and OKLCH.",
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
    card: "summary_large_image",
    title: "Eyedropper & Color Picker",
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
