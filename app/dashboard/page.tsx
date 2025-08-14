// this is the dashboard that shows all the boards you have

"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/supabase-client";
import Logo from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Board } from "@/types/board-types";
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
import { softDeleteBoard } from "@/lib/db-actions/soft-delete-board";
import { BoardWithStats } from "@/types/stat-types";
import { fetchUserBoardsWithStats } from "@/lib/db-actions/explore/fetch-user-board-with-stats";
import { FaPlus } from "react-icons/fa6";

type DashboardMode = "board" | "sections";

export default function DashboardPage() {
  const router = useRouter();
  const [userBoards, setUserBoards] = useState<BoardWithStats[]>([]);
  const user = useMetadataStore((s) => s.user);
  const [boardToDelete, setBoardToDelete] = useState<Board | null>(null);
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>("board");

  const [loading, setLoading] = useState(true);

  // const profile = useMetadataStore((s) => s.profile);
  // const hasLicense = useMemo(() => {
  //   if (!profile) return undefined;
  //   return getHasLicense(profile.tier);
  // }, [profile]);

  // const canCreateBoards =
  //   hasLicense || userBoards.length < MAX_FREE_TIER_BOARDS;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  useEffect(() => {
    async function initBoards() {
      if (!user) return;

      const boards = await fetchUserBoardsWithStats(user.id);
      setUserBoards(boards);
      setLoading(false);
    }

    initBoards();
  }, [user]);

  async function handleDeleteBoard(boardId: string) {
    if (!user) return; // yes. you need to be logged in to delete a board
    const success = await softDeleteBoard(boardId, user.id);

    if (!success) {
      toast.error("Failed to delete Board");
      return;
    }

    // Remove board from UI state
    setUserBoards((prev) => prev.filter((b) => b.board_id !== boardId));
    toast.success("Board deleted.");
  }

  return (
    <div className="min-h-screen bg-primary text-primary-text p-6 pb-12 lg:px-12 relative">
      {/* Logo */}
      <div className="absolute top-4 left-6">
        <Logo enforceHome={true} />
      </div>

      {/* Header */}

      {/* Board Cards Grid */}
      <div className="flex flex-col lg:flex-row gap-8 md:gap-12  mx-auto mt-20 justify-center">
        {/* <div className="w-64 h-180 bg-primary-foreground mt-24" /> */}

        <div className="flex flex-col max-w-5xl">
          <div className="flex flex-row lg:flex-col justify-between items-center w-full min-w-32 mx-auto mb-2">
            <div>
              <div className="lg:hidden flex flex-col">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                {/* <p className="text-sm opacity-80 mt-1">
                  {hasLicense ? "Free Mode" : "License Active"}
                </p> */}
              </div>

              <div className="hidden lg:flex flex-col gap-2 my-12 items-center   ">
                <h1 className="font-semibold">Select View:</h1>
                <div className="flex flex-col gap-2 font-header text-sm">
                  <Button
                    role="tab"
                    aria-selected={dashboardMode === "board"}
                    aria-controls="dashboard-board-view"
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
                    role="tab"
                    aria-selected={dashboardMode === "sections"}
                    aria-controls="dashboard-sections-view"
                    variant={
                      dashboardMode === "sections"
                        ? "dashboard_sidebar_selected"
                        : "dashboard_sidebar_unselected"
                    }
                    onClick={() => {
                      toast("Under Construction. Thanks for your patience!");
                      setDashboardMode("sections");
                    }}
                  >
                    Sections
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-row lg:flex-col gap-2">
              <Link
                href={NEW_BOARD_LINK}
                // onClick={(e) => {
                // if (!canCreateBoards) {
                //   e.preventDefault();
                //   toast.error(
                //     "You’ve reached your board limit. Upgrade to remove limit"
                //   );
                // }
                // }}
                className={`hidden sm:flex `}
                title="Create a New Board"
              >
                <Button
                  type="button"
                  className="font-header text-sm"
                  variant="outline_accent"
                  // disabled={!canCreateBoards}
                >
                  New Board
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                className="font-header bg-transparent"
                title="Log out"
              >
                Log Out
              </Button>
            </div>
          </div>

          {/* <div className=" justify-start md:justify-center flex lg:hidden ">
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
          </div> */}
        </div>

        {!loading && userBoards.length > 0 ? (
          <div className="flex flex-col gap-8">
            <div className="hidden lg:flex justify-between items-center  ">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                {SHOW_GLOBAL_ANNOUNCEMENT && (
                  <div className="text-sm   mb-4 max-w-sm">
                    {GlobalAnnouncement}
                  </div>
                )}
              </div>
              <div className=" flex flex-col items-end">
                {/* <p className="text-sm opacity-80">
                  {hasLicense
                    ? "License active"
                    : `${MAX_FREE_TIER_BOARDS - userBoards.length} free board${
                        MAX_FREE_TIER_BOARDS - userBoards.length === 1
                          ? ""
                          : "s"
                      } left`}
                </p> */}
                {/* {!hasLicense && (
                  <Link
                    type="button"
                    href={PRICING_PAGE}
                    className="font-header text-accent hover:  transition-all duration-200
                    cursor-pointer hover:underline text-left flex gap-2 items-center"
                  >
                    <FaSeedling /> Get License
                  </Link>
                )} */}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 2xl:grid-cols-4 gap-6 lg:gap-8">
              {userBoards.map((board) => (
                <BoardCard
                  key={board.board_id}
                  board={board}
                  onDelete={() => setBoardToDelete(board)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col min-h-48 w-full gap-4">
            <div className="flex-1 flex flex-col items-center p-12 gap-4  ">
              {!loading && userBoards.length === 0 ? (
                <div className="flex flex-col items-center gap-2">
                  <h2 className="text-xl">No Boards to show</h2>
                  <Link
                    href={NEW_BOARD_LINK}
                    title="Create New Board"
                    role="button"
                    aria-label="Create a new board"
                    className="flex flex-row text-sm items-center gap-1 cursor-pointer  hover:text-accent border-2 
                    border-white px-3 py-1 rounded-lg hover:border-accent hover:bg-accent/20 transition-all duration-150"
                  >
                    <FaPlus aria-hidden="true" focusable="false" />
                    <span className="font-header">Create New Board!</span>
                  </Link>
                </div>
              ) : (
                <h2 className="text-lg">Loading Boards...</h2>
              )}
              {SHOW_GLOBAL_ANNOUNCEMENT && (
                <div className="text-sm   mb-4 max-w-sm">
                  {GlobalAnnouncement}
                </div>
              )}
            </div>
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
                  handleDeleteBoard(boardToDelete.board_id);
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
