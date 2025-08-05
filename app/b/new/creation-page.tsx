"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMetadataStore } from "@/store/metadata-store";
import { createNewBoard } from "@/lib/db-actions/create-new-board";
import { DEMO_BOARD_ID } from "@/types/upload-settings";
import { cloneBoard } from "@/lib/db-actions/cloning/clone-board";

export default function CreateBoardPage({ type }: { type: "new" | "demo" }) {
  const router = useRouter();
  const user = useMetadataStore((s) => s.user);
  const hasCreated = useRef(false);

  useEffect(() => {
    if (user === undefined) return;

    const create = async () => {
      if (hasCreated.current) return;
      hasCreated.current = true;

      try {
        // block if board limit has been hit
        // const allowed = await currentUserCanCreateBoardsFromDB();
        // if (!allowed) {
        //   router.replace("/");
        //   return;
        // }

        let boardId: string | null = null;

        if (type === "new") {
          const { board_id } = await createNewBoard({
            claimedBy: user?.id ?? null,
          });
          boardId = board_id;
        } else {
          boardId = await cloneBoard({
            claimedBy: null, // always null
            boardIdToClone: DEMO_BOARD_ID,
            isDemo: true,
          });
        }

        if (!boardId) throw new Error("No board ID returned");
        router.replace(`/b/${boardId}`);
      } catch (err) {
        toast.error(`Failed to create ${type} board`);
        console.error(`Failed to create ${type} board: `, err);
        router.replace("/");
      }
    };

    create();
  }, [router, user, type]);

  return (
    <p className="text-center text-primary mt-20">
      Creating your {type} board...
    </p>
  );
}
