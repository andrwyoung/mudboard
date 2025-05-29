// this component is the button that

"use client";
import { createNewBoard } from "@/lib/db-actions/create-new-board";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { FaPlus } from "react-icons/fa";

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
    <Button
      onClick={handleClick}
      type="button"
      variant="outline_accent"
      className="text-xs font-bold tracking-wide"
    >
      <FaPlus className="size-2" />
      Create new board!
    </Button>
  );
}
