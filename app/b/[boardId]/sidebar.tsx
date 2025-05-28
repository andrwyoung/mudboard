import NewBoardButton from "@/components/sidebar/new-board-button";
import { useMetadataStore, useUserStore } from "@/store/metadata-store";
import { SCROLLBAR_STYLE } from "@/types/constants";
import React, { RefObject, useEffect } from "react";
import AccountSyncSection, {
  AccordianWrapper,
} from "@/components/sidebar/account/account-section";
import SectionsSection from "@/components/sidebar/sections-section";
import CustomizeSection from "@/components/sidebar/customize-section";
import Logo from "@/components/ui/logo";

// const fontClass = "font-semibold text-sm font-header";
// const refClass =
//   "text-white hover:text-primary-foreground transition-all hover:underline";

export default function Sidebar({
  sectionRefs,
}: {
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
}) {
  const board = useMetadataStore((s) => s.board);
  const user = useUserStore((s) => s.user);

  // syncing access
  useEffect(() => {
    useMetadataStore.getState().getAndSyncAccessLevel();
  }, [board, user]);

  return (
    <div
      className={`flex flex-col h-full w-full relative overflow-y-auto ${SCROLLBAR_STYLE}`}
    >
      <div className="flex flex-col gap-2 justify-center items-center py-8 px-4 ">
        <Logo />
        <div className="flex flex-col items-center gap-1.5">
          <p className="font-header text-xs font-bold">Start creating:</p>
          <NewBoardButton />
        </div>
      </div>

      <div className="flex flex-col flex-grow justify-center gap-24">
        {/*  <div className="flex flex-col px-8 items-center gap-1">
         <h1 className="text-3xl font-bold">Hi there!</h1>
          <p className="text-xs font-semibold text-center mb-3">
            This board is <strong>fully customizable</strong>.<br />
            <br />
            Play around with this board, <br />
            drop in new images, or
          </p> */}

        {/* <div className="flex flex-col gap-1">
            <p className={`${fontClass}`}>
              •{" "}
              <a
                href="https://www.jonadrew.com/"
                target="_blank"
                rel="noreferrer"
                className={`${refClass} ${fontClass}`}
              >
                My Art Portfolio
              </a>
            </p>
            <p className={`${fontClass}`}>
              •{" "}
              <a
                href="https://blog.jonadrew.com/profile"
                target="_blank"
                rel="noreferrer"
                className={`${refClass} ${fontClass}`}
              >
                How this is being built
              </a>
            </p>
          </div> 
        </div> */}

        <div className="flex flex-col gap-12">
          <div className="px-6">
            <SectionsSection sectionRefs={sectionRefs} />
          </div>

          <div className="px-8">
            <AccordianWrapper
              title="Customize!"
              titleClassName="font-header text-md px-2"
            >
              <CustomizeSection />
            </AccordianWrapper>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full px-8 pt-6">
        <AccountSyncSection />
        {/* <NewBoardButton /> */}
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
