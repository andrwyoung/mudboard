// this is the entry point for when we want to see a board

import { notFound } from "next/navigation";
import Board from "./board";
import { checkIfBoardExists } from "@/lib/db-actions/check-board-exist";
import { Metadata } from "next";
import { metadata as layoutMetadata } from "@/app/layout";
import {
  THUMBNAIL_EXTERNAL_HEIGHT,
  THUMBNAIL_WIDTH,
} from "@/types/upload-settings";
import { getThumbnailUrl } from "@/utils/get-thumbnail-url";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ boardId: string }>;
}): Promise<Metadata | undefined> {
  const { boardId } = await params;

  const board = await checkIfBoardExists(boardId);

  if (!board || !board.title) return;

  const title = board.title;
  const thumbnailUrl = getThumbnailUrl(board.board_id, "board-thumb-ext");
  // console.log("thumbnail: ", thumbnailUrl);

  return {
    ...layoutMetadata,
    title,
    openGraph: {
      ...layoutMetadata.openGraph,
      title: `${title} – Mudboard`,
      images: [
        {
          url: thumbnailUrl,
          width: THUMBNAIL_WIDTH,
          height: THUMBNAIL_EXTERNAL_HEIGHT,
          alt: `${title} – Mudboard`,
        },
      ],
    },
    twitter: {
      ...layoutMetadata.twitter,
      title: `${title} – Mudboard`,
      images: [thumbnailUrl],
    },
  };
}

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  // check if it even exists
  const board = await checkIfBoardExists(boardId);
  if (!board) return notFound();

  return <Board key={boardId} boardId={boardId} />;
}
