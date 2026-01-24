import { BoardSection } from "@/types/board-types";

export function isLinkedSection(boardSection: BoardSection): boolean {
  return (
    boardSection.personal_copy_count !== undefined &&
    boardSection.personal_copy_count > 1 &&
    !boardSection.is_shared
  );
}
