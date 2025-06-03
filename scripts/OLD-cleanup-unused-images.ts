// DEPRECATED for the newer cleanup-unused-images.ts
// this didn't work anyways lol....

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET_NAME = "mudboard-photos";
const shouldDelete =
  process.argv.includes("-d") || process.argv.includes("--delete");

async function runCleanup() {
  const { data: images, error } = await supabase.from("images").select("*");

  if (typeof window !== "undefined") {
    throw new Error("This script should not be run in the browser.");
  }

  if (error || !images) {
    console.error("Failed to fetch images:", error);
    return;
  }

  let unusedImages: { id: string; path?: string }[] = [];

  for (const image of images) {
    const { data: blocks, error: blockErr } = await supabase
      .from("blocks")
      .select("block_id")
      .eq("image_id", image.image_id)
      .eq("deleted", false); // adjust this field to match your soft delete flag

    if (blockErr) {
      console.error(
        `❌ Failed to check blocks for image ${image.id}:`,
        blockErr
      );
      continue;
    }

    const isUnused = !blocks || blocks.length === 0;

    if (isUnused) {
      const path = image.storage_path || image.path || image.file_path;
      unusedImages.push({ id: image.id, path });
    }
  }

  if (unusedImages.length === 0) {
    console.log("✅ No unused images found.");
    return;
  }

  console.log(`🕵️ Found ${unusedImages.length} unused images:`);
  unusedImages.forEach((img) =>
    console.log(`- ${img.id}${img.path ? ` [${img.path}]` : ""}`)
  );

  if (!shouldDelete) {
    console.log("\n🧪 Dry run only. Pass `-d` to delete these files.\n");
    return;
  }

  console.log("\n🧨 Deleting unused images...\n");

  let deletedCount = 0;
  for (const image of unusedImages) {
    if (image.path) {
      await supabase.storage.from(BUCKET_NAME).remove([image.path]);
    }

    await supabase.from("images").delete().eq("id", image.id);
    console.log(`🧹 Deleted ${image.id}`);
    deletedCount++;
  }

  console.log(`\n✅ Cleanup complete. Deleted ${deletedCount} images.\n`);
}

runCleanup().catch((err) => {
  console.error("Script failed:", err);
});
