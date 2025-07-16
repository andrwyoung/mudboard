import { useMetadataStore } from "@/store/metadata-store";
import React, { RefObject, useState } from "react";
import { DeleteBoardSectionModal } from "../sections/section-sections/delete-section-modal";
import { BoardSection } from "@/types/board-types";
import SectionRow from "../sections/section-sections/section-row";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import AddSectionButton from "../sections/section-sections/add-section-button";

export default function CollapsedSectionSections({
  sectionRefs,
}: {
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
}) {
  const boardSections = useMetadataStore((s) => s.boardSections);

  const [boardSectionToDelete, setBoardSectionToDelete] =
    useState<BoardSection | null>(null);

  const canBoardEdit = canEditBoard();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-col gap-1 items-center">
        {[...boardSections]
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)) //redundant. but ok
          .map((boardSection) => (
            <SectionRow
              canBoardEdit={canBoardEdit}
              key={boardSection.section.section_id}
              thisBoardSection={boardSection}
              sectionRefs={sectionRefs}
              setBoardSectionToDelete={setBoardSectionToDelete}
              collapsed
            />
          ))}
      </div>
      {canBoardEdit && <AddSectionButton sectionRefs={sectionRefs} collapsed />}
      {boardSectionToDelete && (
        <DeleteBoardSectionModal
          boardSection={boardSectionToDelete}
          onClose={() => setBoardSectionToDelete(null)}
        />
      )}
    </div>
  );
}
