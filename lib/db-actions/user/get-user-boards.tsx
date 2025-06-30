// get all the boards that belong to 1 user

// TODO: hmmm we should probably double check that the userId really is the one
// we're logged in as

import { Board } from "@/types/board-types";
import { supabase } from "@/lib/supabase/supabase-client";

export async function getUserBoards(userId: string): Promise<Board[]> {
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("user_id", userId)
    .is("deleted", false) // only non-deleted boards
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user boards:", error);
    return [];
  }

  return data;
}
