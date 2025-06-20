import { useLayoutStore } from "@/store/layout-store";
import { useMetadataStore } from "@/store/metadata-store";

export function setVisualColumnNum(sectionId: string, newNum: number) {
  useMetadataStore.setState((s) => ({
    boardSections: s.boardSections.map((bs) =>
      bs.section.section_id === sectionId
        ? {
            ...bs,
            section: { ...bs.section, visualColumnNum: newNum },
          }
        : bs
    ),
  }));

  useLayoutStore.getState().regenerateSectionColumns(sectionId);
}
