"use client";

import { SectionSelectButton } from "@/components/sidebar/section-sections/section-picker-groupings";
import { useExploreStore } from "@/store/explore-store";
import { useMetadataStore } from "@/store/metadata-store";
import { useMemo } from "react";
import { fetchSupabaseBlocks } from "@/lib/db-actions/fetch-db-blocks";
import { generateInitColumnsFromBlocks } from "@/lib/columns/generate-init-columns";
import { Section } from "@/types/board-types";
import SectionGallery from "@/app/b/[boardId]/gallery";
import SectionHeader from "../section/section-header";

export default function ExplorePanel() {
  const userMudkits = useExploreStore((s) => s.userMudkits);
  const otherMudkits = useExploreStore((s) => s.otherMudkits);

  const boardSections = useMetadataStore((s) => s.boardSections ?? []);

  const selectedSection = useExploreStore((s) => s.selectedSection);
  const setSelectedSection = useExploreStore((s) => s.setSelectedSection);
  const exploreSectionColumns = useExploreStore((s) => s.sectionColumns);
  const setExploreSectionColumns = useExploreStore((s) => s.setSectionColumns);

  const filteredMudkits = useMemo(() => {
    const usedSectionIds = new Set(boardSections.map((bs) => bs.section_id));
    return userMudkits.filter((kit) => !usedSectionIds.has(kit.section_id));
  }, [userMudkits, boardSections]);

  const handleFetchMudkit = async (section: Section) => {
    const blocks = await fetchSupabaseBlocks([section.section_id]);
    const sectionColumns = generateInitColumnsFromBlocks(
      blocks[section.section_id],
      section.saved_column_num
    );

    section.visualColumnNum = section.saved_column_num;

    setSelectedSection(section);
    setExploreSectionColumns(sectionColumns);
  };

  return (
    <div className="h-full overflow-y-auto py-4 px-4 bg-primary flex flex-col gap-8">
      {/* --- PUBLIC MUDKITS --- */}
      <div>
        <h3 className="text-white text-md font-bold mb-2">My Mudkits</h3>
        <div className="p-1 bg-muted rounded-lg">
          {filteredMudkits.map((section) => (
            <SectionSelectButton
              key={section.section_id}
              section={section}
              onClick={() => handleFetchMudkit(section)}
              isGrouped={false}
              isSelected={false}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-white text-md font-bold mb-2">Community Mudkits</h3>
        <div className="p-1 bg-muted rounded-lg">
          {otherMudkits.map((section) => (
            <SectionSelectButton
              key={section.section_id}
              section={section}
              onClick={() => handleFetchMudkit(section)}
              isGrouped={false}
              isSelected={false}
            />
          ))}
        </div>
      </div>

      {selectedSection && (
        <div className="flex flex-col gap-2">
          <SectionHeader
            section={selectedSection}
            canEdit={false}
            mode="mirror"
          />

          <SectionGallery
            section={selectedSection}
            columns={exploreSectionColumns}
            draggedBlocks={null}
            scrollY={0}
            selectedBlocks={{}}
            overId={null}
            canEdit={false}
          />
        </div>
      )}
    </div>
  );
}
