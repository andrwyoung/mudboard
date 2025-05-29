import { supabase } from "@/utils/supabase";

export default async function checkUserExists() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // Then check your app DB for user.id:
  const { data: existingProfile } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return !existingProfile;
}
