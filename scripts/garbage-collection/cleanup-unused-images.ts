// delete any images that aren't associated with any blocks
// this means it's no longer being used

// do "npm run declutter" to use this

import "dotenv/config";
import promptSync from "prompt-sync";
import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import { IMAGE_VARIANT_MAP, DEFAULT_FILE_EXT } from "@/types/upload-settings";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucketName = "mudboard-photos";

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupOrphanedImages() {
  if (typeof window !== "undefined") {
    throw new Error("This script should not be run in the browser.");
  }

  // Step 1: Find orphaned images
  // First, get all used image_ids
  const { data: orphanedImages, error: queryError } = await supabase
    .from("orphaned_images")
    .select("*");

  if (queryError) {
    console.error("Failed to fetch orphaned images:", queryError);
    return;
  }

  if (!orphanedImages || orphanedImages.length === 0) {
    console.log("No orphaned images found.");
    return;
  }

  // Save to log
  const previewImageIds = orphanedImages
    .slice(0, 10)
    .map((img) => img.image_id);
  console.log("Preview of first 10 orphaned image IDs:");
  console.table(previewImageIds);
  fs.writeFileSync(
    "orphaned-images-log.json",
    JSON.stringify(orphanedImages, null, 2)
  );
  // check we're good
  const prompt = promptSync();
  const shouldContinue = prompt(
    `Delete ${orphanedImages.length} images? (yes/no): `
  );
  if (shouldContinue.toLowerCase() !== "yes") return;

  const idsToDelete = orphanedImages.map((img) => img.image_id);
  const variants = Object.keys(IMAGE_VARIANT_MAP) as Array<
    keyof typeof IMAGE_VARIANT_MAP
  >;
  const pathsToDelete = idsToDelete.flatMap((id) =>
    variants.map((variant) => `${id}/${variant}.${DEFAULT_FILE_EXT}`)
  );

  // Step 2: Delete image metadata from DB
  await supabase.from("images").delete().in("image_id", idsToDelete);

  // Step 3: Delete storage files
  const { error: deleteError } = await supabase.storage
    .from(bucketName)
    .remove(pathsToDelete);

  if (deleteError) {
    console.error("Failed to delete storage files:", deleteError);
  } else {
    console.log("Successfully deleted orphaned images and storage items.");
  }
}

cleanupOrphanedImages();
