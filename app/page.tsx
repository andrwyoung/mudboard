import { DEFAULT_BOARD_ID } from "@/types/upload-settings";
import { redirect } from "next/navigation";

export default function Home() {
  redirect(`/b/${DEFAULT_BOARD_ID}`);
}
