// this is the entry point for when we want to see a board

import { notFound } from "next/navigation";
import Board from "./board";
import { checkIfBoardExists } from "@/lib/db-actions/check-board-exist";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  // check if it even exists
  const boardExists = await checkIfBoardExists(boardId);
  if (!boardExists) return notFound();

  return <Board key={boardId} boardId={boardId} />;
}
