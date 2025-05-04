import { ImageDownload, ImageType } from "@/types/image-type";
import { supabase } from "../supabase";
import { SUPABASE_OBJECT_URL } from "@/types/constants";

export async function fetchSupabaseImages(): Promise<ImageType[]> {
  console.log("Fetching images from Supabase DB...");

  const { data, error } = await supabase
    .from("images")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching images from DB:", error.message);
    return [];
  }

  const imagesWithFileName: ImageType[] = (data || []).map(
    (image: ImageDownload): ImageType => ({
      image_id: image.image_id,

      file_ext: image.file_ext,
      original_name: image.original_name,

      width: image.width,
      height: image.height,

      description: image.description ?? image.original_name,
      order_index: image.order_index ?? undefined,

      fileName: `${SUPABASE_OBJECT_URL}//${image.image_id}.${image.file_ext}`,
    })
  );

  return imagesWithFileName;
}
