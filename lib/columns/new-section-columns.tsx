// if a section is blank, we want to still initialize it with an empty array

import { useLayoutStore } from "@/store/layout-store";
import { Section } from "@/types/board-types";

export function initializeSectionColumns(section: Section) {
  useLayoutStore.setState((s) => ({
    sectionColumns: {
      ...s.sectionColumns,
      [section.section_id]: Array.from(
        { length: section.saved_column_num },
        () => []
      ),
    },
  }));
}
