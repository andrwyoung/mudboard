// all this logic is just for resizing. the meat is inside the components themselves

"use client";

import { useRef, useState, RefObject } from "react";
import { useMeasureStore, useUIStore } from "@/store/ui-store";
import {
  DRAG_THRESHOLD,
  MAX_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  SCROLLBAR_STYLE,
} from "@/types/constants";
import SectionsSection from "@/components/sidebar/sections/sections-section";
import { useDemoStore } from "@/store/demo-store";
import { FaVectorSquare } from "react-icons/fa6";
import Image from "next/image";

export default function ResizableSidebar({
  sectionRefs,
}: {
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
}) {
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const width = useMeasureStore((s) => s.sidebarWidth);
  const setWidth = useMeasureStore((s) => s.setSidebarWidth);

  const isDragging = useRef(false);
  const [dragging, setDragging] = useState(false);

  const dragStartX = useRef(0);
  const consideredDrag = useRef(false);

  const freeformOn = useUIStore((s) => s.freeformMode);
  const setFreeformMode = useUIStore((s) => s.setFreeformMode);

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current) return;

    const deltaX = Math.abs(e.clientX - dragStartX.current);
    if (deltaX >= DRAG_THRESHOLD) {
      consideredDrag.current = true;
    }

    console.log("deltaX:", deltaX, "width:", width);
    const newWidth = Math.min(
      Math.max(e.clientX, MIN_SIDEBAR_WIDTH),
      MAX_SIDEBAR_WIDTH
    );
    setWidth(newWidth);
  };
  const handleMouseUp = () => {
    isDragging.current = false;
    consideredDrag.current = false;
    setDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";

    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const startDragging = (e: React.MouseEvent) => {
    dragStartX.current = e.clientX;

    isDragging.current = true;
    setDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <aside
      ref={sidebarRef}
      style={{
        width: Math.min(Math.max(width, MIN_SIDEBAR_WIDTH), MAX_SIDEBAR_WIDTH),
      }}
      className="hidden lg:block bg-sidebar-background relative h-full select-none"
    >
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={"Resize sidebar"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
        className={`absolute top-0 right-0 w-1.5 h-full z-50  transition-all duration-200 select-none
         cursor-col-resize ${dragging ? "bg-accent" : "hover:bg-accent"}`}
        onMouseDown={(e) => {
          if (!isDragging.current) {
            startDragging(e);
          }
        }}
        title={"Drag to resize. Click to Collapse"}
      />

      <div
        className={`flex flex-col h-full w-full relative overflow-y-auto ${SCROLLBAR_STYLE}`}
      >
        <div className="flex flex-col gap-2 justify-center items-center py-8 px-4 ">
          {/* <Logo /> */}
          {/* <h1 className="font-body text-3xl">Jonadrew</h1> */}

          {/* <div className="flex flex-col items-center gap-1.5 mb-4">
            <p className="font-header text-center text-xs font-bold">
              Made with Mudboard
            </p>
            <NewBoardButton />
          </div> */}
        </div>

        <div className="flex flex-col flex-grow justify-center gap-24">
          <div className="flex flex-col gap-14">
            <div className="px-4">
              <SectionsSection sectionRefs={sectionRefs} />
            </div>
            <div className="mx-6 flex flex-col gap-1 py-4  border-background ">
              <p className="text-sm font-semibold">
                {freeformOn ? "Move Images around" : "View in Columns"}:
              </p>
              <button
                type="button"
                className={`flex items-center w-full gap-2 cursor-pointer group rounded-sm
                        hover:outline hover:outline-accent 
                        ${false ? "p-1 text-xl" : "px-2 py-0.5"}
                        ${
                          freeformOn
                            ? "bg-accent text-primary hover:bg-accent/70"
                            : "text-off-white hover:bg-accent/40"
                        }`}
                onClick={() => {
                  if (freeformOn) {
                    setFreeformMode(false);
                  } else {
                    useDemoStore.getState().markMissionComplete("freeform");

                    setFreeformMode(true);
                    // setPanelMode("none");
                  }
                }}
                title={"Freeform View"}
                aria-pressed={freeformOn}
                aria-label={"Freeform View"}
              >
                <FaVectorSquare />
                <span className="font-header">
                  {freeformOn ? "Freeform" : "Gallery"}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 ">
          <a
            className="flex flex-col items-center px-4 py-4 
                font-header text-center font-semibold mt-auto text-xs pt-4 text-bg-primary-foreground
                hover:underline"
            href="https://www.mudboard.com/"
            title="Andrew's website"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="w-[32px] h-[32px] mb-2">
              <Image
                src={"/logo.png"}
                alt={"Small Mudboard Logo"}
                width={350}
                height={350}
                draggable={false}
              />
            </div>
            Made with Mudboard
            <br />
            (I coded this!)
          </a>
        </div>

        <a
          className="flex flex-col items-center px-4 py-4 
      font-mono font-semibold mt-auto text-xs pt-2 text-bg-primary-foreground
      hover:underline"
          href="https://www.andrwyoung.com/"
          title="Andrew's website"
          target="_blank"
          rel="noopener noreferrer"
        >
          &copy; {new Date().getFullYear()} Andrew Yong
        </a>
      </div>
    </aside>
  );
}
