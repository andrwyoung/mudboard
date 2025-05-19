import { User } from "@/types/board-types";
import { supabase } from "../../utils/supabase";

export async function fetchSupabaseUser(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Failed to fetch user: " + error?.message);
  }

  return data;
}
