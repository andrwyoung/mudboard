// this helper is used to determine whether you can edit a board
// technically I think it's supposed to be a hook, but it doesn't even do that much anyways
// Also I use it in a lot of place and didn't want to deal with the hassle

import { useMetadataStore } from "@/store/metadata-store";

export function canEditBoard(): boolean {
  const { user, board } = useMetadataStore.getState();

  // If no board, can't edit
  if (!board) return false;

  // Unclaimed board = open editing
  if (!board.user_id) return true;

  // Public boards are editable by anyone
  if (board.access_level === "public") return true;

  // Only owner can edit
  return user?.id === board.user_id;
}
