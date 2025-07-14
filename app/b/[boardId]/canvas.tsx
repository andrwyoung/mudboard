// a board is made up of a canvas. or if mirror mode is active, then it's 2 side by side canvases
// canvas is in charge of scrolling behavior

import { AnimatePresence, motion } from "framer-motion";
import OverlayGallery from "./overlay-gallery";
import { useMeasureStore, useUIStore } from "@/store/ui-store";
import { SCROLLBAR_STYLE } from "@/types/constants";
import { MirrorContext } from "./board";
import SectionHeader from "@/components/section/section-header";
import SectionGallery from "./gallery";
import { BoardSection, CanvasScope, SectionColumns } from "@/types/board-types";
import { useOverlayStore } from "@/store/overlay-store";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelectionStore } from "@/store/selection-store";
import DroppableGallerySection from "@/components/drag/droppable-gallery-section";
import { isLinkedSection } from "@/utils/is-linked-section";
import HelpModal from "@/components/modals/help-modal";
import { FaQuestion } from "react-icons/fa6";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import { canEditSection } from "@/lib/auth/can-edit-section";
import { useMetadataStore } from "@/store/metadata-store";
import React from "react";
import { useDragStore } from "@/store/drag-store";
import { MarqueBox } from "@/components/board/marque";
import { useMarque } from "@/hooks/gallery/use-marque";

type CanvasProps = {
  isMirror: boolean;

  boardSections: BoardSection[];
  sectionColumns: SectionColumns;
  sectionRefs: React.RefObject<Record<string, HTMLDivElement | null>>;

  isDraggingExtFile: boolean;
};

function Canvas({
  isMirror,
  boardSections,
  sectionColumns,
  sectionRefs,
  isDraggingExtFile,
}: CanvasProps) {
  const gallerySpacingSize = useUIStore((s) => s.gallerySpacingSize);
  const [helpOpen, setHelpOpen] = useState(false);

  // marque
  const [marqueRect, setMarqueRect] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  useMarque({ setMarqueRect });

  const mirrorKey = isMirror ? "mirror" : "main";
  const { isOpen: overlayGalleryIsOpen, overlayBlock: overlayGalleryBlock } =
    useOverlayStore(mirrorKey);

  const setSelectedSection = useSelectionStore((s) => s.setSelectedSection);
  const boardSectionMap = useMetadataStore((s) => s.boardSectionMap);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const setScroll = useMeasureStore((s) => s.setScroll);
  const assignSectionRef = useCallback(
    (sectionId: string) => (el: HTMLDivElement | null) => {
      const key = isMirror ? `mirror-${sectionId}` : sectionId;
      sectionRefs.current[key] = el;
    },
    [isMirror, sectionRefs]
  );

  const setExtFileOverSection = useDragStore((s) => s.setExtFileOverSection);
  const extFileOverSection = useDragStore((s) => s.extFileOverSection);

  const sortedBoardSections = useMemo(() => {
    return boardSections
      .slice()
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [boardSections]);

  // scroll to selected section on init
  // this is when we jump back and forth from freeform <-> grid
  useEffect(() => {
    const selectedSection = useSelectionStore.getState().selectedSection;
    if (!selectedSection) return;

    const sectionId = selectedSection.section.section_id;
    const el = sectionRefs.current[sectionId];
    if (el) {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, [sectionRefs]);

  // when we scroll past a section. highlight it
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || isMirror) return;

    const onScroll = () => {
      setScroll(el.scrollTop);

      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight;
      const clientHeight = el.clientHeight;

      const sectionEntries = Object.entries(sectionRefs.current);

      // Sort sections by vertical position
      const sorted = sectionEntries
        .filter(([, ref]) => ref)
        .sort(([, a], [, b]) => (a?.offsetTop ?? 0) - (b?.offsetTop ?? 0));

      // Check if we're at the bottom (within a small buffer for safety)
      const atBottom = scrollTop + clientHeight >= scrollHeight - 4;
      // if so, just select that
      if (atBottom && sorted.length > 0) {
        const [lastId] = sorted[sorted.length - 1];
        setSelectedSection(boardSectionMap[lastId]);
        return;
      }

      // else we continue with the "select section as we scroll past it logic"
      for (const [sectionId, ref] of sorted) {
        if (!ref) continue;
        const top = ref.offsetTop;
        const height = ref.offsetHeight;

        if (scrollTop >= top - 100 && scrollTop < top + height - 100) {
          // Give some buffer with -100
          setSelectedSection(boardSectionMap[sectionId]);
          break;
        }
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [setScroll, boardSectionMap, sectionRefs, setSelectedSection, isMirror]);

  return (
    <>
      {marqueRect && <MarqueBox marqueRect={marqueRect} />}
      <div
        className={`relative h-full w-full ${
          isMirror ? "bg-stone-300 text-white" : "bg-background"
        }`}
        data-id="canvas"
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
            paddingTop: gallerySpacingSize * 2,
            paddingBottom: gallerySpacingSize,
          }}
        >
          <div style={{ direction: "ltr" }} className="flex flex-col gap-2 ">
            <MirrorContext.Provider value={isMirror}>
              {sortedBoardSections.map((boardSection) => {
                console.log("regenerating board sections");
                const section = boardSection.section;
                const sectionId = section.section_id;
                const columns = sectionColumns[sectionId];
                const isLinked = isLinkedSection(boardSection);

                const canBoardEdit = canEditBoard();
                const canSectionEdit = canEditSection(section);
                const canEdit = canBoardEdit && canSectionEdit;

                return (
                  <div
                    key={sectionId}
                    ref={assignSectionRef(sectionId)}
                    className={`relative  ${
                      canBoardEdit && !canSectionEdit
                        ? "bg-primary/15 rounded-lg"
                        : ""
                    } `}
                    onDragOver={() => {
                      if (isDraggingExtFile) {
                        const next = {
                          section,
                          mirror: mirrorKey as CanvasScope,
                        };

                        // Prevent setting the same object repeatedly
                        const current = extFileOverSection;
                        const isSame =
                          current?.section.section_id ===
                            next.section.section_id &&
                          current?.mirror === next.mirror;

                        if (!isSame) {
                          setExtFileOverSection(next);
                        }
                      }
                    }}
                  >
                    {canBoardEdit && (
                      <DroppableGallerySection
                        canEdit={canEdit}
                        sectionId={section.section_id}
                        isLinked={isLinked}
                        isMirror={isMirror}
                        isExternalDrag={
                          isDraggingExtFile &&
                          extFileOverSection?.section.section_id ===
                            section.section_id &&
                          extFileOverSection.mirror === mirrorKey
                        }
                      />
                    )}
                    <SectionHeader section={section} canEdit={canEdit} />
                    {columns && (
                      <SectionGallery
                        isMirror={isMirror}
                        section={section}
                        columns={columns}
                        canEdit={canEdit}
                      />
                    )}
                  </div>
                );
              })}
            </MirrorContext.Provider>
          </div>
        </div>
        <button
          onClick={() => setHelpOpen(true)}
          type="button"
          title="Help / Support"
          className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-50 p-1.5 bg-white 
               border-primary text-primary-darker rounded-full hover:border-accent
              shadow hover:bg-accent transition-all duration-200 text-sm cursor-pointer"
        >
          <FaQuestion />
        </button>
        <HelpModal open={helpOpen} setOpen={setHelpOpen} pageNum={1} />
      </div>
    </>
  );
}

export default React.memo(Canvas);
