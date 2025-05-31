// this is the component used to render the "table of contents" of each
// of the sections on the sidebar. also renders the "add section" button

import { useMetadataStore } from "@/store/metadata-store";
import React, { RefObject, useState } from "react";
import { DroppableSection } from "../drag/droppable-section";
import FillingDot from "../ui/filling-dot";
import { DEFAULT_SECTION_NAME } from "@/types/constants";
import { FaPlus, FaTrash } from "react-icons/fa";
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
import { Section } from "@/types/board-types";
import { useSelectionStore } from "@/store/selection-store";
import { softDeleteSection } from "@/lib/db-actions/soft-delete-section";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import { addNewSection } from "@/lib/sidebar/add-new-section";

export default function SectionsSection({
  sectionRefs,
}: {
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
}) {
  const board = useMetadataStore((s) => s.board);
  const sections = useMetadataStore((s) => s.sections);
  const canEdit = canEditBoard();

  const setEditingSectionId = useLoadingStore((s) => s.setEditingSectionId);
  const selectedSection = useSelectionStore((s) => s.selectedSection);
  const setSelectedSection = useSelectionStore((s) => s.setSelectedSection);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);

  return (
    <div className="flex flex-col gap-1 items-start">
      <h1 className="text-2xl font-semibold px-4">Sections:</h1>
      <div className="w-full">
        {[...sections]
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
          .map((section, index) => {
            const titleExists = section.title && section.title.trim() != "";

            return (
              <DroppableSection
                id={`section-${index}`}
                key={section.section_id}
              >
                <div
                  className="grid group items-center w-full"
                  style={{ gridTemplateColumns: "1fr auto" }}
                >
                  <div
                    className=" select-none flex gap-2 items-center cursor-pointer py-[1px] min-w-0"
                    onClick={() => {
                      const sectionEl =
                        sectionRefs.current?.[section.section_id];
                      setSelectedSection(section);
                      if (sectionEl) {
                        sectionEl.scrollIntoView({
                          behavior: "smooth",
                          block: "start",
                        });
                      }
                    }}
                  >
                    <FillingDot
                      selected={
                        selectedSection?.section_id === section.section_id
                      }
                    />
                    <h2
                      className={`text-lg text-primary-foreground group-hover:text-accent transition-all duration-300 
                         truncate whitespace-nowrap overflow-hidden min-w-0
                    ${titleExists ? "" : "italic"}`}
                    >
                      {titleExists ? section.title : DEFAULT_SECTION_NAME}
                    </h2>
                  </div>

                  {sections.length > 1 && canEdit && (
                    <FaTrash
                      className="size-3.5 hover:rotate-24 text-accent transition-all duration-300 
                  opacity-0 group-hover:opacity-100 cursor-pointer flex-none"
                      title="Delete Section"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSectionToDelete(section);
                      }}
                    />
                  )}
                </div>
              </DroppableSection>
            );
          })}
        {sectionToDelete && (
          <AlertDialog
            open={!!sectionToDelete}
            onOpenChange={(open) => !open && setSectionToDelete(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-2xl text-primary">
                  Delete &quot;
                  {sectionToDelete.title ?? DEFAULT_SECTION_NAME}
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
                    softDeleteSection(sectionToDelete);
                    setSectionToDelete(null);
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
              order_index: sections.length,
            });

            if (newSection) {
              setTimeout(() => {
                const sectionEl = sectionRefs.current?.[newSection.section_id];
                setEditingSectionId(newSection.section_id);
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
