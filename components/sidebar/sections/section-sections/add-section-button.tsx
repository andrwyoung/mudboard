import { FaPlus } from "react-icons/fa";
import { useMetadataStore } from "@/store/metadata-store";
import { useLoadingStore } from "@/store/loading-store";
import { addNewSection } from "@/lib/sidebar/add-new-section";
import { RefObject, useState } from "react";
import SectionPickerDialog from "./section-picker";
import { linkSectionToBoard } from "@/lib/db-actions/cloning/link-section";
import { BoardSection } from "@/types/board-types";
import { useDemoStore } from "@/store/demo-store";

export default function AddSectionButton({
  sectionRefs,
  collapsed = false,
}: {
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
  collapsed?: boolean;
}) {
  const board = useMetadataStore((s) => s.board);
  const boardSections = useMetadataStore((s) => s.boardSections);
  const setEditingSectionId = useLoadingStore((s) => s.setEditingSectionId);
  const [open, setOpen] = useState(false);

  const handleAddSection = async (chosenSectionId: string | null) => {
    if (!board) return;

    try {
      let newSection: BoardSection | null;
      // if not ID was given, then it means we make a new section
      if (chosenSectionId === null) {
        newSection = await addNewSection({
          board_id: board.board_id,
          order_index: boardSections.length,
        });
      } else {
        // else, we link that new section here
        newSection = await linkSectionToBoard({
          destinationBoardId: board.board_id,
          sectionToLink: chosenSectionId,
          orderInBoard: boardSections.length,
        });
      }

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

      console.log("Selected Section ID:", chosenSectionId);
    } catch (error) {
      console.error("Failed to add section", error);
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Create a new section"
        title="Create a new section"
        className={`text-primary-foreground hover:underline hover:underline-offset-2 
        transition-all duration-300 cursor-pointer flex gap-1 items-center text-sm
        focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded
        
        ${collapsed ? "" : "px-4"}`}
        onClick={() => {
          useDemoStore.getState().markMissionComplete("section");
          handleAddSection(null);
        }}
      >
        <FaPlus
          className={`${collapsed ? "size-4" : "size-2"}`}
          aria-hidden="true"
        />
        {!collapsed && "Add Section"}
      </button>

      <SectionPickerDialog
        open={open}
        setOpen={setOpen}
        onAddSection={handleAddSection}
      />
    </>
  );
}
