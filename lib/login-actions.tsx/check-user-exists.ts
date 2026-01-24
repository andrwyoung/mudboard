// UNUSED for now
// does the user exist?

import { supabase } from "@/lib/supabase/supabase-client";

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
