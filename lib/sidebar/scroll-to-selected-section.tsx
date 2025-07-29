import { sectionRefs } from "@/store/metadata-store";
import { useSelectionStore } from "@/store/selection-store";

export function scrollToSelectedSection() {
  // then scroll there
  const selectedSectionId =
    useSelectionStore.getState().selectedSection?.section.section_id;

  if (selectedSectionId) {
    sectionRefs.current?.[selectedSectionId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}
