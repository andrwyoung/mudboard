import { BOARD_BASE_URL } from "@/types/constants";

export function buildMudboardLink(boardId: string) {
  return `${BOARD_BASE_URL}/${boardId}`;
}
