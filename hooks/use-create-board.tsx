// DEPRECATED: we just use /new/page.tsx now

import { useRouter } from "next/router";
import { createNewBoard } from "../lib/db-actions/create-new-board";
import { toast } from "sonner";

export function useCreateBoard() {
  const router = useRouter();

  return async () => {
    try {
      const board = await createNewBoard({});
      toast.success("Board created!");
      router.push(`/b/${board.board_id}`);
    } catch {
      toast.error("Failed to create board");
    }
  };
}
