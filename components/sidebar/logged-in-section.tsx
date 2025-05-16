import { toast } from "sonner";
import { useMetadataStore } from "@/store/metadata-store";
import { clearBoardPassword } from "@/lib/auth/save-get-password";
import { Board } from "@/types/board-types";

export default function LoggedInSection({ board }: { board: Board }) {
  const setAccessLevel = useMetadataStore((s) => s.setAccessLevel);

  function handleLogout() {
    if (!board) return;

    clearBoardPassword(board.board_id);
    setAccessLevel("CLAIMED_NOT_LOGGED_IN");
    toast.success("Logged out.");
  }

  return (
    <div className="flex gap-2 justify-between items-center text-sm">
      <p className="">You are logged in.</p>
      <button
        onClick={handleLogout}
        className="font-bold cursor-pointer hover:underline 
        transition-all duration-200 text-white"
      >
        Logout
      </button>
    </div>
  );
}
