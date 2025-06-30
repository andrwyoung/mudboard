import { useMetadataStore } from "@/store/metadata-store";
import { getHasLicense } from "./user-has-license";
import { getUserBoardsWithStats } from "../db-actions/explore/get-user-board-with-stats";
import { MAX_FREE_TIER_BOARDS } from "@/types/constants";
import { toast } from "sonner";
import { startCheckout } from "../stripe/start-checkout";
import { supabase } from "../supabase/supabase-client";

export async function currentUserCanCreateBoardsFromDB(): Promise<boolean> {
  const user = useMetadataStore.getState().user;
  if (!user) return true; // allow any people not logged in to make boards

  const { data: profile, error } = await supabase
    .from("users")
    .select("tier")
    .eq("user_id", user.id)
    .single();
  if (error) {
    console.error("Failed to fetch profile:", error);
    return false;
  }

  if (getHasLicense(profile.tier)) return true;

  const boardCount = await getUserBoardsWithStats(user.id);
  const canCreate = boardCount.length < MAX_FREE_TIER_BOARDS;
  if (!canCreate) {
    toast.error("You’ve reached your limit of 3 boards.", {
      action: {
        label: "Upgrade",
        onClick: () => {
          const user = useMetadataStore.getState().user;
          if (user?.id) {
            startCheckout(user.id, "license");
          } else {
            window.location.href = "/login";
          }
        },
      },
    });
  }

  return canCreate;
}
