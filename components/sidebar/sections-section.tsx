import { useMetadataStore } from "@/store/metadata-store";
import React, { RefObject } from "react";
import { DroppableSection } from "../drag/droppable-section";
import FillingDot from "../ui/filling-dot";
import { DEFAULT_SECTION_NAME } from "@/types/constants";
import { FaPlus } from "react-icons/fa";
import { createSupabaseSection } from "@/lib/db-actions/create-new-section";

export default function SectionsSection({
  sectionRefs,
}: {
  sectionRefs: RefObject<Record<string, HTMLDivElement | null>>;
}) {
  const board = useMetadataStore((s) => s.board);
  const setSections = useMetadataStore((s) => s.setSections);
  const sections = useMetadataStore((s) => s.sections);

  return (
    <div className="flex flex-col gap-1 items-start">
      <h1 className="text-xl font-semibold">Sections:</h1>
      {sections.map((section, index) => {
        const titleExists = section.title && section.title.trim() != "";

        return (
          <DroppableSection id={`section-${index}`} key={section.section_id}>
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
      <button
        type="button"
        className="text-primary-foreground hover:underline hover:underline-offset-2 
            transition-all duration-300 cursor-pointer
            flex gap-1 items-center mt-2"
        onClick={async () => {
          if (!board) return;
          const newSection = await createSupabaseSection({
            board_id: board?.board_id,
          });

          setSections([...sections, newSection]);
        }}
      >
        <FaPlus className="size-3.5" />
        Add Section
      </button>
    </div>
  );
}
