import { AnimatePresence, motion } from "framer-motion";
import OverlayGallery from "./overlay-gallery";
import { useUIStore } from "@/store/ui-store";
import { SCROLLBAR_STYLE } from "@/types/constants";
import { MirrorContext } from "./board";
import SectionHeader from "@/components/section/section-header";
import Gallery from "./gallery";
import { CanvasScope, Section, SectionColumns } from "@/types/board-types";
import { Block } from "@/types/block-types";
import { useOverlayStore } from "@/store/overlay-store";
import { useEffect, useRef, useState } from "react";
import { useSelectionStore } from "@/store/selection-store";

type CanvasProps = {
  isMirror: boolean;

  sections: Section[];
  sectionColumns: SectionColumns;
  sectionRefs: React.RefObject<Record<string, HTMLDivElement | null>>;
  sectionMap: Record<string, Section>;

  draggedBlock: Block | null;
  selectedBlocks: Record<string, Block>;
  setSelectedBlocks: (
    scope: CanvasScope,
    blocks: Record<string, Block>
  ) => void;

  updateSectionColumns: (
    sectionId: string,
    fn: (prev: Block[][]) => Block[][]
  ) => void;
  dropIndicatorId: string | null;

  sidebarWidth: number;
};

export default function Canvas({
  isMirror,
  sections,
  sectionColumns,
  sectionRefs,
  sectionMap,
  draggedBlock,
  selectedBlocks,
  setSelectedBlocks,
  updateSectionColumns,
  dropIndicatorId,
  sidebarWidth,
}: CanvasProps) {
  const gallerySpacingSize = useUIStore((s) => s.gallerySpacingSize);

  // overlay gallery stuff
  const { isOpen: overlayGalleryIsOpen, overlayBlock: overlayGalleryBlock } =
    useOverlayStore(isMirror ? "mirror" : "main");

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
        isMirror ? "bg-stone-300 text-white" : ""
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
            {sections
              .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
              .map((section) => {
                const sectionId = section.section_id;
                const columns = sectionColumns[sectionId];

                return (
                  <div
                    key={sectionId}
                    ref={(el) => {
                      if (!isMirror) {
                        sectionRefs.current[sectionId] = el;
                      }
                    }}
                  >
                    <SectionHeader section={sectionMap[sectionId]} />
                    {columns && (
                      <Gallery
                        sectionId={sectionId}
                        columns={columns}
                        updateColumns={(fn) =>
                          updateSectionColumns(sectionId, fn)
                        }
                        draggedBlock={draggedBlock}
                        sidebarWidth={sidebarWidth}
                        scrollY={scrollY}
                        selectedBlocks={selectedBlocks}
                        setSelectedBlocks={setSelectedBlocks}
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
