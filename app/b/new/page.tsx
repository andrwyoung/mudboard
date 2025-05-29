"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createNewBoard } from "@/lib/db-actions/create-new-board";
import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";

export default function NewBoardPage() {
  const router = useRouter();

  useEffect(() => {
    const create = async () => {
      try {
        useLayoutStore.getState().clearAll();
        useMetadataStore.getState().clearAll();

        const board = await createNewBoard({});
        router.replace(`/b/${board.board_id}`);
      } catch (err) {
        toast.error("Failed to create board");
        console.error("Failed to create board: ", err);
        router.replace("/"); //TODO: fallback more gracefully
      }
    };

    create();
  }, [router]);

  return (
    <p className="text-center text-primary mt-20">Creating your new board...</p>
  );
}
