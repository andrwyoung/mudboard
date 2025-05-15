import { Section } from "@/types/block-types";
import { supabase } from "../supabase";

export async function fetchSupabaseSections(
  boardId: string
): Promise<Section[]> {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .eq("board_id", boardId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Failed to fetch sections:", error.message);
    return [];
  }

  return data;
}
