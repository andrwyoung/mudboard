// this is the brown sidebar people see whenever they have a board open
// note that collapsed-sidebar.tsx is different, and has it's own file

import NewBoardButton from "@/components/sidebar/new-board-button";
import { SCROLLBAR_STYLE } from "@/types/constants";
import { RefObject } from "react";
import SectionsSection from "@/components/sidebar/sections-section";
import CustomizeSection from "@/components/sidebar/customize-section";
import Logo from "@/components/ui/logo";
import AccountSyncSection from "@/components/sidebar/account-sync-section";
import { AccordianWrapper } from "@/components/ui/accordian-wrapper";
import { CollapseArrow } from "@/components/ui/sidebar/collapse-arrow";

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
  return (
    <div
      className={`flex flex-col h-full w-full relative overflow-y-auto ${SCROLLBAR_STYLE}`}
    >
      <div className="absolute top-3 right-2">
        <CollapseArrow left={false} onClick={onCollapse} />
      </div>

      <div className="flex flex-col gap-2 justify-center items-center py-8 px-4 ">
        <Logo />
        <div className="flex flex-col items-center gap-1.5">
          <p className="font-header text-xs font-bold">Start creating:</p>
          <NewBoardButton />
        </div>
      </div>

      <div className="flex flex-col flex-grow justify-center gap-24">
        <div className="flex flex-col gap-12">
          <div className="px-4">
            <SectionsSection sectionRefs={sectionRefs} />
          </div>

          <div className="px-4">
            <AccordianWrapper
              title="Change Look"
              titleClassName="font-header text-md px-4"
            >
              <CustomizeSection />
            </AccordianWrapper>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full px-8 pt-6">
        <AccountSyncSection />
      </div>
      <div
        className="flex flex-col items-center px-4 py-4 
      font-mono font-semibold mt-auto text-xs pt-6 text-primary-foreground"
      >
        &copy; {new Date().getFullYear()} Andrew Yong
      </div>
    </div>
  );
}
