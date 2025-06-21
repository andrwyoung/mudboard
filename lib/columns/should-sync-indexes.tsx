import { MOBILE_COLUMN_NUMBER } from "@/types/constants";

export function shouldSyncSectionLayout(
  section: {
    saved_column_num: number;
    visualColumnNum?: number;
  },
  forceMobileColumns: boolean
) {
  if (forceMobileColumns) {
    return (
      section.saved_column_num === MOBILE_COLUMN_NUMBER &&
      section.visualColumnNum === MOBILE_COLUMN_NUMBER
    );
  }

  return section && section.visualColumnNum === section.saved_column_num;
}
