import { FaPlus } from "react-icons/fa";
import { useMetadataStore } from "@/store/metadata-store";
import { useLoadingStore } from "@/store/loading-store";
import { addNewSection } from "@/lib/sidebar/add-new-section";
import { RefObject, useState } from "react";
import SectionPickerDialog from "./section-picker";
import { linkSectionToBoard } from "@/lib/db-actions/cloning/link-section";

export default function AddSectionButton({
  sectionRefs,
}: {
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
}) {
  const board = useMetadataStore((s) => s.board);
  const boardSections = useMetadataStore((s) => s.boardSections);
  const setEditingSectionId = useLoadingStore((s) => s.setEditingSectionId);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="text-primary-foreground hover:underline hover:underline-offset-2 
        transition-all duration-300 cursor-pointer px-4
        flex gap-1 items-center text-sm"
        onClick={() => setOpen(true)}
      >
        <FaPlus className="size-2" />
        Add Section
      </button>

      <SectionPickerDialog
        open={open}
        setOpen={setOpen}
        onAddSection={async (id) => {
          // Handle selection here, e.g. scroll to section or insert content

          if (!board) return;
          let newSection;

          // if not ID was given, then it means we make a new section
          if (id === null) {
            newSection = await addNewSection({
              board_id: board.board_id,
              order_index: boardSections.length,
            });
          } else {
            newSection = await linkSectionToBoard({
              board_id: board.board_id,
              section_id: id,
              order_index: boardSections.length,
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

          console.log("Selected Section ID:", id);
        }}
      />
    </>
  );
}
