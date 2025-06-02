import { Board } from "@/types/board-types";
import { supabase } from "@/utils/supabase";

export async function getUserBoards(userId: string): Promise<Board[]> {
  const { data, error } = await supabase
    .from("boards")
    .select("*")
    .eq("user_id", userId)
    .is("is_deleted", false) // optional, only non-deleted boards
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user boards:", error);
    return [];
  }

  return data;
}
