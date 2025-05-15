import { notFound } from "next/navigation";
import Board from "./board";
import { checkIfBoardExists } from "@/lib/db-actions/check-board-exist";

export default async function BoardPage({
  params: { boardId },
}: {
  params: { boardId: string };
}) {
  // check if it even exists
  const boardExists = await checkIfBoardExists(boardId);
  if (!boardExists) return notFound();

  return <Board boardId={boardId} />;
}
