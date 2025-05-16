import { useMetadataStore } from "@/store/metadata-store";

export async function hasWriteAccess(): Promise<boolean> {
  const accessLevel = await useMetadataStore.getState().getAndSyncAccessLevel();
  return accessLevel === "CLAIMED_LOGGED_IN" || accessLevel === "UNCLAIMED";
}
