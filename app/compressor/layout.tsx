import type { Metadata } from "next";
import { metadata as layoutMetadata } from "@/app/layout";

export const metadata: Metadata = {
  ...layoutMetadata,
  title: "Nice Image Compressor",
  description:
    "A simple image compressor to convert images between PNG, WEBP and JPG.",
  openGraph: {
    ...layoutMetadata.openGraph,
    title: "Image Converter",
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
    ...layoutMetadata.twitter,
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
