import NewBoardButton from "@/components/sidebar/new-board-button";
import { Slider } from "@/components/ui/slider";
import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore, useUserStore } from "@/store/metadata-store";
import { useUIStore } from "@/store/ui-store";
import { MAX_COLUMNS, MIN_COLUMNS, SCROLLBAR_STYLE } from "@/types/constants";
import Image from "next/image";
import Link from "next/link";
import React, { RefObject, useEffect } from "react";
import AccountSyncSection from "@/components/sidebar/account/account-section";
import SectionsSection from "@/components/sidebar/sections-section";

const fontClass = "font-semibold text-sm font-header";
const refClass =
  "text-accent hover:text-primary-foreground transition-all hover:underline";

export default function Sidebar({
  sliderVal,
  setSliderVal,
  setFadeGallery,
  setShowLoading,
  sectionRefs,
}: {
  sliderVal: number;
  setSliderVal: (e: number) => void;
  setFadeGallery: (e: boolean) => void;
  setShowLoading: (e: boolean) => void;
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
}) {
  const setShowBlurImg = useLayoutStore((s) => s.setShowBlurImg);
  const setNumCols = useUIStore((s) => s.setNumCols);

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
      <div className="flex justify-center py-8 px-4 ">
        <Link
          className="cursor-pointer hover:scale-105 transition-transform duration-300"
          href={"/"}
        >
          <Image
            src={"/full-logo-white.png"}
            alt="mudboard logo"
            height={387}
            width={1267}
            className="w-[200px]"
          />
        </Link>
      </div>
      <div className="flex flex-col flex-grow justify-center px-10 gap-20">
        <div className="flex flex-col">
          <h1 className="text-3xl  font-bold mb-2">Site Under Construction!</h1>

          <div className="flex flex-col gap-1">
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
        </div>

        <SectionsSection sectionRefs={sectionRefs} />

        <div className="flex flex-col gap-1 self-center w-full">
          {/* <div className="flex flex-col gap-1 max-w-42 self-center w-full"> */}
          <h3 className="mb-1">Columns:</h3>

          <div className="flex flex-row justify-between px-1 items-center gap-3 text-sm font-bold">
            <p className="font-bold">{MIN_COLUMNS}</p>
            <div
              className="w-full"
              onPointerDown={() => {
                setShowLoading(false);
                setShowBlurImg(true);
                setFadeGallery(true);
              }}
              onPointerUp={() => {
                // setFadeGallery(false);
                setShowLoading(true);
                setTimeout(() => {
                  setNumCols(sliderVal);
                  setFadeGallery(false);
                  setTimeout(() => {
                    setShowBlurImg(false);
                  }, 400);
                }, 300); // small delay to let layout commit — tweak as needed
              }}
            >
              <Slider
                defaultValue={[sliderVal]}
                min={MIN_COLUMNS}
                max={MAX_COLUMNS}
                onValueChange={(val) => setSliderVal(val[0])}
                // orientation="vertical"
              />
            </div>

            <p className="font-bold">{MAX_COLUMNS}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 w-full px-8 pt-6">
        <AccountSyncSection />
        <NewBoardButton />
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
