import { useLayoutStore } from "@/store/layout-store";
import { Section } from "@/types/board-types";

export function getMismatchedColumnData(sections: Section[]) {
  const visualMap = useLayoutStore.getState().visualNumColsMap;

  return sections.map((section) => {
    const sectionId = section.section_id;
    const sectionTitle = section.title;
    const visualColumnNum = visualMap[sectionId];
    const savedColumnNum = section.saved_column_num;

    return {
      sectionId,
      sectionTitle,
      savedColumnNum,
      visualColumnNum,
      isMismatch: visualColumnNum !== savedColumnNum,
    };
  });
}
