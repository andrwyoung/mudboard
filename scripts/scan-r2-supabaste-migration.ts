import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BUCKET = "mudboard-photos";
const MAX_DAYS_BACK = 60; // safety cap
const STOP_AFTER_DAYS_WITH_STORAGE = 3;

function startOfDay(d: Date) {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
  );
}

function endOfDay(d: Date) {
  return new Date(
    Date.UTC(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );
}

async function run() {
  let daysWithStorage = 0;

  for (let i = 0; i < MAX_DAYS_BACK; i++) {
    const day = new Date();
    day.setUTCDate(day.getUTCDate() - i);

    const from = startOfDay(day).toISOString();
    const to = endOfDay(day).toISOString();

    const { data: images, error } = await supabase
      .from("images")
      .select("image_id")
      .gte("created_at", from)
      .lte("created_at", to);

    if (error) throw error;

    let inStorage = 0;

    for (const img of images ?? []) {
      const { data } = await supabase.storage
        .from(BUCKET)
        .list(img.image_id, { limit: 1 });

      if (data && data.length > 0) {
        inStorage++;
      }
    }

    console.log({
      date: from.slice(0, 10),
      imagesCreated: images?.length ?? 0,
      imagesInSupabaseStorage: inStorage,
    });

    if (inStorage > 0) {
      daysWithStorage++;
      if (daysWithStorage >= STOP_AFTER_DAYS_WITH_STORAGE) {
        console.log("Stopping: found storage usage on 3 distinct days.");
        break;
      }
    }
  }
}

run();
