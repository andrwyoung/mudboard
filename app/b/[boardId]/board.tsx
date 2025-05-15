"use client";
import Gallery from "./gallery";
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
import { syncOrderToSupabase } from "@/lib/db-actions/sync-order";
import { useLayoutStore } from "@/store/layout-store";
import { useUIStore } from "@/store/ui-store";
import { DEFAULT_COLUMNS, SCROLLBAR_STYLE } from "@/types/constants";
import { generateColumnsFromBlocks } from "@/lib/columns/generate-columns";
import { createBlockMap } from "@/lib/columns/generate-block-map";
import { useColumnUpdater } from "@/hooks/use-column-updater";
import { fetchSupabaseSections } from "@/lib/db-actions/fetch-db-sections";
import { createSection } from "@/lib/db-actions/create-new-section";
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
import { SectionColumns } from "@/types/board-types";
import { useMetadataStore } from "@/store/metadata-store";
import { fetchSupabaseBoard } from "@/lib/db-actions/fetch-db-board";

// differentiating mirror gallery from real one
const MirrorContext = createContext(false);
export const useIsMirror = () => useContext(MirrorContext);

export default function Board({ boardId }: { boardId: string }) {
  const [flatBlocks, setFlatBlocks] = useState<Block[]>([]);

  // when dragging new images from local computer
  const [draggedFileCount, setDraggedFileCount] = useState<number | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  console.log(isUploading);

  const [selectedSectionId, setSelectedSectionId] = useState("");

  // when dragging blocks
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);

  const spacingSize = useUIStore((s) => s.spacingSize);
  const gallerySpacingSize = useUIStore((s) => s.gallerySpacingSize);
  const numCols = useUIStore((s) => s.numCols);
  // const mirrorNumCols = useUIStore((s) => s.mirrorNumCols);

  // sections
  const sections = useMetadataStore((s) => s.sections);
  const setSections = useMetadataStore((s) => s.setSections);
  const setBoard = useMetadataStore((s) => s.setBoard);

  // when blurring images
  const setShowBlurImg = useLayoutStore((s) => s.setShowBlurImg);
  const [sliderVal, setSliderVal] = useState(DEFAULT_COLUMNS);
  const [fadeGallery, setFadeGallery] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const [scrollY, setScrollY] = useState(0);

  // virtualization
  const mainRef = useRef<HTMLDivElement | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  // helper function (so I don't forget setting layout dirty)
  const [sectionColumns, setSectionColumns] = useState<SectionColumns>({});

  const updateSectionColumns = useColumnUpdater(setSectionColumns);

  // for dragging and stuff
  const [dropIndicatorId, setDropIndicatorId] = useState<string | null>(null);
  const initialPointerYRef = useRef<number | null>(null);

  const [selectedBlocks, setSelectedBlocks] = useState<Record<string, Block>>(
    {}
  );

  // SECTION: Getting all the initial images
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
          const fallback = await createSection({ board_id: boardId });
          sections = [fallback];
        }
        console.log("Got sections: ", sections);

        setSections(sections);
        setSelectedSectionId(sections[0].section_id);
        console.log("Set sections to:", sections);
      } catch (err) {
        console.error("Error loading sections:", err);
        toast.error("Error loading data! Try reloading");
      }
    }

    loadImages();
  }, [boardId, setSections, setBoard]);

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

  // KEY SECTION: here is where we regenerate columns and block maps

  // this is where we generate the columns everytime things change
  useEffect(() => {
    const nextColumns: SectionColumns = {};
    for (const [sectionId, blocks] of Object.entries(blocksBySection)) {
      nextColumns[sectionId] = generateColumnsFromBlocks(blocks, numCols);
    }
    setSectionColumns(nextColumns);
  }, [blocksBySection, numCols]);

  // const mirrorColumns = useMemo(
  //   () => generateColumnsFromBlocks(flatBlocks, mirrorNumCols),
  //   [flatBlocks, mirrorNumCols]
  // );

  // update the fake columns with the real ones if reals ones change

  const blockMap = useMemo(
    () => createBlockMap(sectionColumns),
    [sectionColumns]
  );

  const sectionMap = useMemo(() => {
    const map: Record<string, { title: string; section_id: string }> = {};
    for (const section of sections) {
      map[section.section_id] = {
        section_id: section.section_id,
        title: section.title ?? "Untitled",
      };
    }
    return map;
  }, [sections]);
  // const mirrorBlockMap = useMemo(
  //   () => createBlockMap(mirrorCols),
  //   [mirrorCols]
  // );

  //
  //
  // SECTION: Everything to do with block order
  //

  // syncing block order to database
  useEffect(() => {
    const interval = setInterval(() => {
      if (useLayoutStore.getState().layoutDirty) {
        syncOrderToSupabase(sectionColumns, boardId, spacingSize); // pass in current layout
        useLayoutStore.getState().setLayoutDirty(false);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [boardId, sectionColumns, spacingSize]);

  // SECTION: When you drag and drop and image
  //

  // handling importing images
  useImageImport({
    sectionId: selectedSectionId,
    boardId,
    columns: sectionColumns[selectedSectionId],
    updateColumns: (fn) => updateSectionColumns(selectedSectionId, fn),
    setIsDragging: setIsDraggingFile,
    setDraggedFileCount,
    setIsUploading,
  });

  // SECTION: Things to do with blurirng
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

  // SECTION: scroll behavior
  //
  //

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    const onScroll = () => {
      setScrollY(el.scrollTop);
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // SECTION: measuring and stuff
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

  // // if you're scrolling using an image, then blur everything
  // useEffect(() => {
  //   if (!draggedBlock) return;

  //   let timeout: NodeJS.Timeout | null = null;

  //   const handleScroll = () => {
  //     setShowBlurImg(true);

  //     if (timeout) clearTimeout(timeout);
  //     timeout = setTimeout(() => {
  //       setShowBlurImg(false);
  //     }, 300); // adjust this delay to match "scroll stop" detection
  //   };

  //   const mainScrollEl = document.querySelector("main"); // adjust if needed
  //   if (!mainScrollEl) return;

  //   mainScrollEl.addEventListener("scroll", handleScroll);

  //   return () => {
  //     mainScrollEl.removeEventListener("scroll", handleScroll);
  //     if (timeout) clearTimeout(timeout);
  //   };
  // }, [draggedBlock, setShowBlurImg]);
  const { handleDragStart, handleDragMove, handleDragEnd } = useGalleryHandlers(
    {
      sectionColumns,
      sections,
      blockMap,
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
      setSelectedBlocks,
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center text-white text-2xl">
          {draggedFileCount
            ? `Drop ${draggedFileCount} file${draggedFileCount > 1 ? "s" : ""}!`
            : "Drop your file!"}
        </div>
      )}

      <DndContext
        collisionDetection={pointerWithin}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        sensors={sensors}
      >
        {/* Sidebar */}
        <aside
          className="hidden lg:block w-1/6 min-w-[200px] max-w-[280px]
      bg-primary"
          ref={sidebarRef}
        >
          <Sidebar
            sections={sections}
            sliderVal={sliderVal}
            setSliderVal={setSliderVal}
            setFadeGallery={setFadeGallery}
            setShowLoading={setShowLoading}
          />
        </aside>

        {/* Gallery */}
        <main ref={mainRef} className="flex-1">
          <div
            className={`absolute top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 
            transition-opacity duration-200 text-white text-3xl bg-primary px-6 py-3 rounded-xl shadow-xl 
            pointer-events-none ${
              fadeGallery ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
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
            <div
              className={`flex-1 overflow-y-scroll h-full ${SCROLLBAR_STYLE}`}
              style={{
                direction: "rtl",
                paddingLeft: gallerySpacingSize,
                paddingRight: gallerySpacingSize,
              }}
            >
              <div style={{ direction: "ltr" }}>
                <MirrorContext.Provider value={false}>
                  {Object.entries(sectionColumns).map(
                    ([sectionId, columns]) => (
                      <div key={sectionId}>
                        <div className="flex flex-row justify-between items-center pt-6 pb-0 px-6">
                          <h1
                            className="text-primary text-2xl "
                            title={sectionMap[sectionId]?.title ?? "Untitled"}
                          >
                            {sectionMap[sectionId]?.title ?? "Untitled"}
                          </h1>

                          <p
                            className="text-primary "
                            title={sectionMap[sectionId]?.title ?? "Untitled"}
                          >
                            Descripiton Here here herne reotfrne tfrnto
                            irnfeitnreoi t
                          </p>
                        </div>

                        <Gallery
                          sectionId={sectionId}
                          columns={columns}
                          updateColumns={(fn) =>
                            updateSectionColumns(selectedSectionId, fn)
                          }
                          draggedBlock={draggedBlock}
                          sidebarWidth={sidebarWidth}
                          scrollY={scrollY}
                          selectedBlocks={selectedBlocks}
                          setSelectedBlocks={setSelectedBlocks}
                          overId={dropIndicatorId}
                        />
                      </div>
                    )
                  )}
                </MirrorContext.Provider>
              </div>
            </div>
            {/* <div
              className={`flex-1 overflow-y-scroll h-full ${SCROLLBAR_STYLE}`}
            >
              <MirrorContext.Provider value={true}>
                <Gallery
                  columns={mirrorCols}
                  updateColumns={updateMirrorColumns}
                  draggedBlock={draggedBlock}
                  sidebarWidth={sidebarWidth}
                  scrollY={scrollY}
                  selectedBlocks={selectedBlocks}
                  setSelectedBlocks={setSelectedBlocks}
                  overId={overId}
                />
              </MirrorContext.Provider>
            </div> */}
          </div>
        </main>

        <DragOverlay>
          {draggedBlock &&
            draggedBlock.block_type === "image" &&
            draggedBlock.data &&
            "fileName" in draggedBlock.data && (
              <Image
                src={draggedBlock.data.fileName}
                alt={draggedBlock.data.caption}
                width={draggedBlock.data.width}
                height={draggedBlock.height}
                className="rounded-md object-cover backdrop-blur-md opacity-80 transition-transform
        duration-200 ease-out scale-105 shadow-xl rotate-1"
              />
            )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
