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
import { useSecondaryLayoutStore } from "@/store/secondary-layout-store";
import OverlayGallery from "@/app/b/[boardId]/overlay-gallery";
import { useOverlayStore } from "@/store/overlay-store";

export default function ExplorePanel() {
  const allMudkits = useExploreStore((s) => s.allMudkits);

  const boardSections = useMetadataStore((s) => s.boardSections ?? []);
  const overlaySelectedBlock = useOverlayStore("mirror").overlayBlock;

  const {
    selectedSection,
    setSelectedSection,
    columns: secondaryColumns,
    setColumns: setSecondaryColumns,
    setVisualColumnNum,
    regenerateOrder,
  } = useSecondaryLayoutStore();

  const userId = useMetadataStore((s) => s.user?.id);
  const { userMudkits, otherMudkits } = useMemo(() => {
    const usedSectionIds = new Set(boardSections.map((bs) => bs.section_id));

    const filtered = allMudkits.filter(
      (kit) => !usedSectionIds.has(kit.section_id)
    );

    const userMudkits = filtered.filter((kit) => kit.owned_by === userId);
    const otherMudkits = filtered.filter((kit) => kit.owned_by !== userId);

    return { userMudkits, otherMudkits };
  }, [allMudkits, boardSections, userId]);

  const handleFetchMudkit = async (section: Section) => {
    const blocks = await fetchSupabaseBlocks([section.section_id]);
    const sectionColumns = generateInitColumnsFromBlocks(
      blocks[section.section_id],
      section.saved_column_num
    );

    setVisualColumnNum(section.saved_column_num);

    setSelectedSection(section);
    setSecondaryColumns(sectionColumns);

    regenerateOrder();
  };

  return (
    <div className="h-full overflow-y-auto py-4 px-4 bg-primary flex flex-col gap-8">
      {overlaySelectedBlock && (
        <OverlayGallery isMirror={true} selectedBlock={overlaySelectedBlock} />
      )}

      {/* --- PUBLIC MUDKITS --- */}
      <div>
        <h3 className="text-white text-md font-bold mb-2">My Mudkits</h3>
        <div className="p-1 bg-muted rounded-lg">
          {userMudkits.map((section) => (
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
            scope="mirror"
          />

          <SectionGallery
            isMirror={true}
            section={selectedSection}
            columns={secondaryColumns}
            canEdit={false}
          />
        </div>
      )}
    </div>
  );
}
