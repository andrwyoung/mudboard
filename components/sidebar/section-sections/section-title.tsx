// you know in the sidebar, there's a list of sections you can click?
// this component is one of those rows

// sorry. component naming

import { useSelectionStore } from "@/store/selection-store";
import { BoardSection } from "@/types/board-types";
import React, { RefObject, useEffect, useRef, useState } from "react";
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
import { updateSectionTitle } from "@/lib/db-actions/sync-text/update-section-text";
import { isLinkedSection } from "@/utils/is-linked-section";

export default function SectionRow({
  thisBoardSection,
  sectionRefs,
  setBoardSectionToDelete,
}: {
  thisBoardSection: BoardSection;
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
  setBoardSectionToDelete: (section: BoardSection) => void;
}) {
  const [highlightedSection, setHighlightedSection] = useState<string | null>(
    null
  );
  const [pendingDelete, setPendingDelete] = useState(false);
  const canEdit = canEditBoard();
  const isLinked = isLinkedSection(thisBoardSection);

  const selectedSection = useSelectionStore((s) => s.selectedSection);
  const setSelectedSection = useSelectionStore((s) => s.setSelectedSection);
  const allBoardSections = useMetadataStore((s) => s.boardSections);

  const { triggerImagePicker, fileInput } = useImagePicker(
    thisBoardSection.section.section_id
  );

  const titleExists =
    thisBoardSection.section.title &&
    thisBoardSection.section.title.trim() != "";
  const selected =
    selectedSection?.section.section_id === thisBoardSection.section.section_id;
  const highlighted =
    highlightedSection === thisBoardSection.section.section_id;
  const triggerRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(
    thisBoardSection.section.title ?? ""
  );
  const inputRef = useRef<HTMLInputElement>(null);

  function handleMoveSection(direction: "up" | "down") {
    const offset = direction === "up" ? -1 : 1;
    const target = Object.values(allBoardSections).find(
      (s) => s.order_index === thisBoardSection.order_index + offset
    );
    if (!target) {
      console.error("Could not find target to delete");
      return;
    }
    console.log("swapping, ", target, "with, ", thisBoardSection);

    swapSectionOrder(thisBoardSection, target).then((success) => {
      if (success) {
        const el = sectionRefs.current?.[thisBoardSection.section.section_id];
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleRenameSubmit() {
    if (editValue.trim() === "") {
      setIsEditing(false);
      return;
    }

    updateSectionTitle(thisBoardSection.section.section_id, editValue);
    setIsEditing(false);
  }

  return (
    <>
      {fileInput}

      <DroppableForImages
        key={thisBoardSection.section.section_id}
        id={`section-${thisBoardSection.order_index}`}
        highlighted={highlighted}
        isLinked={isLinked}
        sectionId={thisBoardSection.section.section_id}
      >
        <ContextMenu
          onOpenChange={(isOpen) => {
            setHighlightedSection(
              isOpen ? thisBoardSection.section.section_id : null
            );

            // this is here to wait for context menu to close first
            if (!isOpen && pendingDelete) {
              setPendingDelete(false);
              setBoardSectionToDelete(thisBoardSection);
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
                onDoubleClick={() => {
                  if (canEdit) {
                    setEditValue(thisBoardSection.section.title ?? "");
                    setIsEditing(true);
                  }
                }}
                onClick={() => {
                  console.log("Clicked Board Section! ", thisBoardSection);
                  const sectionEl =
                    sectionRefs.current?.[thisBoardSection.section.section_id];
                  setSelectedSection(thisBoardSection);
                  if (sectionEl) {
                    sectionEl.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
              >
                <FillingDot selected={selected} secondary={isLinked} />
                {isEditing ? (
                  <input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => setIsEditing(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit();
                      if (e.key === "Escape") setIsEditing(false);
                    }}
                    className={`text-lg bg-transparent border 
                      ${
                        isLinked
                          ? "border-secondary focus:ring-secondary/80"
                          : "border-accent focus:ring-accent/80"
                      } 
                      focus:outline-none focus:ring-2 font-header rounded w-full`}
                  />
                ) : (
                  <h2
                    className={`text-lg  transition-all duration-300 
                    truncate whitespace-nowrap overflow-hidden min-w-0
                    ${
                      isLinked
                        ? "group-hover:text-secondary"
                        : "group-hover:text-accent"
                    }
                    ${titleExists ? "" : "italic"} `}
                  >
                    {titleExists
                      ? thisBoardSection.section.title
                      : DEFAULT_SECTION_NAME}
                  </h2>
                )}
              </div>

              {canEdit && (
                <HiDotsVertical
                  className={`size-4 hover:scale-130 transition-all duration-300 
                    opacity-0 group-hover:opacity-100 cursor-pointer flex-none 
                    ${isLinked ? "text-secondary" : "text-accent"}
                    ${selected ? "" : ""}`}
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
                setEditValue(thisBoardSection.section.title ?? "");
                console.log("hey");
                setTimeout(() => {
                  setIsEditing(true);
                }, 100);
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
                  onClick={() =>
                    createTextBlock(thisBoardSection.section.section_id)
                  }
                >
                  Text
                </ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuItem
              disabled={thisBoardSection.order_index === 0}
              onClick={() => handleMoveSection("up")}
            >
              Move Up
            </ContextMenuItem>
            <ContextMenuItem
              disabled={
                thisBoardSection.order_index === allBoardSections.length - 1
              }
              onClick={() => handleMoveSection("down")}
            >
              Move Down
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => {
                setPendingDelete(true);
              }}
              variant={"destructive"}
            >
              {isLinked ? "Unlink Section" : "Delete Section"}
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </DroppableForImages>
    </>
  );
}
