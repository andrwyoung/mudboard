// /mudkit/[sectionId]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import { metadata as layoutMetadata } from "@/app/layout";
import { getThumbnailUrl } from "@/utils/get-thumbnail-url";
import { THUMBNAIL_ASPECT_MAP } from "@/types/upload-settings";
import { checkIfSectionExists } from "@/lib/db-actions/check-section-exist";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}): Promise<Metadata | undefined> {
  const { sectionId } = await params;

  const section = await checkIfSectionExists(sectionId);

  if (!section) return;

  const title = section.title?.trim() || "Untitled Mudkit";
  const thumbnailUrl = getThumbnailUrl(section.section_id, "section-thumb-ext");

  return {
    ...layoutMetadata,
    title,
    openGraph: {
      ...layoutMetadata.openGraph,
      title: `${title} – Mudkit`,
      images: [
        {
          url: thumbnailUrl,
          width: THUMBNAIL_ASPECT_MAP["section-thumb-ext"].width,
          height: THUMBNAIL_ASPECT_MAP["section-thumb-ext"].height,
          alt: `${title} – Mudkit`,
        },
      ],
    },
    twitter: {
      ...layoutMetadata.twitter,
      title: `${title} – Mudkit`,
      images: [thumbnailUrl],
    },
  };
}

export default async function MudkitViewPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;

  const section = await checkIfSectionExists(sectionId);
  if (!section || !section.is_public) return notFound();

  return (
    <h1 className="w-screen h-screen text-primary flex items-center justify-center">
      Page Under Construction. Sorry!
    </h1>
  );
  // return <MudkitPage key={sectionId} sectionId={sectionId} />;
}
