"use client";
import { createNewBoard } from "@/lib/db-actions/create-new-board";
import { useRouter } from "next/navigation";

export default function NewBoardButton() {
  const router = useRouter();

  async function handleClick() {
    const res = await createNewBoard({});
    router.push(`/b/${res.board_id}`);
  }

  return (
    <button onClick={handleClick} className="btn">
      + New Board
    </button>
  );
}
