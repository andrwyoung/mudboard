import { useMetadataStore } from "@/store/metadata-store";
import { Section } from "@/types/board-types";

export function canEditSection(section: Section): boolean {
  const { user } = useMetadataStore.getState();

  // if unclaimed section = open to editing
  if (!section.owned_by) return true;

  // else only the owner can edit
  return section.owned_by === user?.id;
}
