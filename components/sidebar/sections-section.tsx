import { useMetadataStore } from "@/store/metadata-store";
import React, { RefObject } from "react";
import { DroppableSection } from "../drag/droppable-section";
import FillingDot from "../ui/filling-dot";
import { DEFAULT_SECTION_NAME } from "@/types/constants";
import { FaPlus } from "react-icons/fa";
import { addNewSection } from "@/lib/sync/section-actions";
import { useLoadingStore } from "@/store/loading-store";

export default function SectionsSection({
  sectionRefs,
}: {
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
}) {
  const board = useMetadataStore((s) => s.board);
  const sections = useMetadataStore((s) => s.sections);

  const setEditingSectionId = useLoadingStore((s) => s.setEditingSectionId);

  return (
    <div className="flex flex-col gap-1 items-start">
      <h1 className="text-2xl font-semibold">Sections:</h1>
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
                  className=" select-none flex gap-3 items-center group cursor-pointer w-full"
                  onClick={() => {
                    const sectionEl = sectionRefs.current?.[section.section_id];
                    if (sectionEl) {
                      sectionEl.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }
                  }}
                >
                  <FillingDot />
                  <h2
                    className={`text-lg text-primary-foreground group-hover:text-accent transition-all duration-300
                    ${titleExists ? "" : "italic"}`}
                  >
                    {titleExists ? section.title : DEFAULT_SECTION_NAME}
                  </h2>
                </div>
              </DroppableSection>
            );
          })}
      </div>
      <button
        type="button"
        className="text-primary-foreground hover:underline hover:underline-offset-2 
            transition-all duration-300 cursor-pointer
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
    </div>
  );
}
