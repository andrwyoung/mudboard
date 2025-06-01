// this is the component used to render the "table of contents" of each
// of the sections on the sidebar. also renders the "add section" button

import { useMetadataStore } from "@/store/metadata-store";
import React, { RefObject, useState } from "react";
import { DEFAULT_SECTION_NAME } from "@/types/constants";
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
import { Section } from "@/types/board-types";
import { softDeleteSection } from "@/lib/db-actions/soft-delete-section";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import { addNewSection } from "@/lib/sidebar/add-new-section";

import SectionRow from "./section-sections/section-title";

export default function SectionsSection({
  sectionRefs,
}: {
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
}) {
  const board = useMetadataStore((s) => s.board);
  const sections = useMetadataStore((s) => s.sections);
  const canEdit = canEditBoard();

  const setEditingSectionId = useLoadingStore((s) => s.setEditingSectionId);
  const [sectionToDelete, setSectionToDelete] = useState<Section | null>(null);

  // function handleSectionDragEnd() {}

  return (
    <div className="flex flex-col gap-1 items-start">
      <h1 className="text-2xl font-semibold px-6">Sections:</h1>
      <div className="w-full">
        {[...sections]
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
          .map((section, index) => (
            <SectionRow
              key={section.section_id}
              section={section}
              index={index}
              sectionRefs={sectionRefs}
              setEditingSectionId={setEditingSectionId}
              setSectionToDelete={setSectionToDelete}
            />
          ))}
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
