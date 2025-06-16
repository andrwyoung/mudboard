// this is the dashboard that shows all the boards you have

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
import { DEFAULT_BOARD_TITLE, NEW_BOARD_LINK } from "@/types/constants";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { FaTrashAlt } from "react-icons/fa";
import {
  GlobalAnnouncement,
  SHOW_GLOBAL_ANNOUNCEMENT,
} from "@/types/constants/error-message";

export default function DashboardPage() {
  const router = useRouter();
  const [userBoards, setUserBoards] = useState<Board[]>([]);
  const [boardCounts, setBoardCounts] = useState<
    Record<string, { sectionCount: number; blockCount: number }>
  >({});
  console.log(boardCounts);
  const user = useMetadataStore((s) => s.user);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  useEffect(() => {
    async function initBoards() {
      if (!user) return;

      // Step 1: Get user boards
      const boards = await getUserBoards(user.id);
      const boardIds = boards.map((b) => b.board_id);

      // Step 2: Fetch board stats in one query
      const { data: stats, error } = await supabase
        .from("board_stats")
        .select("board_id, section_count, block_count")
        .in("board_id", boardIds);

      if (error) {
        console.error("Error fetching board stats:", error);
        return;
      }

      // Step 3: Convert to map for fast access
      const counts: Record<
        string,
        { sectionCount: number; blockCount: number }
      > = {};
      stats?.forEach((s) => {
        counts[s.board_id] = {
          sectionCount: s.section_count ?? 0,
          blockCount: s.block_count ?? 0,
        };
      });

      // Step 4: Set state
      setUserBoards(boards);
      setBoardCounts(counts);
    }

    initBoards();
  }, [user]);

  // update board title
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

  async function softDeleteBoard(boardId: string) {
    const { error } = await supabase
      .from("boards")
      .update({ deleted: true, deleted_at: new Date().toISOString() })
      .eq("board_id", boardId);

    if (error) {
      console.error("Failed to delete board:", error.message);
      toast.error("Something went wrong deleting the board.");
      return;
    }

    // Remove board from UI state
    setUserBoards((prev) => prev.filter((b) => b.board_id !== boardId));
    toast.success("Board deleted.");
  }

  return (
    <div className="min-h-screen bg-background text-primary p-6 relative">
      {/* Logo */}
      <div className="absolute top-4 left-6">
        <Logo color="brown" enforceHome={true} />
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
                  <div className="flex items-center justify-between mx-4">
                    <Link
                      href={`/b/${board.board_id}`}
                      className="text-xl text-primary  font-header cursor-pointer hover:text-accent transition-all duration-300"
                    >
                      {board.title ?? "Untitled Board"}
                    </Link>
                    <div className="flex gap-2 items-center shrink-0">
                      <FaTrashAlt
                        onClick={() => setBoardToDelete(board)}
                        title="Delete Board"
                        className="text-primary hover:text-rose-400 transition-colors cursor-pointer"
                      />
                      {/* <RiEdit2Fill
                        onClick={() => {
                          handleEditBoardTitle(board.board_id)
                        }}
                        title="Edit Board Title"
                        className="text-primary hover:text-accent transition-colors size-5 cursor-pointer"
                      /> */}
                    </div>
                  </div>

                  <p className="text-xs text-primary ml-4 font-bold">
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
          <div className="flex flex-col w-full gap-4">
            <div className="w-full self-center">No Boards to show</div>
            {SHOW_GLOBAL_ANNOUNCEMENT && (
              <div className="text-sm text-muted-foreground mb-4 max-w-sm">
                {GlobalAnnouncement}
              </div>
            )}
          </div>
        )}
      </div>

      {boardToDelete && (
        <AlertDialog
          open={!!boardToDelete}
          onOpenChange={(open) => !open && setBoardToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl text-primary">
                Delete &quot;
                {boardToDelete.title ?? DEFAULT_BOARD_TITLE}
                &quot;?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the board and everything inside it. This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-semibold">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="font-bold"
                onClick={() => {
                  softDeleteBoard(boardToDelete.board_id);
                  setBoardToDelete(null);
                }}
              >
                Delete Board
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
