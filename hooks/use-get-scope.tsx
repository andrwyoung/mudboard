// I'm really bad at remembering to use this

import { useIsMirror } from "@/app/b/[boardId]/board";
import { CanvasScope } from "@/types/board-types";

export function useGetScope(): CanvasScope {
  const isMirror = useIsMirror();
  return isMirror ? "mirror" : "main";
}
