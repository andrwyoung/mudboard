"use client";
import { createNewBoard } from "@/lib/db-actions/create-new-board";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";

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
      className="text-sm font-bold tracking-wide"
    >
      Make your own board!
    </Button>
  );
}
