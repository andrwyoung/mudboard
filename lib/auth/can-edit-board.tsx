// this helper is used to determine whether you can edit a board
// technically I think it's supposed to be a hook, but it doesn't even do that much anyways
// Also I use it in a lot of place and didn't want to deal with the hassle

import { useMetadataStore } from "@/store/metadata-store";

export function canEditBoard(): boolean {
  const user = useMetadataStore.getState().user;
  const board = useMetadataStore.getState().board;

  // if board is expired then no
  if (board?.expired_at && new Date(board.expired_at) <= new Date())
    return false;

  if (board?.access_level === "public") return true;

  // If claimed, only owner can edit (for now)
  return user?.id === board?.user_id;
}
