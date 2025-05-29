// DEPRECATED

import ClaimBoardSection from "@/components/sidebar/claim-board-section";
import LoginSection from "@/components/sidebar/login-section";
import LoggedInSection from "@/components/sidebar/logged-in-section";
import { useMetadataStore } from "@/store/metadata-store";
import SyncButton from "../sync-button";
import { AccordianWrapper } from "@/components/ui/accordian-wrapper";

export default function OldAccountSyncSection() {
  const board = useMetadataStore((s) => s.board);
  const accessLevel = useMetadataStore((s) => s.accessLevel);

  return (
    <div className="flex flex-col gap-2">
      {accessLevel === "UNCLAIMED" && board && (
        <AccordianWrapper
          title="This board is unclaimed. Anyone can edit"
          titleClassName="text-xs"
        >
          <ClaimBoardSection board={board} />
        </AccordianWrapper>
      )}

      {accessLevel === "CLAIMED_NOT_LOGGED_IN" && board && (
        <AccordianWrapper
          title="This Board is Claimed"
          titleClassName="text-xs "
        >
          <LoginSection board={board} />
        </AccordianWrapper>
      )}

      {accessLevel === "CLAIMED_LOGGED_IN" && board && (
        <LoggedInSection board={board} />
      )}

      {accessLevel !== "CLAIMED_NOT_LOGGED_IN" && <SyncButton />}
    </div>
  );
}
