// a board is composed of:
// 1: sidebar in sidebar.tsx
// 2: one or 2 canvases depending if mirror mode is active

// structure breakdown:
// board -> 1 sidebar + 1 canvas + 1 additional canvas if mirror is active
// canvas -> 1 gallery per section
// gallery -> 1 section header + columns
// column -> blocks
// block -> text block or image block

// the board is in charge of initializing all the data
// and then dealing with the drag and drop logic

// board.tsx doesn't really handle regenerating and syncing things whenever
// things change. rather, layout-store does the lion's share of that

"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Sidebar from "./sidebar";
import { Block } from "@/types/block-types";
import { useImageImport } from "@/hooks/use-import-images";
import { useLayoutStore } from "@/store/layout-store";
import { useUIStore } from "@/store/ui-store";
import { DEFAULT_SECTION_NAME } from "@/types/constants";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useGalleryHandlers } from "@/hooks/gallery/use-drag-handlers";
import Image from "next/image";
import { Section } from "@/types/board-types";
import { useMetadataStore } from "@/store/metadata-store";
import { AUTOSYNC_DELAY } from "@/types/upload-settings";
import { useLoadingStore } from "@/store/loading-store";
import { useSelectionStore } from "@/store/selection-store";
import Canvas from "./canvas";
import { useInitBoard } from "@/hooks/use-init-board";
import { useBoardListeners } from "@/hooks/gallery/use-global-listeners";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import BoardExpiredPopup from "@/components/board/board-expired-page";
import { CollapsedSidebar } from "@/components/sidebar/collapsed-sidebar";
import WelcomeModal from "@/components/modals/welcome-modal";

// differentiating mirror gallery from real one
export const MirrorContext = createContext(false);
export const useIsMirror = () => useContext(MirrorContext);

