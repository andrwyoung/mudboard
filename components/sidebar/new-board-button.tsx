"use client";
import { createNewBoard } from "@/lib/db-actions/create-new-board";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function NewBoardButton() {
  const router = useRouter();

  async function handleClick() {
    try {
      const res = await createNewBoard({});

      router.push(`/b/${res.board_id}`);
    } catch (err) {
      console.error("Error creating new board:", err);
      toast.error("Error creating board!");
    }
  }

  return (
    <button onClick={handleClick} className="btn">
      + New Board
    </button>
  );
}
