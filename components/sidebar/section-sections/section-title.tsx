import { useSelectionStore } from "@/store/selection-store";
import { Section } from "@/types/board-types";
import React, { RefObject, useRef, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../../ui/context-menu";
import { DroppableForImages } from "@/components/drag/droppable-section";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import FillingDot from "@/components/ui/filling-dot";
import { DEFAULT_SECTION_NAME } from "@/types/constants";
import { HiDotsVertical } from "react-icons/hi";

export default function SectionRow({
  section,
  index,
  sectionRefs,
  setSectionToDelete,
  setEditingSectionId,
}: {
  section: Section;
  index: number;
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

  const titleExists = section.title && section.title.trim() != "";
  const selected = selectedSection?.section_id === section.section_id;
  const highlighted = highlightedSection === section.section_id;
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <DroppableForImages
      key={section.section_id}
      id={`section-${index}`}
      highlighted={highlighted}
    >
      <ContextMenu
        onOpenChange={(isOpen) => {
          setHighlightedSection(isOpen ? section.section_id : null);

          // wait for context menu to close first
          if (!isOpen && pendingDelete) {
            setPendingDelete(false);
            setSectionToDelete(section);
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
                const sectionEl = sectionRefs.current?.[section.section_id];
                setSelectedSection(section);
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
                {titleExists ? section.title : DEFAULT_SECTION_NAME}
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
              setEditingSectionId(section.section_id);
            }}
          >
            Rename Section
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            onClick={() => {
              setPendingDelete(true);
            }}
            className="text-red-500"
          >
            Delete Section
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </DroppableForImages>
  );
}
