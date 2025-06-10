// this component is all the stuff on the bottom of the sidebar that has to do with
// logging in and displaying the copywriting for all the types of access
// it's the login buttons and the sync thing you see

import LoginModal from "@/components/login/login-modal";
import SyncButton from "./sync-button";
import { useMetadataStore } from "@/store/metadata-store";
import { supabase } from "@/utils/supabase";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import { claimBoard } from "@/lib/db-actions/claim-board";
import { AccordianWrapper } from "@/components/ui/accordian-wrapper";
import { CheckField } from "../ui/check-field";
import { changeBoardPermissions } from "@/lib/db-actions/change-board-permissions";
import { DASHBOARD_LINK } from "@/types/constants";
import Link from "next/link";
import { FiLogOut } from "react-icons/fi";
import { FaHome } from "react-icons/fa";
import { FaShare } from "react-icons/fa6";
import { toast } from "sonner";

export default function AccountSyncSection() {
  const board = useMetadataStore((s) => s.board);
  const user = useMetadataStore((s) => s.user);

  const boardUnclaimed = board !== null && board.user_id === null;
  const boardIsYours = board?.user_id === user?.id;

  const canEdit = canEditBoard();

  const openToPublic = board?.access_level === "public";

  return (
    <div className="flex flex-col gap-2">
      {boardUnclaimed && (
        <p className="text-xs font-semibold text-center">
          This Board is Unclaimed. <br />
          Anyone can edit. {!user && "Log in to claim!"}
        </p>
      )}

      {!boardUnclaimed && !user && !canEdit && (
        <p className="text-xs font-semibold text-center">
          This Board is Claimed. Log in if this board was shared with you.
        </p>
      )}

      {!boardUnclaimed && !user && canEdit && (
        <p className="text-xs font-semibold text-center">
          This Board is Claimed. But Owner has allowed editing
        </p>
      )}

      {user && (
        <div className="flex flex-col w-full">
          {boardIsYours ? (
            <AccordianWrapper title="Board Options" titleClassName="text-sm">
              <div className="flex flex-col mb-4">
                <CheckField
                  text="Allow anyone to edit"
                  title="Allow anyone to edit"
                  isChecked={openToPublic}
                  onChange={(checked) => {
                    changeBoardPermissions(checked ? "public" : "private");
                  }}
                />
              </div>
            </AccordianWrapper>
          ) : boardUnclaimed ? (
            <button
              type="button"
              title="Claim Board"
              className="w-fit px-4 py-0.5 self-center rounded-lg bg-secondary text-primary font-header text-sm
              cursor-pointer hover:bg-accent transition-all duration-200 mb-1"
              onClick={claimBoard}
            >
              Claim Board
            </button>
          ) : (
            <p className="text-xs font-semibold">
              This board belongs to someone else.
            </p>
          )}
        </div>
      )}

      {canEdit && <SyncButton />}
      <button
        type="button"
        title="Share Board"
        onClick={() => {
          const url = `https://mudboard.com/b/${board?.board_id}`;
          navigator.clipboard.writeText(url).then(() => {
            console.log("Copied to clipboard:", url);
          });
          toast.success("Copied Board Link!");
        }}
        className="flex items-center gap-2 text-white text-sm font-bold font-header
                    cursor-pointer hover:text-accent transition-all duration-300"
      >
        <FaShare />
        Share (Copy Link)
      </button>

      <div className=" mt-2">
        {user ? (
          <div className="flex flex-col w-full bg-background px-4 py-2 rounded-lg">
            <Link
              href={DASHBOARD_LINK}
              className="flex gap-2 items-center
              text-primary cursor-pointer hover:text-accent 
            transition-all duration-300 font-header text-sm font-bold"
            >
              <FaHome />
              Dashboard
            </Link>
            <button
              type="button"
              title="Logout Button"
              onClick={() => supabase.auth.signOut()}
              className="flex gap-2 items-center
              text-primary text-sm font-bold font-header
             cursor-pointer hover:text-accent transition-all duration-200"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        ) : (
          <LoginModal />
        )}
      </div>
    </div>
  );
}
