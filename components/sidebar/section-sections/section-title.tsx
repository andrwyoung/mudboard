import { useSelectionStore } from "@/store/selection-store";
import { Section } from "@/types/board-types";
import React, { RefObject, useRef, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "../../ui/context-menu";
import { DroppableForImages } from "@/components/drag/droppable-section";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import FillingDot from "@/components/ui/filling-dot";
import { DEFAULT_SECTION_NAME } from "@/types/constants";
import { HiDotsVertical } from "react-icons/hi";
import { useMetadataStore } from "@/store/metadata-store";
import { swapSectionOrder } from "@/lib/db-actions/swap-section-order";
import { createTextBlock } from "@/lib/db-actions/sync-text/text-block-actions";
import { useImagePicker } from "@/hooks/use-image-picker";

export default function SectionRow({
  thisSection,
  thisIndex,
  sectionRefs,
  setSectionToDelete,
  setEditingSectionId,
}: {
  thisSection: Section;
  thisIndex: number;
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
  setSectionToDelete: (section: Section) => void;
  setEditingSectionId: (id: string) => void;
}) {
  const [highlightedSection, setHighlightedSection] = useState<string | null>(
    null
  );
  const [pendingDelete, setPendingDelete] = useState(false);
  const canEdit = canEditBoard();

  const selectedSection = useSelectionStore((s) => s.selectedSection);
  const setSelectedSection = useSelectionStore((s) => s.setSelectedSection);
  const allSections = useMetadataStore((s) => s.sections);

  const { triggerImagePicker, fileInput } = useImagePicker(
    thisSection.section_id
  );

  const titleExists = thisSection.title && thisSection.title.trim() != "";
  const selected = selectedSection?.section_id === thisSection.section_id;
  const highlighted = highlightedSection === thisSection.section_id;
  const triggerRef = useRef<HTMLDivElement>(null);

  function handleMoveSection(direction: "up" | "down") {
    const offset = direction === "up" ? -1 : 1;
    const target = Object.values(allSections).find(
      (s) => s.order_index === thisSection.order_index + offset
    );
    if (!target) return;

    swapSectionOrder(thisSection, target).then((success) => {
      if (success) {
        const el = sectionRefs.current?.[thisSection.section_id];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  }

  return (
    <>
      {fileInput}

      <DroppableForImages
        key={thisSection.section_id}
        id={`section-${thisIndex}`}
        highlighted={highlighted}
        sectionId={thisSection.section_id}
      >
        <ContextMenu
          onOpenChange={(isOpen) => {
            setHighlightedSection(isOpen ? thisSection.section_id : null);

            // this is here to wait for context menu to close first
            if (!isOpen && pendingDelete) {
              setPendingDelete(false);
              setSectionToDelete(thisSection);
            }
          }}
        >
          <ContextMenuTrigger asChild>
            <div
              ref={triggerRef}
              className="grid group items-center w-full"
              style={{ gridTemplateColumns: "1fr auto" }}
            >
              <div
                className=" select-none flex gap-2 items-center cursor-pointer py-[1px] min-w-0"
                onClick={() => {
                  const sectionEl =
                    sectionRefs.current?.[thisSection.section_id];
                  setSelectedSection(thisSection);
                  if (sectionEl) {
                    sectionEl.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
              >
                <FillingDot selected={selected} />
                <h2
                  className={`text-lg group-hover:text-accent transition-all duration-300 
                     truncate whitespace-nowrap overflow-hidden min-w-0
                  ${titleExists ? "" : "italic"} `}
                >
                  {titleExists ? thisSection.title : DEFAULT_SECTION_NAME}
                </h2>
              </div>

              {canEdit && (
                <HiDotsVertical
                  className={`size-4 hover:scale-130 text-accent transition-all duration-300 
                    opacity-0 group-hover:opacity-100 cursor-pointer flex-none ${
                      selected ? "" : ""
                    }`}
                  title="Open Context Menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    const el = triggerRef.current;
                    if (!el) return;
                    const event = new MouseEvent("contextmenu", {
                      bubbles: true,
                      cancelable: true,
                      view: window,
                      clientX: e.clientX,
                      clientY: e.clientY,
                    });
                    el.dispatchEvent(event);
                  }}
                />
              )}

              {/* {sections.length > 1 && canEdit && (
            <FaTrash
              className="size-3.5 hover:rotate-24 text-accent transition-all duration-300 
                    opacity-0 group-hover:opacity-100 cursor-pointer flex-none"
              title="Delete Section"
              onClick={(e) => {
                e.stopPropagation();
                setSectionToDelete(section);
              }}
            />
          )} */}
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="">
            <ContextMenuItem
              onClick={() => {
                setEditingSectionId(thisSection.section_id);
              }}
            >
              Rename
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>Add Block</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                <ContextMenuItem onClick={() => triggerImagePicker()}>
                  Image
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => createTextBlock(thisSection.section_id)}
                >
                  Text
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem
              disabled={thisIndex === 0}
              onClick={() => handleMoveSection("up")}
            >
              Move Up
            </ContextMenuItem>
            <ContextMenuItem
              disabled={thisIndex === allSections.length - 1}
              onClick={() => handleMoveSection("down")}
            >
              Move Down
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => {
                setPendingDelete(true);
              }}
              variant="destructive"
            >
              Delete Section
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </DroppableForImages>
    </>
  );
}
