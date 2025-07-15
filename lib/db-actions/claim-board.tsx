// DATABASE + LOCAL

// 1. user must be logged in
// 2. if board has not been claimed already, then claim it
// 3. update locally

// note that this function is really only used if you're not logged in
// we automatically assign a board to a user if they make a new baord logged in

import { useMetadataStore } from "@/store/metadata-store";
import { Enums } from "@/types/supabase";
import { supabase } from "@/lib/supabase/supabase-client";
import { toast } from "sonner";
import { currentUserCanCreateBoardsFromDB } from "../tiers/user-can-create-boards";
import { useExploreStore } from "@/store/explore-store";

export async function claimBoard() {
  const board = useMetadataStore.getState().board;
  const boardSections = useMetadataStore.getState().boardSections;
  const user = useMetadataStore.getState().user;

  // board must exist and user must be logged in
  if (!board || !user) return;

  // check if they're allowed to

  const canCreate = await currentUserCanCreateBoardsFromDB();
  if (!canCreate) {
    return;
  }

  // race condition safe
  // STEP 1: claim the board itself
  const { error: claimError, data } = await supabase
    .from("boards")
    .update({ user_id: user.id, access_level: "private" })
    .eq("board_id", board.board_id)
    .is("user_id", null) // IMPORTANT. should never be true, but good to guard
    .select();

  if (claimError || !data?.length) {
    toast.error("This board has already been claimed.");
    console.log("claim result: ", claimError, data);
    return;
  }

  // STEP 2: update all the section's owned_by to the user
  const sectionIds = boardSections
    .map((bs) => bs.section.section_id)
    .filter(Boolean);

  if (sectionIds.length === 0) {
    console.warn("No section IDs found for this board.");
  } else {
    const { error: sectionClaimError, data: updatedSections } = await supabase
      .from("sections")
      .update({ owned_by: user.id })
      .in("section_id", sectionIds)
      .is("owned_by", null) // only claim unowned
      .select("section_id");

    if (sectionClaimError) {
      toast.error("Failed to claim sections.");
      console.error("Section claim error:", sectionClaimError);
      return;
    }

    if (!updatedSections || updatedSections.length === 0) {
      console.warn(
        "No sections were updated. They may have already been claimed."
      );
    } else {
      console.info(`Claimed ${updatedSections.length} sections`);
    }
  }

  // STEP 3: Update  locally
  const updatedBoard = {
    ...board,
    user_id: user.id,
    access_level: "private" as Enums<"access_type">,
  };

  useMetadataStore.getState().setBoard(updatedBoard);
  for (const bs of boardSections) {
    useMetadataStore.getState().updateBoardSection(bs.section.section_id, {
      owned_by: user.id,
    });
  }

  // clear temp mudkits
  useExploreStore.getState().setTempMudkits([]);

  toast.success("Board claimed successfully!");
}
