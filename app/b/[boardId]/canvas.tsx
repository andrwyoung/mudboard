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

  scrollY: number;
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
  scrollY,
  sidebarWidth,
}: CanvasProps) {
  const gallerySpacingSize = useUIStore((s) => s.gallerySpacingSize);

  // overlay gallery stuff
  const { isOpen: overlayGalleryIsOpen, overlayBlock: overlayGalleryBlock } =
    useOverlayStore(isMirror ? "mirror" : "main");

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
