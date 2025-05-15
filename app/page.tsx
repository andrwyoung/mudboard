import { DEFAULT_BOARD_ID } from "@/types/upload-settings";
import Board from "./b/[boardId]/board";

export default function Home() {
  return <Board boardId={DEFAULT_BOARD_ID} />;
}
