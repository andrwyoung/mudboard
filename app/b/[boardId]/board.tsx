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
import { generateColumnsFromBlocks } from "@/lib/columns/generate-columns";
import { fetchSupabaseSections } from "@/lib/db-actions/fetch-db-sections";
import { createSupabaseSection } from "@/lib/db-actions/create-new-section";
import { toast } from "sonner";
import { fetchSupabaseBlocks } from "@/lib/db-actions/fetch-db-blocks";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useGalleryHandlers } from "@/hooks/use-drag-handlers";
import Image from "next/image";
import { Section, SectionColumns } from "@/types/board-types";
import { useMetadataStore } from "@/store/metadata-store";
import { fetchSupabaseBoard } from "@/lib/db-actions/fetch-db-board";
import { AUTOSYNC_DELAY } from "@/types/upload-settings";
import { useLoadingStore } from "@/store/loading-store";
import { useSelectionStore } from "@/store/selection-store";
import Canvas from "./canvas";

// differentiating mirror gallery from real one
export const MirrorContext = createContext(false);
export const useIsMirror = () => useContext(MirrorContext);

export default function Board({ boardId }: { boardId: string }) {
  const [flatBlocks, setFlatBlocks] = useState<Block[]>([]);

  // when dragging new images from local computer
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [draggedFileCount, setDraggedFileCount] = useState<number | null>(null);

  // when dragging blocks
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);

  const spacingSize = useUIStore((s) => s.spacingSize);
  const numCols = useUIStore((s) => s.numCols);

  const mirrorMode = useUIStore((s) => s.mirrorMode);

  // sections
  const sections = useMetadataStore((s) => s.sections);
  const setSections = useMetadataStore((s) => s.setSections);
  const [initSections, setInitSections] = useState<Section[]>([]);
  const setBoard = useMetadataStore((s) => s.setBoard);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // when blurring images
  const setShowBlurImg = useLoadingStore((s) => s.setShowBlurImg);
  const sliderVal = useLoadingStore((s) => s.sliderVal);
  const fadeGallery = useLoadingStore((s) => s.fadeGallery);
  const showLoading = useLoadingStore((s) => s.showLoading);

  const [scrollY, setScrollY] = useState(0);

  // selection stuff
  const selectedSection = useSelectionStore((s) => s.selectedSection);
  const setSelectedSection = useSelectionStore((s) => s.setSelectedSection);
  const selectedBlocks = useSelectionStore((s) => s.selectedBlocks);
  const setSelectedBlocks = useSelectionStore((s) => s.setSelectedBlocks);
  const deselectBlocks = useSelectionStore((s) => s.deselectBlocks);

  // virtualization
  const mainRef = useRef<HTMLDivElement | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // helper function (so I don't forget setting layout dirty)
  const sectionColumns = useLayoutStore((s) => s.sectionColumns);
  const setSectionColumns = useLayoutStore((s) => s.setSectionColumns);
  const updateSectionColumns = useLayoutStore((s) => s.updateColumnsInASection);

  // for dragging and stuff
  const [dropIndicatorId, setDropIndicatorId] = useState<string | null>(null);
  const initialPointerYRef = useRef<number | null>(null);

  // ordering
  const positionedBlockMap = useLayoutStore((s) => s.positionedBlockMap);
  const regenerateLayout = useLayoutStore((s) => s.regenerateLayout);

  // SECTION: On load. Initialize everything
  //

  // load all images on init
  useEffect(() => {
    async function loadImages() {
      try {
        const board = await fetchSupabaseBoard(boardId);
        setBoard(board);

        const blocks = await fetchSupabaseBlocks(boardId);
        setFlatBlocks(blocks);

        let sections = await fetchSupabaseSections(boardId);

        if (sections.length === 0) {
          console.log("No sections, creating one");
          const fallback = await createSupabaseSection({
            board_id: boardId,
            order_index: 0,
          });
          sections = [fallback];
        }
        console.log("Got sections: ", sections);

        setSections(sections);
        setInitSections(sections);
        setSelectedSection(sections[0]);
        console.log("Set sections to:", sections);
      } catch (err) {
        console.error("Error loading sections:", err);
        toast.error("Error loading data! Try reloading");
      }
    }

    loadImages();
  }, [boardId, setSections, setBoard, setSelectedSection]);

  // group them into sectioned blocks
  const blocksBySection = useMemo(() => {
    const grouped: Record<string, Block[]> = {};
    for (const block of flatBlocks) {
      const key = block.section_id ?? "unassigned";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(block);
    }
    return grouped;
  }, [flatBlocks]);

  // KEY SECTION:
  // this is where we generate the columns everytime things change
  useEffect(() => {
    if (!initSections.length) return;

    const nextColumns: SectionColumns = {};

    for (const section of initSections) {
      nextColumns[section.section_id] = generateColumnsFromBlocks(
        blocksBySection[section.section_id],
        numCols
      );
    }
    setSectionColumns(nextColumns);
    regenerateLayout(spacingSize);
  }, [
    blocksBySection,
    initSections,
    numCols,
    setSectionColumns,
    regenerateLayout,
    spacingSize,
  ]);

  // whenever the order changes, regenerate the layout
  useEffect(
    () => regenerateLayout(spacingSize),
    [sectionColumns, spacingSize, regenerateLayout]
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
  //
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const handleResize = () => {
      setShowBlurImg(true);
      console.log("blurring image (resizing)");

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
  }, [setShowBlurImg]);

  // SECTION: measurements and virtualization setup
  //
  //

  // track scroll behavior for virtualization
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    const onScroll = () => {
      setScrollY(el.scrollTop);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

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
  }, []);

  // SECTION: hooks
  //
  //

  // handling importing images
  useImageImport({
    selectedSection: selectedSection,
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
      setDraggedBlock,
      dropIndicatorId,
      setDropIndicatorId,
      deselectBlocks,
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

  return (
    <div className="flex h-screen overflow-hidden relative">
      {isDraggingFile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col gap-1 items-center justify-center text-white ">
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
        </div>
      )}

      <DndContext
        collisionDetection={pointerWithin}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        sensors={sensors}
        autoScroll={false}
      >
        {/* Sidebar */}
        <aside
          className="hidden lg:block w-1/6 min-w-[200px] max-w-[250px]
      bg-primary"
          ref={sidebarRef}
        >
          <Sidebar sectionRefs={sectionRefs} />
        </aside>

        {/* Gallery */}
        <main ref={mainRef} className="flex-1">
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
              draggedBlock={draggedBlock}
              selectedBlocks={selectedBlocks}
              setSelectedBlocks={setSelectedBlocks}
              updateSectionColumns={updateSectionColumns}
              dropIndicatorId={dropIndicatorId}
              scrollY={scrollY}
              sidebarWidth={sidebarWidth}
            />
            {mirrorMode && (
              <div className="hidden lg:flex w-full h-full">
                <Canvas
                  isMirror={true}
                  sections={sections}
                  sectionColumns={sectionColumns}
                  sectionRefs={sectionRefs}
                  sectionMap={sectionMap}
                  draggedBlock={draggedBlock}
                  selectedBlocks={selectedBlocks}
                  setSelectedBlocks={setSelectedBlocks}
                  updateSectionColumns={updateSectionColumns}
                  dropIndicatorId={dropIndicatorId}
                  scrollY={scrollY}
                  sidebarWidth={sidebarWidth}
                />
              </div>
            )}
          </div>
        </main>

        <DragOverlay dropAnimation={null}>
          {draggedBlock &&
            draggedBlock.block_type === "image" &&
            draggedBlock.data &&
            "fileName" in draggedBlock.data && (
              <Image
                src={draggedBlock.data.fileName}
                alt={
                  draggedBlock.data.caption ?? draggedBlock.data.original_name
                }
                width={draggedBlock.data.width}
                height={draggedBlock.height}
                tabIndex={-1}
                className="rounded-md object-cover backdrop-blur-md opacity-80 transition-transform
        duration-200 ease-out scale-105 shadow-xl rotate-1"
              />
            )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
