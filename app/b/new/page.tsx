// this is the link we go through to create a new board

"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createNewBoard } from "@/lib/db-actions/create-new-board";
import { useMetadataStore } from "@/store/metadata-store";

export default function NewBoardPage() {
  const router = useRouter();

  // if logged in, make the board in their name
  const user = useMetadataStore((s) => s.user);
  const hasCreated = useRef(false);

  useEffect(() => {
    if (user === undefined) return;

    const create = async () => {
      if (hasCreated.current) return;
      hasCreated.current = true;

      try {
        const board = await createNewBoard({
          claimedBy: user?.id ?? undefined,
        });
        router.replace(`/b/${board.board_id}`);
      } catch (err) {
        toast.error("Failed to create board");
        console.error("Failed to create board: ", err);
        router.replace("/"); //TODO: fallback more gracefully
      }
    };

    create();
  }, [router, user]);

  return (
    <p className="text-center text-primary mt-20">Creating your new board...</p>
  );
}
