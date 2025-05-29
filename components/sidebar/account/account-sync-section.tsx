import LoginModal from "@/components/login/login-modal";
import SyncButton from "../sync-button";
import { useMetadataStore } from "@/store/metadata-store";
import { supabase } from "@/utils/supabase";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import { claimBoard } from "@/lib/db-actions/claim-board";
import { AccordianWrapper } from "@/components/ui/accordian-wrapper";

export default function AccountSyncSection() {
  const board = useMetadataStore((s) => s.board);
  const user = useMetadataStore((s) => s.user);

  const boardUnclaimed = !board?.user_id;
  const boardIsYours = board?.user_id === user?.id;

  const canEdit = canEditBoard();

  return (
    <div className="flex flex-col gap-2">
      {boardUnclaimed && (
        <p className="text-xs font-semibold text-center">
          This Board is Unclaimed. <br />
          Anyone can edit. {!user && "Log in to claim!"}
        </p>
      )}

      {!user && !canEdit && (
        <p className="text-xs font-semibold text-center">
          This board is claimed. Log in to see if you have access.
        </p>
      )}

      {user && (
        <div className="flex flex-col w-full">
          {boardIsYours ? (
            <AccordianWrapper title="Board Options" titleClassName="text-sm">
              null
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

      <div className=" mt-2">
        {user ? (
          <div className="flex flex-col w-full items-center">
            <button
              type="button"
              title="Logout Button"
              onClick={() => supabase.auth.signOut()}
              className="text-white text-sm font-bold font-header
             cursor-pointer hover:text-accent transition-all duration-200"
            >
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
