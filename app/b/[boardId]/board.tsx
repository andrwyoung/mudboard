// this is pretty much everything to do with a board

// it renders the sidebar and then the main canvas
// it is the main docking point for all the drag, import, initialization handlers

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
import { useMeasureStore, useUIStore } from "@/store/ui-store";
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
import { useMetadataStore } from "@/store/metadata-store";
import { AUTOSYNC_DELAY } from "@/types/upload-settings";
import { useLoadingStore } from "@/store/loading-store";
import { useSelectionStore } from "@/store/selection-store";
import Canvas from "./canvas";
import { useInitBoard } from "@/hooks/use-init-board";
import { useGlobalListeners } from "@/hooks/gallery/use-global-listeners";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import BoardExpiredPopup from "@/components/board/board-expired-page";
import { CollapsedSidebar } from "@/components/sidebar/collapsed-sidebar";
import WelcomeModal from "@/components/modals/welcome-modal";
import { Section } from "@/types/board-types";
import { isLinkedSection } from "@/utils/is-linked-section";
import ResizablePinnedPanel from "@/components/pinned-panel/resizable-panel";
import PinnedPanel from "@/components/pinned-panel/pinned-panel";
import { usePanelStore } from "@/store/panel-store";
import { useMobileColumnResizeEffect } from "@/hooks/gallery/use-resize-listener";
import { useInitExplore } from "@/hooks/use-init-explore";
import ExplorePanel from "@/components/explore-panel/explore-panel";
import { MarqueBox } from "@/components/board/marque";
import { useMarque } from "@/hooks/gallery/use-marque";

// differentiating mirror gallery from real one
export const MirrorContext = createContext(false);
export const useIsMirror = () => useContext(MirrorContext);

export type ExtFileDropTarget = {
  section: Section;
  mirror: "main" | "mirror";
} | null;