export default function Board({ boardId }: { boardId: string }) {
  const [isExpired, setIsExpired] = useState(false);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);

  // when dragging new images from local computer
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [draggedFileCount, setDraggedFileCount] = useState<number | null>(null);
  const canEdit = canEditBoard();

  // when dragging blocks
  const [draggedBlocks, setDraggedBlocks] = useState<Block[] | null>(null);

  // sidebar
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mirrorMode = useUIStore((s) => s.mirrorMode);
  const spacingSize = useUIStore((s) => s.spacingSize);
  const numCols = useUIStore((s) => s.numCols);

  // sections
  const sections = useMetadataStore((s) => s.sections);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // when blurring images
  const setShowBlurImg = useLoadingStore((s) => s.setShowBlurImg);
  const sliderVal = useLoadingStore((s) => s.sliderVal);
  const fadeGallery = useLoadingStore((s) => s.fadeGallery);
  const showLoading = useLoadingStore((s) => s.showLoading);

  // selection stuff
  const selectedSection = useSelectionStore((s) => s.selectedSection);
  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const deselectBlocks = useSelectionStore((s) => s.deselectBlocks);

  // virtualization
  const windowWidth = useLayoutStore((s) => s.windowWidth);
  const setWindowWidth = useLayoutStore((s) => s.setWindowWidth);
  const setSidebarWidth = useLayoutStore((s) => s.setSidebarWidth);
  const sidebarWidth = useLayoutStore((s) => s.sidebarWidth);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const sectionColumns = useLayoutStore((s) => s.sectionColumns);
  const updateSectionColumns = useLayoutStore((s) => s.updateColumnsInASection);

  // for dragging and stuff
  const [dropIndicatorId, setDropIndicatorId] = useState<string | null>(null);
  const initialPointerYRef = useRef<number | null>(null);

  // ordering
  const positionedBlockMap = useLayoutStore((s) => s.positionedBlockMap);
  const regenerateOrdering = useLayoutStore((s) => s.regenerateOrdering);
  const regenerateColumns = useLayoutStore((s) => s.regenerateColumns);

  // SECTION: On load. Initialize everything
  //
  //
  useInitBoard(boardId, setIsExpired, setWelcomeModalOpen);

  // here is where we regenerate layout whenever things change
  useEffect(() => regenerateColumns(), [regenerateColumns, numCols]);

  useEffect(
    () => regenerateOrdering(),
    [sectionColumns, regenerateOrdering, spacingSize, sidebarWidth, windowWidth]
  );

  const sectionMap = useMemo(() => {
    const map: Record<string, Section> = {};
    for (const section of sections) {
      map[section.section_id] = section;
    }
    return map;
  }, [sections]);

  // syncing block order to database
  useEffect(() => {
    const interval = setInterval(() => {
      useLayoutStore.getState().syncLayout();
    }, AUTOSYNC_DELAY);

    return () => clearInterval(interval);
  }, []);

  // SECTION: blur image when resizing window
  //
  useEffect(() => {
    setWindowWidth(window.innerWidth); // grab window size on init
  }, [setWindowWidth]);
  //
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const handleResize = () => {
      setShowBlurImg(true);
      console.log("blurring image (resizing)");

      // setting window widht for recalculation
      setWindowWidth(window.innerWidth);

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowBlurImg(false);
        console.log("unblurring image (resize ended)");
      }, 400); // adjust this delay if needed
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (timeout) clearTimeout(timeout);
    };
  }, [setShowBlurImg, setWindowWidth]);

  // SECTION: measurements and virtualization setup
  //
  //

  // measure sidebar
  useEffect(() => {
    if (!sidebarRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        setSidebarWidth(width);
        console.log("sidebar remeasuring. width: ", width);
      }
    });

    observer.observe(sidebarRef.current);

    return () => {
      observer.disconnect();
    };
  }, [setSidebarWidth]);

  // SECTION: hooks
  //

  // KEY SECTION: initializers

  //
  // keyboard listeners
  useBoardListeners();

  // handling importing images
  useImageImport({
    selectedSection,
    setIsDraggingFile,
    setDraggedFileCount,
  });

  // handling drag and droping blocks
  const { handleDragStart, handleDragMove, handleDragEnd } = useGalleryHandlers(
    {
      sectionColumns,
      sections,
      positionedBlockMap,
      updateSections: (
        updates: Record<string, (prev: Block[][]) => Block[][]>
      ) => {
        for (const [sectionId, fn] of Object.entries(updates)) {
          updateSectionColumns(sectionId, fn);
        }
      },
      draggedBlocks,
      setDraggedBlocks,
      dropIndicatorId,
      setDropIndicatorId,
      deselectBlocks,
      selectedBlocks,
      initialPointerYRef,
    }
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 70,
        tolerance: 5,
      },
    })
  );

  // if (isExpired) {
  //   return <BoardExpiredPage />;
  // }

  return (
    <div className="flex h-screen overflow-hidden relative">
      {isExpired && <BoardExpiredPopup />}
      {isDraggingFile && !isExpired && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col gap-1 items-center justify-center text-white ">
          {canEdit ? (
            <>
              <div className="text-3xl font-header">
                {draggedFileCount
                  ? `Drop ${draggedFileCount} file${
                      draggedFileCount > 1 ? "s" : ""
                    }!`
                  : "Drop your file!"}
              </div>
              <div className="text-md">
                {/* {draggedFileCount &&
              draggedFileCount > DROP_SPREAD_THRESHOLD &&
              `Adding more than ${DROP_SPREAD_THRESHOLD} spreads over all columns
          `} */}
                {`Adding to ${selectedSection?.title ?? DEFAULT_SECTION_NAME}`}
              </div>
            </>
          ) : (
            <div className="text-3xl font-header">Editing Disabled</div>
          )}
        </div>
      )}

      <DndContext
        collisionDetection={pointerWithin}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        sensors={sensors}
        autoScroll={!mirrorMode}
      >
        {/* Sidebar */}
        <aside
          className={`hidden lg:block 
            ${
              sidebarCollapsed
                ? "w-[60px]"
                : "w-1/6 min-w-[200px] max-w-[250px]"
            }
            bg-primary`}
          ref={sidebarRef}
        >
          {sidebarCollapsed ? (
            <CollapsedSidebar onExpand={() => setSidebarCollapsed(false)} />
          ) : (
            <Sidebar
              sectionRefs={sectionRefs}
              onCollapse={() => setSidebarCollapsed(true)}
            />
          )}
        </aside>

        {/* Gallery */}
        <main className="flex-1">
          <div
            className={`absolute top-1/2 left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 
            transition-opacity  duration-200 text-white text-3xl bg-primary px-6 py-3 rounded-xl shadow-xl 
             ${fadeGallery ? "opacity-100" : "opacity-0 pointer-events-none"}`}
          >
            {showLoading ? "Loading" : `${sliderVal} Columns`}
          </div>

          <div
            className={`transition-opacity flex flex-row w-full h-full ${
              fadeGallery
                ? "duration-200 opacity-0 pointer-events-none"
                : "duration-500 opacity-100"
            }`}
          >
            <Canvas
              isMirror={false}
              sections={sections}
              sectionColumns={sectionColumns}
              sectionRefs={sectionRefs}
              sectionMap={sectionMap}
              draggedBlocks={draggedBlocks}
              selectedBlocks={selectedBlocks}
              dropIndicatorId={dropIndicatorId}
            />
            {mirrorMode && (
              <div className="hidden lg:flex w-full h-full">
                <Canvas
                  isMirror={true}
                  sections={sections}
                  sectionColumns={sectionColumns}
                  sectionRefs={sectionRefs}
                  sectionMap={sectionMap}
                  draggedBlocks={draggedBlocks}
                  selectedBlocks={selectedBlocks}
                  dropIndicatorId={dropIndicatorId}
                />
              </div>
            )}
          </div>
        </main>

        <DragOverlay dropAnimation={null}>
          {draggedBlocks && draggedBlocks.length > 0 && (
            <div className="relative">
              {draggedBlocks[0].block_type === "image" &&
                draggedBlocks[0].data &&
                "fileName" in draggedBlocks[0].data && (
                  <Image
                    src={draggedBlocks[0].data.fileName}
                    alt={
                      draggedBlocks[0].caption ??
                      draggedBlocks[0].data.original_name
                    }
                    width={draggedBlocks[0].width}
                    height={draggedBlocks[0].height}
                    tabIndex={-1}
                    className="rounded-md object-cover backdrop-blur-md opacity-80 transition-transform
                    duration-200 ease-out scale-105 shadow-xl rotate-1"
                  />
                )}

              {draggedBlocks.length > 1 && (
                <div
                  className="absolute bottom-0 font-header right-0 bg-white px-3 py-1 
                text-md text-primary rounded-lg"
                >
                  {draggedBlocks.length}
                </div>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>
      <WelcomeModal open={welcomeModalOpen} setOpen={setWelcomeModalOpen} />
    </div>
  );
}
