// here's the function that let's people change the board permissions
// at time of writing it's only public/private

import { useMetadataStore } from "@/store/metadata-store";
import { Enums } from "@/types/supabase";
import { supabase } from "@/utils/supabase";
import { toast } from "sonner";

export async function changeBoardPermissions(
  access_level: Enums<"access_type">
) {
  const board = useMetadataStore.getState().board;
  const user = useMetadataStore.getState().user;

  if (!board) {
    console.error("No board");
    return;
  }

  if (user?.id !== board.user_id) {
    console.error("User does not have ability to change board permissions");
    return;
  }

  // update Supabase
  const { data, error } = await supabase
    .from("boards")
    .update({ access_level })
    .eq("board_id", board.board_id)
    .select();

  if (error || !data?.length) {
    toast.error("Failed to update board permissions.");
    console.error("Update error:", error);
    return;
  }

  // update local store
  useMetadataStore.setState({
    board: { ...board, access_level },
  });

  toast.success("Board permissions updated!");
}
