"use client";

import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Logo from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Board } from "@/types/board-types";
import { getUserBoards } from "@/lib/db-actions/user/get-user-boards";
import { useMetadataStore } from "@/store/metadata-store";
import { formatCreationDate, formatUpdateTime } from "@/utils/time-formatters";
import InlineEditText from "@/components/ui/inline-edit";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const [userBoards, setUserBoards] = useState<Board[]>([]);
  const user = useMetadataStore((s) => s.user);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  useEffect(() => {
    async function initBoards() {
      if (!user) return;
      const boards = await getUserBoards(user.id);
      setUserBoards(boards);
    }

    initBoards();
  }, [user]);

  // update board title
  async function updateBoardTitle(boardId: string, newTitle: string | null) {
    // Optimistically update local state
    setUserBoards((prevBoards) =>
      prevBoards.map((board) =>
        board.board_id === boardId ? { ...board, title: newTitle } : board
      )
    );

    const { error } = await supabase
      .from("boards")
      .update({ title: newTitle })
      .eq("board_id", boardId);

    if (error) {
      toast.error("Failed to update board title.");
      // Revert local update if needed
      setUserBoards((prevBoards) =>
        prevBoards.map((board) =>
          board.board_id === boardId ? { ...board, title: board.title } : board
        )
      );
    }
  }

  return (
    <div className="min-h-screen bg-background text-primary p-6 relative">
      {/* Logo */}
      <div className="absolute top-4 left-6">
        <Logo color="brown" />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center max-w-5xl mx-auto mt-16 mb-10">
        <h1 className="text-3xl font-bold">Your Boards</h1>
        <Button onClick={handleLogout} className="font-header">
          Log Out
        </Button>
      </div>

      {/* Board Cards Grid */}
      <div className="max-w-5xl mx-auto ">
        {userBoards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {userBoards.map((board) => (
              <div
                key={board.board_id}
                className="h-40 rounded-md bg-background border-2 border-primary shadow-sm flex
              flex-col justify-between text-primary-darker"
              >
                {/* <h1 className="text-xl text-primary">{board.title}</h1> */}
                <div className=" mt-4 ml-2">
                  <InlineEditText
                    value={
                      board.title && board.title.trim() != ""
                        ? board.title
                        : null
                    }
                    unnamedPlaceholder="Untitled Board"
                    placeholder="Name your board"
                    onChange={(newTitle) => {
                      updateBoardTitle(board.board_id, newTitle);
                    }}
                    className="text-xl text-primary max-w-64"
                  />
                </div>

                <div className="text-xs ml-6 mb-4">
                  <p className="">
                    Created: {formatCreationDate(board.created_at)}
                  </p>
                  <p className="">
                    Last Updated:{" "}
                    {board.updated_at
                      ? formatUpdateTime(board.updated_at)
                      : "Never"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full self-center">No Boards to show</div>
        )}
      </div>
    </div>
  );
}
