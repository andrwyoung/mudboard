// this component is all the stuff on the bottom of the sidebar that has to do with
// logging in and displaying the copywriting for all the types of access
// it's the login buttons and the sync thing you see

import LoginModal from "@/components/login/login-modal";
import SyncButton from "./sync-button";
import { useMetadataStore } from "@/store/metadata-store";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import { claimBoard } from "@/lib/db-actions/claim-board";
import { DASHBOARD_LINK } from "@/types/constants";
import Link from "next/link";
import { FaHome, FaShareAlt } from "react-icons/fa";
import { toast } from "sonner";
import { useState } from "react";
import { LuLogIn } from "react-icons/lu";

export default function AccountSyncSection() {
  const board = useMetadataStore((s) => s.board);
  const user = useMetadataStore((s) => s.user);

  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const boardUnclaimed = board !== null && board.user_id === null;

  const canEdit = canEditBoard();

  return (
    <div className="flex flex-col gap-2">
      {boardUnclaimed && (
        <div className="flex flex-col gap-2 mb-4">
          <p className="text-xs font-semibold text-center">
            This Board is Unclaimed. <br />
          </p>
          <button
            type="button"
            title="Claim Board"
            className="w-fit px-4 py-0.5 self-center rounded-lg bg-secondary text-primary font-header text-sm
                 cursor-pointer hover:bg-accent transition-all duration-200 mb-1"
            onClick={() => {
              if (user) {
                claimBoard();
              } else {
                setLoginModalOpen(true);
              }
            }}
          >
            Save Board
          </button>
        </div>
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

      {canEdit && !boardUnclaimed && <SyncButton />}

      <div className="flex items-center justify-between w-full bg-background px-4 py-2 rounded-lg ">
        <button
          type="button"
          title="Share Board"
          data-umami-event={`App: Share (Copy Link)`}
          onClick={() => {
            const url = `https://mudboard.com/b/${board?.board_id}`;
            navigator.clipboard.writeText(url).then(() => {
              console.log("Copied to clipboard:", url);
            });
            toast.success("Copied Board Link!");
          }}
          className="flex items-center gap-1 text-primary text-xs font-bold font-header
                    cursor-pointer hover:text-accent transition-all duration-300"
        >
          <FaShareAlt />
          Share
        </button>

        <div className="">
          {user ? (
            <div className="flex flex-col ">
              <Link
                title="Dashboard"
                href={DASHBOARD_LINK}
                className="flex gap-1 items-center
              text-primary cursor-pointer hover:text-accent 
            transition-all duration-300 font-header text-xs font-bold"
              >
                <FaHome />
                Dashboard
              </Link>
              {/* <button
              type="button"
              title="Logout Button"
              onClick={() => supabase.auth.signOut()}
              className="flex gap-2 items-center
              text-primary text-sm font-bold font-header
             cursor-pointer hover:text-accent transition-all duration-200"
            >
              <FiLogOut />
              Logout
            </button> */}
            </div>
          ) : (
            <div className="flex flex-col">
              <button
                type="button"
                title="Login Button"
                className="rounded-lg bg-background text-primary font-header text-xs
                 flex items-center gap-1
                  cursor-pointer hover:text-accent transition-all duration-200 font-bold"
                onClick={() => setLoginModalOpen(true)}
              >
                <LuLogIn className="size-4" />
                Log In
              </button>
            </div>
          )}
        </div>
      </div>
      <LoginModal open={loginModalOpen} setOpen={setLoginModalOpen} />
    </div>
  );
}
