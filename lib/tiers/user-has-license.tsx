import { useMetadataStore } from "@/store/metadata-store";
import { UserTier } from "@/types/stripe-settings";

export function getHasLicense(tier: UserTier | undefined): boolean {
  return tier === "beta";
}

export function currentLocalUserHasLicense(): boolean {
  const profile = useMetadataStore.getState().profile;
  return getHasLicense(profile?.tier);
}
