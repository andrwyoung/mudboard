import { useLayoutStore } from "@/store/layout-store";
import { Section } from "@/types/board-types";
import { MOBILE_COLUMN_NUMBER } from "@/types/constants";

export function shouldSyncSectionLayout(
  section: Section,
  forceMobileColumns: boolean
) {
  const visualNumCols = useLayoutStore
    .getState()
    .getVisualNumColsForSection(section.section_id);

  console.log("visualNumCols:", visualNumCols);
  console.log("saved_column_num:", section.saved_column_num);

  if (forceMobileColumns) {
    return (
      section.saved_column_num === MOBILE_COLUMN_NUMBER &&
      visualNumCols === MOBILE_COLUMN_NUMBER
    );
  }

  return section && visualNumCols === section.saved_column_num;
}
