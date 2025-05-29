// DEPRECATED: used to be the old way to verify whether you can

import { Board } from "@/types/board-types";
import { verifyPassword } from "./encrypt-decrypt";
import { getBoardPassword } from "./save-get-password";

export async function OLDCanEditBoard(board: Board): Promise<boolean> {
  // unclaimed boards can be edited by whoever
  if (!board.user_id || !board.password_hash) return true;

  // grab local password from storage
  const localPassword = getBoardPassword(board.board_id);

  // verify password
  return await verifyPassword(localPassword || "", board.password_hash);
}