export default function Board({ boardId }: { boardId: string }) {
  const [isExpired, setIsExpired] = useState(false);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);

  // when dragging new images from local computer
  const [isDraggingExtFile, setIsDraggingExtFile] = useState(false);
  const [extFileOverSection, setExtFileOverSection] =
    useState<ExtFileDropTarget>(null);
  const [draggedExtFileCount, setDraggedExtFileCount] = useState<number | null>(
    null
  );
  console.log(draggedExtFileCount);
  const canBoardEdit = canEditBoard();

  // when dragging blocks
  const [draggedBlocks, setDraggedBlocks] = useState<Block[] | null>(null);

  // sidebar

  const mirrorMode = useUIStore((s) => s.mirrorMode);
  const spacingSize = useUIStore((s) => s.spacingSize);

  const panelMode = usePanelStore((s) => s.panelMode);
  const sidebarCollapsed = usePanelStore((s) => s.isCollapsed);
  const setSidebarCollapsed = usePanelStore((s) => s.setIsCollapsed);

  // sections
  const boardSections = useMetadataStore((s) => s.boardSections);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // when blurring images
  const sliderVal = useLoadingStore((s) => s.sliderVal);
  const fadeGallery = useLoadingStore((s) => s.fadeGallery);
  const showLoading = useLoadingStore((s) => s.showLoading);

  // selection stuff
  const selectedSection = useSelectionStore((s) => s.selectedSection);
  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const deselectBlocks = useSelectionStore((s) => s.deselectBlocks);

  // virtualization
  const windowWidth = useMeasureStore((s) => s.windowWidth);
  const setSidebarWidth = useMeasureStore((s) => s.setSidebarWidth);
  const sidebarWidth = useMeasureStore((s) => s.sidebarWidth);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const sectionColumns = useLayoutStore((s) => s.sectionColumns);
  const updateSectionColumns = useLayoutStore((s) => s.updateColumnsInASection);

  // for dragging and stuff
  const [dropIndicatorId, setDropIndicatorId] = useState<string | null>(null);
  const initialPointerYRef = useRef<number | null>(null);

  // marque
  const [marqueRect, setMarqueRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // ordering
  const positionedBlockMap = useLayoutStore((s) => s.positionedBlockMap);
  const regenerateOrdering = useLayoutStore(
    (s) => s.regenerateOrderingInternally
  );

  // KEY SECTION: Initializers
  useInitBoard(boardId, setIsExpired, setWelcomeModalOpen); // MAIN: grabs all blocks, sections etc
  useInitExplore(); // side quest. grabs all relevant mudkits

  // KEY SECTION: regenerates the order whenever the screen size changes
  useEffect(
    () => regenerateOrdering(),
    [sectionColumns, regenerateOrdering, spacingSize, sidebarWidth, windowWidth]
  );

  // syncing block order to database
  useEffect(() => {
    const interval = setInterval(() => {
      useLayoutStore.getState().syncLayout();
    }, AUTOSYNC_DELAY);

    return () => clearInterval(interval);
  }, []);

  // SECTION: blur image when resizing window
  //

  const sectionIds = useMemo(
    () => boardSections.map((bs) => bs.section.section_id),
    [boardSections]
  );
  useMobileColumnResizeEffect(sectionIds);

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
        // console.log("sidebar remeasuring. width: ", width);
      }
    });

    observer.observe(sidebarRef.current);

    return () => {
      observer.disconnect();
    };
  }, [setSidebarWidth]);

  // SECTION: hooks
  //

  //
  // keyboard listeners
  useGlobalListeners();
  useMarque({ setMarqueRect });

  // handling importing images
  const onlyOneSectionMode = boardSections.length === 1;
  const autoSelectedSection =
    selectedSection?.section ??
    (onlyOneSectionMode ? boardSections[0].section : null);
  useImageImport({
    selectedSection: autoSelectedSection,
    setIsDraggingExtFile,
    setDraggedExtFileCount,
    extFileOverSection,
    setExtFileOverSection,
    onlyOneSectionMode,
  });

  // handling drag and droping blocks
  const { handleDragStart, handleDragMove, handleDragEnd } = useGalleryHandlers(
    {
      sectionColumns,
      boardSections,
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
      {isDraggingExtFile && !isExpired && !canBoardEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col gap-1 items-center justify-center text-white ">
          <div className="text-3xl font-header">Editing Board Disabled</div>
        </div>
      )}
      {isDraggingExtFile && boardSections.length === 1 && (
        <div
          className={`fixed inset-0 z-50 flex flex-col gap-1 items-center justify-center text-primary 
        ${
          isLinkedSection(boardSections[0]) ? "bg-secondary/20" : "bg-accent/20"
        }`}
        >
          <div className="text-3xl font-header ">Drop Images!</div>
        </div>
      )}

      {marqueRect && <MarqueBox marqueRect={marqueRect} />}

      <DndContext
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
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
              boardSections={boardSections}
              sectionColumns={sectionColumns}
              sectionRefs={sectionRefs}
              draggedBlocks={draggedBlocks}
              selectedBlocks={selectedBlocks}
              dropIndicatorId={dropIndicatorId}
              isDraggingExtFile={isDraggingExtFile}
              setExtFileOverSection={setExtFileOverSection}
              extFileOverSection={extFileOverSection}
            />
            {false && mirrorMode && (
              <div className="hidden lg:flex w-full h-full">
                <Canvas
                  isMirror={true}
                  boardSections={boardSections}
                  sectionColumns={sectionColumns}
                  sectionRefs={sectionRefs}
                  draggedBlocks={draggedBlocks}
                  selectedBlocks={selectedBlocks}
                  dropIndicatorId={dropIndicatorId}
                  isDraggingExtFile={isDraggingExtFile}
                  extFileOverSection={extFileOverSection}
                  setExtFileOverSection={setExtFileOverSection}
                />
              </div>
            )}
            <div className="hidden lg:flex  h-full">
              {panelMode !== "none" && windowWidth != 0 && (
                <ResizablePinnedPanel
                  initialWidth={windowWidth * 0.4}
                  maxWidth={Math.max(400, windowWidth - sidebarWidth - 600)}
                  dndId={
                    panelMode === "focus" ? "pinned-panel-dropzone" : undefined
                  }
                >
                  {panelMode === "focus" && <PinnedPanel />}
                  {process.env.NODE_ENV === "development" ? (
                    <ExplorePanel
                      draggedBlocks={draggedBlocks}
                      selectedBlocks={selectedBlocks}
                    />
                  ) : (
                    <div className="h-full w-full font-header text-2xl text-primary flex items-center justify-center bg-primary/40">
                      Panel Under Construction
                    </div>
                  )}
                </ResizablePinnedPanel>
              )}
            </div>
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
