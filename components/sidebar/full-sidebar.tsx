// this is the brown sidebar people see whenever they have a board open
// note that collapsed-sidebar.tsx is different, and has it's own file

import NewBoardButton from "@/components/sidebar/sections/new-board-button";
import { SCROLLBAR_STYLE } from "@/types/constants";
import { RefObject } from "react";
import SectionsSection from "@/components/sidebar/sections/sections-section";
import CustomizeSection from "@/components/sidebar/sections/customize-section";
import Logo from "@/components/ui/logo";
import AccountSyncSection from "@/components/sidebar/sections/account-sync-section";
import { AccordianWrapper } from "@/components/ui/accordian-wrapper";
import { CollapseArrow } from "@/components/ui/sidebar/collapse-arrow";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import { WorkspaceToggles } from "@/components/ui/sidebar/workspace-toggle";
import { useDemoStore } from "@/store/demo-store";

// const fontClass = "font-semibold text-sm font-header";
// const refClass =
//   "text-white hover:text-primary-foreground transition-all hover:underline";

export default function Sidebar({
  sectionRefs,
  onCollapse,
}: {
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
  onCollapse: () => void;
}) {
  const canEdit = canEditBoard();
  const isDemo = useDemoStore((s) => s.isDemoBoard);

  return (
    <div
      className={`flex flex-col h-full w-full relative overflow-y-auto ${SCROLLBAR_STYLE}`}
    >
      <div className="absolute top-3 right-2">
        <CollapseArrow left={false} onClick={onCollapse} />
      </div>

      <div className="flex flex-col gap-2 justify-center items-center py-8 px-4 ">
        <Logo />
        {/* <div className="flex flex-col items-center gap-1.5">
          <p className="font-header text-xs font-bold">Start creating:</p>
          <NewBoardButton />
        </div> */}
        {isDemo && (
          <div className="flex flex-col items-center gap-1.5">
            <p className="font-header text-xs font-bold">
              This is a Demo Board
            </p>
            <NewBoardButton />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow justify-center gap-24">
        <div className="flex flex-col gap-14">
          <div className="px-4">
            <SectionsSection sectionRefs={sectionRefs} />
          </div>
          <div className="mx-6 flex flex-col gap-1 py-4  border-background ">
            {/* <h3 className="text-sm ">Toggles:</h3> */}
            <WorkspaceToggles />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full px-4 pt-6">
        {canEdit && (
          <AccordianWrapper
            title="Share + Export"
            titleClassName="font-header text-sm px-4"
          >
            <CustomizeSection />
          </AccordianWrapper>
        )}
        <div className="px-4">
          <AccountSyncSection />
        </div>
      </div>
      <a
        className="flex flex-col items-center px-4 py-4 
      font-mono font-semibold mt-auto text-xs pt-6 text-primary-foreground
      hover:underline"
        href="https://www.andrwyoung.com/"
        title="Andrew's website"
        target="_blank"
        rel="noopener noreferrer"
      >
        &copy; {new Date().getFullYear()} Andrew Yong
      </a>
    </div>
  );
}
