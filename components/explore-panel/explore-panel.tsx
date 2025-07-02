"use client";

import { useExploreStore } from "@/store/explore-store";
import { fetchSupabaseBlocks } from "@/lib/db-actions/fetch-db-blocks";
import { generateInitColumnsFromBlocks } from "@/lib/columns/generate-init-columns";
import { useSecondaryLayoutStore } from "@/store/secondary-layout-store";
import SearchMode from "./modes/search-mode";
import ExploreSingleMudkitMode from "./modes/single-mudkit-mode";
import { SCROLLBAR_STYLE_WHITE } from "@/types/constants";
import { useExploreHistory } from "@/hooks/explore/use-explore-history";
import ClosePanelButton from "../pinned-panel/close-panel-button";
import { SectionWithStats } from "@/types/stat-types";

export default function ExplorePanel() {
  const exploreMode = useExploreStore((s) => s.exploreMode);
  const setExploreMode = useExploreStore((s) => s.setExploreMode);

  const {
    selectedSection,
    setSelectedSection,
    columns: secondaryColumns,
    setColumns: setSecondaryColumns,
    setVisualColumnNum,
    regenerateOrder,
  } = useSecondaryLayoutStore();

  const handleFetchMudkit = async (section: SectionWithStats) => {
    const blocks = await fetchSupabaseBlocks([section.section_id]);
    const sectionColumns = generateInitColumnsFromBlocks(
      blocks[section.section_id],
      section.saved_column_num
    );

    setVisualColumnNum(section.saved_column_num);
    setSelectedSection(section);
    setSecondaryColumns(sectionColumns);
    regenerateOrder();

    window.history.pushState({ mudkitFocus: true }, "", "");
    setExploreMode("focus");
  };

  // DISABLED: back button.
  useExploreHistory({ selectedSection });

  return (
    <div
      className={`h-full overflow-y-auto py-4 px-4 bg-primary
    ${SCROLLBAR_STYLE_WHITE}`}
    >
      <ClosePanelButton />
      {exploreMode === "search" && (
        <SearchMode handleFetchMudkit={handleFetchMudkit} />
      )}

      {exploreMode === "focus" && selectedSection && (
        <ExploreSingleMudkitMode
          selectedSection={selectedSection}
          columns={secondaryColumns}
          backButton={() => setExploreMode("search")}
        />
      )}
    </div>
  );
}
