"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMetadataStore } from "@/store/metadata-store";

export default function CreateBoardPage({ type }: { type: "new" | "demo" }) {
  const router = useRouter();
  const user = useMetadataStore((s) => s.user);
  const hasCreated = useRef(false);

  useEffect(() => {
    if (user === undefined && type === "new") return;

    const create = async () => {
      if (hasCreated.current) return;
      hasCreated.current = true;

      try {
        let boardId: string | null = null;

        if (type === "new") {
          const { board_id } = await (
            await import("@/lib/db-actions/create-new-board")
          ).createNewBoard({
            claimedBy: user?.id ?? undefined,
          });
          boardId = board_id;
        } else {
          boardId = await (
            await import("@/lib/db-actions/clone-board")
          ).cloneBoard((await import("@/types/upload-settings")).DEMO_BOARD_ID);
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
