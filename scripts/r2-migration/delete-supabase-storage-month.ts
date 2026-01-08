// this is when we migrated from supabase storage to r2
// basically just delete things month by month

import "dotenv/config";
import promptSync from "prompt-sync";
import { createClient } from "@supabase/supabase-js";
import {
  DEFAULT_FILE_EXT,
  IMAGE_VARIANT_MAP,
} from "../../types/upload-settings.ts";
import * as fs from "fs";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "mudboard-photos";

// helper
function isoWeekRange(year: number, week: number) {
  if (week < 1 || week > 53) {
    throw new Error("Invalid ISO week number");
  }

  // Jan 4 is always in ISO week 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7; // Sunday → 7

  // Monday of ISO week 1
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - (jan4Day - 1));

  const start = new Date(week1Monday);
  start.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);

  return { start, end };
}

// additional stats function
async function countImagesInBucket() {
  const pageSize = 1000;
  let offset = 0;
  let total = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list("", {
      limit: pageSize,
      offset,
    });

    if (error) throw error;
    if (!data || data.length === 0) break;

    // each entry here is a top-level folder = image_id
    total += data.length;
    offset += pageSize;
  }

  return total;
}

async function cleanupSupabaseStorageByWeek(year: number, week: number) {
  const { start, end } = isoWeekRange(year, week);
  console.log(`Range: ${start.toISOString()} → ${end.toISOString()}`);

  // Step 1: Fetch images from DB
  const { data: images, error } = await supabase
    .from("images")
    .select("image_id")
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());

  if (error) {
    console.error("Failed to fetch images:", error);
    return;
  }

  if (!images || images.length === 0) {
    console.log("No images found for this month.");
    return;
  }

  // optional debugging:
  const count = await countImagesInBucket();
  console.log(
    `Images left in Supabase Storage: ${count} * 4 variants: ${count * 4}`
  );

  // preview
  const previewImageIds = images.slice(0, 10).map((img) => img.image_id);
  console.log("Preview of first 10 image IDs:");
  console.table(previewImageIds);

  // Step 2: Build storage paths
  const variants = Object.keys(IMAGE_VARIANT_MAP) as Array<
    keyof typeof IMAGE_VARIANT_MAP
  >;

  const pathsToDelete = images.flatMap((img) =>
    variants.map((variant) => `${img.image_id}/${variant}.${DEFAULT_FILE_EXT}`)
  );

  // Step 3: Dry-run log
  fs.writeFileSync(
    `supabase-storage-delete-${year}-${week}.json`,
    JSON.stringify(
      {
        year,
        week,
        imageCount: images.length,
        imageIds: images.map((i) => i.image_id),
      },
      null,
      2
    )
  );

  console.log(
    `About to POSSIBLY delete ${pathsToDelete.length} Supabase Storage objects. Image table will not be touched.`
  );
  console.log(
    `Preview written to supabase-storage-delete-${year}-${week}.json`
  );

  // Step 4: Confirm
  const prompt = promptSync();
  const confirm = prompt(
    `Proceed deleting Supabase Storage objects for year ${year} week ${week}? (yes/no): `
  );
  if (confirm.toLowerCase() !== "yes") return;

  // Step 5: Delete storage objects only
  const { data: deletedObjects, error: deleteError } = await supabase.storage
    .from(BUCKET)
    .remove(pathsToDelete);

  if (deleteError) {
    console.error("Failed to delete storage objects:", deleteError);
    return;
  }

  console.log(
    `Deleted ${deletedObjects?.length ?? 0} Supabase Storage objects`
  );
}

// ---- CLI entry ----

const year = Number(process.argv[2]);
const week = Number(process.argv[3]);

if (!year || !week) {
  console.error("Usage: ts-node delete-supabase-storage-week.ts <year> <week>");
  process.exit(1);
}

cleanupSupabaseStorageByWeek(year, week);
