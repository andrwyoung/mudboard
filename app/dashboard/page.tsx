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
import {
  GlobalAnnouncement,
  SHOW_GLOBAL_ANNOUNCEMENT,
} from "@/types/constants/error-message";
import BoardCard from "./dashboard-card";

type DashboardMode = "board" | "sections";

export default function DashboardPage() {
  const router = useRouter();
  const [userBoards, setUserBoards] = useState<Board[]>([]);
  const [boardCounts, setBoardCounts] = useState<
    Record<string, { sectionCount: number; blockCount: number }>
  >({});
  console.log(boardCounts);
  const user = useMetadataStore((s) => s.user);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>("board");

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
    <div className="min-h-screen bg-primary text-primary p-6 relative">
      {/* Logo */}
      <div className="absolute top-4 left-6">
        <Logo enforceHome={true} />
      </div>

      {/* Header */}

      {/* Board Cards Grid */}
      <div className="flex flex-col lg:flex-row gap-0 md:gap-12  mx-auto mt-20 justify-center">
        {/* <div className="w-64 h-180 bg-white mt-24" /> */}

        <div className="flex flex-col max-w-5xl">
          <div className="flex flex-row lg:flex-col justify-between items-center w-full min-w-32 mx-auto mb-2">
            <div>
              <h1 className="lg:hidden flex text-3xl font-bold text-white">
                Dashboard
              </h1>

              <div className="hidden lg:flex flex-col gap-2 my-12 items-center  text-white">
                <h1>Select View:</h1>
                <div className="flex flex-col gap-2 font-header">
                  <Button
                    variant={
                      dashboardMode === "board"
                        ? "dashboard_sidebar_selected"
                        : "dashboard_sidebar_unselected"
                    }
                    onClick={() => setDashboardMode("board")}
                  >
                    Boards
                  </Button>
                  <Button
                    variant={
                      dashboardMode === "sections"
                        ? "dashboard_sidebar_selected"
                        : "dashboard_sidebar_unselected"
                    }
                    onClick={() => setDashboardMode("sections")}
                  >
                    Sections
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-row lg:flex-col gap-2">
              <Link
                href={NEW_BOARD_LINK}
                className={`hidden sm:flex gap-2 cursor-pointer items-center px-3 border-2 border-white justify-center
                rounded-md text-white text-sm font-header transition-all duration-300
                hover:text-white hover:border-accent hover:bg-accent/30  py-1
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

          <div className=" justify-start md:justify-center flex lg:hidden ">
            <div className="flex gap-2 py-0.5 px-1 border-2 rounded-md bg-background">
              <Button
                variant={
                  dashboardMode === "board"
                    ? "dashboard_selected"
                    : "dashboard_unselected"
                }
                onClick={() => setDashboardMode("board")}
              >
                Boards
              </Button>
              <Button
                variant={
                  dashboardMode === "sections"
                    ? "dashboard_selected"
                    : "dashboard_unselected"
                }
                onClick={() => setDashboardMode("sections")}
              >
                Sections
              </Button>
            </div>
          </div>
        </div>

        {userBoards.length > 0 ? (
          <div className="flex flex-col gap-8">
            <h1 className="hidden lg:flex text-3xl font-bold text-white">
              Dashboard
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
              {userBoards.map((board) => (
                <BoardCard
                  key={board.board_id}
                  board={board}
                  counts={
                    boardCounts[board.board_id] ?? {
                      sectionCount: 0,
                      blockCount: 0,
                    }
                  }
                  onDelete={() => setBoardToDelete(board)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full gap-4">
            <div className="w-full self-center text-white">
              No Boards to show
            </div>
            {SHOW_GLOBAL_ANNOUNCEMENT && (
              <div className="text-sm text-white mb-4 max-w-sm">
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
