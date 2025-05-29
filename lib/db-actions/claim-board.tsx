// 1. user must be logged in
// 2. if board has not been claimed already, then claim it
// 3. update locally

import { useMetadataStore } from "@/store/metadata-store";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";

export async function claimBoard() {
  const board = useMetadataStore.getState().board;
  const user = useMetadataStore.getState().user;

  // board must exist and user must be logged in
  if (!board || !user) return;

  // race condition check
  // check that no one has already claimed the board
  const { error: claimError, data } = await supabase
    .from("boards")
    .update({ user_id: user.id })
    .eq("board_id", board.board_id)
    .is("user_id", null)
    .select();

  if (claimError || !data?.length) {
    toast.error("This board has already been claimed.");
    console.log("claim result: ", claimError, data);
    return;
  }

  // update locally
  const updatedBoard = {
    ...board,
    user_id: user.id,
  };
  useMetadataStore.setState({ board: updatedBoard });

  toast.success("Board claimed successfully!");
}
