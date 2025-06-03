// this is the link we go through to create a demo board

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cloneBoard } from "@/lib/db-actions/clone-board";
import { DEMO_BOARD_ID } from "@/types/upload-settings";

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    const create = async () => {
      const demoBoardId = await cloneBoard(DEMO_BOARD_ID);

      if (!demoBoardId) {
        toast.error("Failed to create demo board");
        console.error("Failed to create demo board: ");
        router.replace("/"); //TODO: fallback more gracefully
        return;
      }

      router.replace(`/b/${demoBoardId}`);
    };

    create();
  }, [router]);

  return (
    <p className="text-center text-primary mt-20">
      Creating your demo board...
    </p>
  );
}
