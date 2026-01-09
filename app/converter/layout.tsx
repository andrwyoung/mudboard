import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image Converter (PNG, JPG, WEBP)",
  description:
    "Free online image converter to convert images between PNG, JPG, and WEBP formats quickly and securely.",

  alternates: {
    canonical: "https://mudboard.com/converter",
  },

  openGraph: {
    title: "Image Converter",
    description:
      "Convert images between PNG, JPG, and WEBP formats directly in your browser.",
    images: [
      {
        url: "/metadata/compressor-og.png",
        width: 1097,
        height: 702,
        alt: "Image Converter",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Image Converter",
    images: ["/metadata/compressor-og.png"],
  },
};

export default function CompressorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
