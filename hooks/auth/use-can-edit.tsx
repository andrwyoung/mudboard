import { useMetadataStore } from "@/store/metadata-store";

export function useCanEdit(): boolean {
  const user = useMetadataStore((s) => s.user);
  const board = useMetadataStore((s) => s.board);

  // If unclaimed board, anyone can edit
  if (!board?.user_id) return true;

  // If claimed, only owner can edit (for now)
  // TODO: here is where we add the access_level checks
  return user?.id === board.user_id;
}
