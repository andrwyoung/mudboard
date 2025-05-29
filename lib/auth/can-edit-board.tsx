// this helper is used to determine whether you can edit a board
// technically I think it's supposed to be a hook, but it doesn't even do that much anyways
// Also I use it in a lot of place and didn't want to deal with the hassle

import { useMetadataStore } from "@/store/metadata-store";

export function canEditBoard(): boolean {
  const user = useMetadataStore.getState().user;
  const board = useMetadataStore.getState().board;

  // If unclaimed board, anyone can edit
  if (!board?.user_id) return true;

  // If claimed, only owner can edit (for now)
  // TODO: here is where we add the access_level checks
  return user?.id === board.user_id;
}
