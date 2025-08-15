// you know in the sidebar, there's a list of sections you can click?
// this component simply renders a single row

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
} from "../../../ui/context-menu";
import { DroppableForImages } from "@/components/drag/droppable-section";
import FillingDot from "@/components/ui/filling-dot";
import { DEFAULT_SECTION_NAME } from "@/types/constants";
import { HiDotsVertical } from "react-icons/hi";
import { useMetadataStore } from "@/store/metadata-store";
import { swapSectionOrder } from "@/lib/db-actions/swap-section-order";
import { createTextBlock } from "@/lib/db-actions/sync-text/create-text-block";
import { useImagePicker } from "@/hooks/use-image-picker";
import { updateSectionTitle } from "@/lib/db-actions/sync-text/update-section-title";
import { isLinkedSection } from "@/utils/is-linked-section";
import { canEditSection } from "@/lib/auth/can-edit-section";
import { FaCircle, FaLock } from "react-icons/fa";
import { FaRegStar, FaStar } from "react-icons/fa6";
import { scrollToSection } from "@/lib/sidebar/scroll-to-selected-section";
import { toggleFavorited } from "@/lib/db-actions/explore/toggle-starred";

export default function SectionRow({
  thisBoardSection,
  sectionRefs,
  setBoardSectionToDelete,
  canBoardEdit,
  collapsed = false,
}: {
  thisBoardSection: BoardSection;
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
  setBoardSectionToDelete: (section: BoardSection) => void;
  canBoardEdit: boolean;
  collapsed?: boolean;
}) {
  const [highlightedSection, setHighlightedSection] = useState<string | null>(
    null
  );
  const [pendingDelete, setPendingDelete] = useState(false);
  const [pendingRename, setPendingRename] = useState(false);
  const canSectionEdit = canEditSection(thisBoardSection.section);
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

  function onClick() {
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

    updateSectionTitle(
      thisBoardSection.section.section_id,
      editValue,
      canSectionEdit
    );
    setIsEditing(false);
  }

  return (
    <>
      {fileInput}

      <DroppableForImages
        canEdit={canSectionEdit && canBoardEdit}
        key={thisBoardSection.section.section_id}
        id={`section-${thisBoardSection.order_index}`}
        highlighted={highlighted}
        isLinked={isLinked}
        sectionId={thisBoardSection.section.section_id}
        className={collapsed ? "" : "px-1"}
      >
        <ContextMenu
          onOpenChange={(isOpen) => {
            setHighlightedSection(
              isOpen ? thisBoardSection.section.section_id : null
            );

            // this is here to wait for context menu to close first
            if (!isOpen) {
              if (pendingDelete) {
                setPendingDelete(false);
                setBoardSectionToDelete(thisBoardSection);
              }

              if (pendingRename) {
                setPendingRename(false);
                setTimeout(() => {
                  setIsEditing(true);
                }, 250);
              }
            }
          }}
        >
          <ContextMenuTrigger asChild>
            {collapsed ? (
              <button
                type="button"
                title={`Go to "${
                  thisBoardSection.section.title ?? "Untitled Section"
                }"`}
                aria-label={`Select section: ${
                  thisBoardSection.section.title ?? "Untitled Section"
                }`}
                aria-pressed={selected}
                onClick={onClick}
                className={`p-1.5 rounded-sm hover:bg-accent/40 cursor-pointer group
                border border-transparent hover:border-accent `}
              >
                <FaCircle
                  aria-hidden="true"
                  className={`size-4 group-hover:text-accent transition-all duration-50
                    ${selected ? "text-accent" : "text-off-white"}`}
                />
              </button>
            ) : (
              <div
                title="Go to section"
                ref={triggerRef}
                className="grid group items-center w-full"
                style={{ gridTemplateColumns: "1fr auto" }}
                onContextMenu={(e) => {
                  if (!canBoardEdit) e.preventDefault();
                }}
              >
                <div
                  className=" select-none flex gap-2 items-center cursor-pointer py-[1px] min-w-0"
                  onDoubleClick={() => {
                    if (canSectionEdit) {
                      setEditValue(thisBoardSection.section.title ?? "");
                      setIsEditing(true);
                    }
                  }}
                  onClick={onClick}
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
                      className={`text-lg  
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

                {canSectionEdit ? (
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
                ) : (
                  <FaLock
                    title="Section locked from Edits"
                    className={`opacity-30 size-3 ${
                      canBoardEdit ? "" : "hidden"
                    }`}
                  />
                )}
              </div>
            )}
          </ContextMenuTrigger>

          {canBoardEdit && (
            <ContextMenuContent className="">
              {canSectionEdit && (
                <>
                  <ContextMenuItem
                    onClick={() => {
                      setEditValue(thisBoardSection.section.title ?? "");
                      setPendingRename(true);
                    }}
                  >
                    Rename
                  </ContextMenuItem>

                  <ContextMenuItem
                    onClick={() => {
                      const section = thisBoardSection.section;

                      scrollToSection(section.section_id);
                      toggleFavorited(!section.is_public, section);
                    }}
                  >
                    {!thisBoardSection.section.is_public ? (
                      <>
                        <FaStar className="w-4 h-4" />
                        <span>Star</span>
                      </>
                    ) : (
                      <>
                        <FaRegStar className="w-4 h-4" />
                        <span>Unstar</span>
                      </>
                    )}
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
                </>
              )}

              <ContextMenuSub>
                <ContextMenuSubTrigger>Move Section </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  <ContextMenuItem
                    disabled={thisBoardSection.order_index === 0}
                    onClick={() => handleMoveSection("up")}
                  >
                    Up
                  </ContextMenuItem>
                  <ContextMenuItem
                    disabled={
                      thisBoardSection.order_index ===
                      allBoardSections.length - 1
                    }
                    onClick={() => handleMoveSection("down")}
                  >
                    Down
                  </ContextMenuItem>
                </ContextMenuSubContent>
              </ContextMenuSub>

              {allBoardSections.length > 1 && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    onClick={() => {
                      setPendingDelete(true);
                    }}
                    variant={"destructive"}
                  >
                    {isLinked || !canSectionEdit
                      ? "Unlink Section"
                      : "Delete Section"}
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          )}
        </ContextMenu>
      </DroppableForImages>
    </>
  );
}
