// this is the component used to render the "table of contents" of each
// of the sections on the sidebar. also renders the "add section" button

import { useMetadataStore } from "@/store/metadata-store";
import React, { RefObject, useEffect, useRef, useState } from "react";
import { DEFAULT_BOARD_TITLE, DEFAULT_SECTION_NAME } from "@/types/constants";
import { FaPlus } from "react-icons/fa";
import { useLoadingStore } from "@/store/loading-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { BoardSection } from "@/types/board-types";
import { softDeleteBoardSection } from "@/lib/db-actions/soft-delete-board-section";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import { addNewSection } from "@/lib/sidebar/add-new-section";

import SectionRow from "./section-sections/section-title";
import { toast } from "sonner";
import { supabase } from "@/utils/supabase";

export default function SectionsSection({
  sectionRefs,
}: {
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
}) {
  const board = useMetadataStore((s) => s.board);
  const boardSections = useMetadataStore((s) => s.boardSections);
  const canEdit = canEditBoard();

  const setEditingSectionId = useLoadingStore((s) => s.setEditingSectionId);
  const [boardSectionToDelete, setBoardSectionToDelete] =
    useState<BoardSection | null>(null);

  const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false);
  const [editBoardTitle, setEditBoardTitle] = useState(board?.title ?? "");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditingBoardTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingBoardTitle]);

  const handleBoardTitleSubmit = async () => {
    if (!board || !editBoardTitle.trim()) return;

    const newTitle = editBoardTitle.trim();

    try {
      const { error } = await supabase
        .from("boards")
        .update({ title: newTitle })
        .eq("board_id", board.board_id);

      if (error) {
        toast.error("Failed to update board title");
      } else {
        useMetadataStore.getState().setBoard({
          ...board,
          title: newTitle,
        });
      }
    } catch (e) {
      toast.error("Something went wrong updating the title");
      console.error("Erorr updating board title: ", e);
    } finally {
      setIsEditingBoardTitle(false);
    }
  };

  // function handleSectionDragEnd() {}

  return (
    <div className="flex flex-col gap-1 items-start">
      <div className="px-2 text-2xl font-semibold font-header mb-1">
        {isEditingBoardTitle ? (
          <input
            ref={inputRef}
            value={editBoardTitle}
            onChange={(e) => setEditBoardTitle(e.target.value)}
            placeholder="Board Name"
            onBlur={() => setIsEditingBoardTitle(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleBoardTitleSubmit();
              if (e.key === "Escape") setIsEditingBoardTitle(false);
            }}
            className="w-full bg-transparent rounded-lg border border-accent 
            focus:outline-none focus:ring-2 focus:ring-accent/60 font-header
             px-2 py-0.5"
          />
        ) : (
          <div
            onDoubleClick={() => {
              if (canEdit) {
                setEditBoardTitle(board?.title ?? "");
                setIsEditingBoardTitle(true);
              }
            }}
            title={canEdit ? "Double-click to rename" : ""}
            className="cursor-pointer px-2 py-0.5 border border-transparent ring-2 ring-transparent
             hover:text-accent transition-all duration-300 font-header"
          >
            {board?.title ?? DEFAULT_BOARD_TITLE}
          </div>
        )}
      </div>
      <div className="w-full">
        {[...boardSections]
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)) //redundant. but ok
          .map((boardSection) => (
            <SectionRow
              key={boardSection.section.section_id}
              thisBoardSection={boardSection}
              sectionRefs={sectionRefs}
              setBoardSectionToDelete={setBoardSectionToDelete}
            />
          ))}
        {boardSectionToDelete && (
          <AlertDialog
            open={!!boardSectionToDelete}
            onOpenChange={(open) => !open && setBoardSectionToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl text-primary">
                  Delete &quot;
                  {boardSectionToDelete.section.title ?? DEFAULT_SECTION_NAME}
                  &quot;?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove the section and any blocks inside it. This
                  action cannot be undone (as of now).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-semibold">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="font-bold"
                  onClick={() => {
                    softDeleteBoardSection(boardSectionToDelete);
                    setBoardSectionToDelete(null);
                  }}
                >
                  Delete Section
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      {canEdit && (
        <button
          type="button"
          className="text-primary-foreground hover:underline hover:underline-offset-2 
            transition-all duration-300 cursor-pointer px-4
            flex gap-1 items-center text-sm"
          onClick={async () => {
            if (!board) return;

            const newSection = await addNewSection({
              board_id: board?.board_id,
              order_index: boardSections.length,
            });

            if (newSection) {
              setTimeout(() => {
                const sectionEl =
                  sectionRefs.current?.[newSection.section.section_id];
                setEditingSectionId(newSection.section.section_id);
                if (sectionEl) {
                  sectionEl.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              }, 100);
            }
          }}
        >
          <FaPlus className="size-2" />
          Add Section
        </button>
      )}
    </div>
  );
}
