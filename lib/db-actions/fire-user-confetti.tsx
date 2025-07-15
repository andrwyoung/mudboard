import { useMetadataStore } from "@/store/metadata-store";
import { fireConfetti } from "@/utils/fire-confetti";
import { supabase } from "../supabase/supabase-client";

export async function fireUserConfetti() {
  const profile = useMetadataStore.getState().profile;
  if (!profile || profile.has_fired_confetti) return;

  fireConfetti();

  const { error } = await supabase
    .from("users")
    .update({ has_fired_confetti: true })
    .eq("user_id", profile.user_id);

  if (error) {
    console.error("Failed to fire confetti:", error.message);
    return;
  }

  useMetadataStore.setState({
    profile: { ...profile, has_fired_confetti: true },
  }); // this is fine use of setState
}
