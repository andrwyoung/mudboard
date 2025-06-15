// a board is made up of a canvas. or if mirror mode is active, then it's 2 side by side canvases
// canvas is in charge of scrolling behavior

import { AnimatePresence, motion } from "framer-motion";
import OverlayGallery from "./overlay-gallery";
import { useUIStore } from "@/store/ui-store";
import { SCROLLBAR_STYLE } from "@/types/constants";
import { ExtFileDropTarget, MirrorContext } from "./board";
import SectionHeader from "@/components/section/section-header";
import Gallery from "./gallery";
import { BoardSection, SectionColumns } from "@/types/board-types";
import { Block } from "@/types/block-types";
import { useOverlayStore } from "@/store/overlay-store";
import { useEffect, useRef, useState } from "react";
import { useSelectionStore } from "@/store/selection-store";
import { MAX_DRAGGED_ITEMS } from "@/types/upload-settings";
import DroppableGallerySection from "@/components/drag/droppable-gallery-section";

type CanvasProps = {
  isMirror: boolean;

  boardSections: BoardSection[];
  sectionColumns: SectionColumns;
  sectionRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
  sectionMap: Record<string, BoardSection>;

  draggedBlocks: Block[] | null;
  selectedBlocks: Record<string, Block>;

  dropIndicatorId: string | null;
  isDraggingExtFile: boolean;
  extFileOverSection: ExtFileDropTarget;
  setExtFileOverSection: (s: ExtFileDropTarget) => void;
};

export default function Canvas({
  isMirror,
  boardSections,
  sectionColumns,
  sectionRefs,
  sectionMap,
  draggedBlocks,
  selectedBlocks,
  dropIndicatorId,
  isDraggingExtFile,
  extFileOverSection,
  setExtFileOverSection,
}: CanvasProps) {
  const gallerySpacingSize = useUIStore((s) => s.gallerySpacingSize);

  const mirrorKey = isMirror ? "mirror" : "main";
  // overlay gallery stuff
  const { isOpen: overlayGalleryIsOpen, overlayBlock: overlayGalleryBlock } =
    useOverlayStore(mirrorKey);

  const setSelectedSection = useSelectionStore((s) => s.setSelectedSection);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollY, setScrollY] = useState(0);
  // track scroll behavior for virtualization
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isMirror) return;

    const onScroll = () => {
      setScrollY(el.scrollTop);

      // detecting which section we're in
      const scrollTop = el.scrollTop;
      const sectionEntries = Object.entries(sectionRefs.current);

      // Sort sections by vertical position
      const sorted = sectionEntries
        .filter(([, ref]) => ref)
        .sort(([, a], [, b]) => (a?.offsetTop ?? 0) - (b?.offsetTop ?? 0));

      for (const [sectionId, ref] of sorted) {
        if (!ref) continue;
        const top = ref.offsetTop;
        const height = ref.offsetHeight;

        if (scrollTop >= top - 100 && scrollTop < top + height - 100) {
          // Give some buffer with -100
          setSelectedSection(sectionMap[sectionId]);
          break;
        }
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [sectionMap, sectionRefs, setSelectedSection, isMirror]);

  return (
    <div
      className={`relative h-full w-full ${
        isMirror ? "bg-stone-300 text-white" : "bg-background"
      }`}
    >
      <AnimatePresence>
        {overlayGalleryIsOpen && overlayGalleryBlock && (
          <motion.div
            key="overlay-gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-60"
          >
            <OverlayGallery
              selectedBlock={overlayGalleryBlock}
              isMirror={isMirror}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div
        key="test-key"
        className={`flex-1 overflow-y-scroll h-full ${SCROLLBAR_STYLE}`}
        tabIndex={-1}
        ref={scrollRef}
        style={{
          direction: isMirror ? "ltr" : "rtl",
          paddingLeft: gallerySpacingSize,
          paddingRight: gallerySpacingSize,
          // paddingTop: gallerySpacingSize,
          paddingBottom: gallerySpacingSize,
        }}
      >
        <div style={{ direction: "ltr" }}>
          <MirrorContext.Provider value={isMirror}>
            {boardSections
              .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
              .map(({ section }) => {
                const sectionId = section.section_id;
                const columns = sectionColumns[sectionId];

                return (
                  <div
                    key={sectionId}
                    ref={(el) => {
                      const key = isMirror ? `mirror-${sectionId}` : sectionId;
                      sectionRefs.current[key] = el;
                    }}
                    className="relative"
                    onDragOver={() => {
                      if (isDraggingExtFile) {
                        setExtFileOverSection({ section, mirror: mirrorKey });
                      }
                    }}
                  >
                    <DroppableGallerySection
                      sectionId={section.section_id}
                      isMirror={isMirror}
                      isActive={
                        draggedBlocks != null &&
                        draggedBlocks != undefined &&
                        draggedBlocks.length > MAX_DRAGGED_ITEMS
                      }
                      isExternalDrag={
                        isDraggingExtFile &&
                        extFileOverSection?.section.section_id ===
                          section.section_id &&
                        extFileOverSection.mirror === mirrorKey
                      }
                    />
                    <SectionHeader section={sectionMap[sectionId].section} />
                    {columns && (
                      <Gallery
                        sectionId={sectionId}
                        columns={columns}
                        draggedBlocks={draggedBlocks}
                        scrollY={scrollY}
                        selectedBlocks={selectedBlocks}
                        overId={dropIndicatorId}
                      />
                    )}
                  </div>
                );
              })}
          </MirrorContext.Provider>
        </div>
      </div>
    </div>
  );
}
