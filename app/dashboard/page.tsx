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
import { FaArrowRight } from "react-icons/fa6";
import Link from "next/link";
import { NEW_BOARD_LINK } from "@/types/constants";

export default function DashboardPage() {
  const router = useRouter();
  const [userBoards, setUserBoards] = useState<Board[]>([]);
  const [boardCounts, setBoardCounts] = useState<
    Record<string, { sectionCount: number; blockCount: number }>
  >({});
  const user = useMetadataStore((s) => s.user);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  useEffect(() => {
    async function initBoards() {
      if (!user) return;
      const boards = await getUserBoards(user.id);

      const counts: Record<
        string,
        { sectionCount: number; blockCount: number }
      > = {};

      await Promise.all(
        boards.map(async (board) => {
          const [{ count: sectionCount }, { count: blockCount }] =
            await Promise.all([
              supabase
                .from("sections")
                .select("*", { count: "exact", head: true })
                .eq("board_id", board.board_id),
              supabase
                .from("blocks")
                .select("*", { count: "exact", head: true })
                .eq("board_id", board.board_id),
            ]);

          counts[board.board_id] = {
            sectionCount: sectionCount ?? 0,
            blockCount: blockCount ?? 0,
          };
        })
      );

      setUserBoards(boards);
      setBoardCounts(counts);
    }

    initBoards();
  }, [user]);

  // // update board title
  // async function updateBoardTitle(boardId: string, newTitle: string | null) {
  //   // Optimistically update local state
  //   setUserBoards((prevBoards) =>
  //     prevBoards.map((board) =>
  //       board.board_id === boardId ? { ...board, title: newTitle } : board
  //     )
  //   );

  //   const { error } = await supabase
  //     .from("boards")
  //     .update({ title: newTitle })
  //     .eq("board_id", boardId);

  //   if (error) {
  //     toast.error("Failed to update board title.");
  //     // Revert local update if needed
  //     setUserBoards((prevBoards) =>
  //       prevBoards.map((board) =>
  //         board.board_id === boardId ? { ...board, title: board.title } : board
  //       )
  //     );
  //   }
  // }

  return (
    <div className="min-h-screen bg-background text-primary p-6 relative">
      {/* Logo */}
      <div className="absolute top-4 left-6">
        <Logo color="brown" />
      </div>

      {/* Header */}
      <div className="flex justify-between items-center max-w-5xl mx-auto mt-16 mb-10">
        <h1 className="text-3xl font-bold">Your Boards</h1>
        <div className="flex gap-2">
          <Link
            href={NEW_BOARD_LINK}
            className={`hidden sm:flex gap-2  cursor-pointer items-center px-3 border-2 border-primary justify-center
                rounded-md text-primary text-sm font-header transition-all duration-300
                hover:text-primary-darker hover:border-accent hover:bg-accent/30 
                `}
            title="Create a New Board"
          >
            New Board
          </Link>
          <Button
            onClick={handleLogout}
            className="font-header"
            title="Log out"
          >
            Log Out
          </Button>
        </div>
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
                <div className=" mt-4 ml-2">
                  {/* <InlineEditText
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
                  /> */}
                  <Link
                    href={`/b/${board.board_id}`}
                    className="text-xl text-primary ml-3.5 font-header cursor-pointer hover:text-accent transition-all duration-300"
                  >
                    {board.title ?? "Untitled Board"}
                  </Link>
                  <p className="text-xs text-primary ml-3.5 font-bold">
                    {boardCounts[board.board_id]?.sectionCount ?? 0} sections •{" "}
                    {boardCounts[board.board_id]?.blockCount ?? 0} blocks
                  </p>
                </div>

                <div className="flex flex-row-reverse justify-between mb-4 mx-6">
                  <Link
                    href={`/b/${board.board_id}`}
                    className="text-sm font-header bg-primary px-3 py-1 rounded-lg cursor-pointer
                    flex flex-row gap-1.5 items-center justify-center transition-all duration-300
                    hover:text-primary hover:bg-accent text-white"
                    title="Open Board"
                  >
                    Open
                    <FaArrowRight />
                  </Link>

                  <div className="text-xs">
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
