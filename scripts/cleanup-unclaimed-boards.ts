import "dotenv/config";
import promptSync from "prompt-sync";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupExpiredBoards() {
  const prompt = promptSync();

  const { data: boards, error } = await supabase
    .from("expired_boards")
    .select("*");

  if (error) {
    console.error("Failed to fetch expired boards:", error);
    return;
  }

  if (!boards || boards.length === 0) {
    console.log("No expired boards to delete.");
    return;
  }

  console.log("Preview of first 10 expired boards:");
  console.table(
    boards.slice(0, 10).map((b) => ({
      board_id: b.board_id,
      user_id: b.user_id,
      created_at: b.created_at,
      age: b.age,
    }))
  );

  const confirm = prompt(`Delete ${boards.length} expired boards? (yes/no): `);
  if (confirm.toLowerCase() !== "yes") return;

  const idsToDelete = boards.map((b) => b.board_id);
  const { error: deleteError } = await supabase
    .from("boards")
    .delete()
    .in("board_id", idsToDelete);

  if (deleteError) {
    console.error("Failed to delete boards:", deleteError);
  } else {
    console.log(`Successfully deleted ${idsToDelete.length} expired boards.`);
  }
}

cleanupExpiredBoards();
