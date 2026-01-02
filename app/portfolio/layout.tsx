import { THUMBNAIL_ASPECT_MAP } from "@/types/upload-settings";
import { Metadata } from "next";
import { getThumbnailUrl } from "@/utils/get-thumbnail-url";
import { JONADREW_ALLOWED_BOARD_ID } from "./settings";

const thumbnailUrl = getThumbnailUrl(
  JONADREW_ALLOWED_BOARD_ID,
  "board-thumb-ext"
);

export const metadata: Metadata = {
  title: "Jonadrew Portfolio",
  description: "Andrew's art portfolio built using a Mudboard board",

  openGraph: {
    title: `Jonadrew Portfolio`,
    description: "Andrew's art portfolio built using Mudboard",
    images: [
      {
        url: thumbnailUrl,
        width: THUMBNAIL_ASPECT_MAP["board-thumb-ext"].width,
        height: THUMBNAIL_ASPECT_MAP["board-thumb-ext"].height,
        alt: `Jonadrew Portfolio`,
      },
    ],
  },
  twitter: {
    title: `Jonadrew Portfolio`,
    images: [thumbnailUrl],
  },
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
