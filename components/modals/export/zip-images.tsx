import { downloadImagesAsZip } from "@/components/download-images/zip-images";
import { useLayoutStore } from "@/store/layout-store";
import { Block, MudboardImage } from "@/types/block-types";
import { Section } from "@/types/board-types";
import React from "react";
import { FaFileDownload } from "react-icons/fa";
import { toast } from "sonner";

export default function ZipImagesButton(section: Section) {
  const sectionTitle = section.title;
  const blocks = useLayoutStore(
    (s) => s.sectionColumns[section.section_id]
  ).flat();
  const imageBlocks = blocks.filter(
    (b): b is Block & { block_type: "image"; data: MudboardImage } =>
      b.block_type === "image" && !!b.data
  );

  async function handleZip() {
    const toastId = toast.loading(`Preparing image ZIP…`);

    const collectTimeout = setTimeout(() => {
      toast.message(
        `Collecting ${imageBlocks.length} image${
          imageBlocks.length !== 1 ? "s" : ""
        }…`,
        { id: toastId }
      );
    }, 600);

    const compressTimeout = setTimeout(() => {
      toast.message("Compressing files…", { id: toastId });
    }, 2200);

    const organizeTimeout = setTimeout(() => {
      toast.message("Organizing ZIP archive…", { id: toastId });
    }, 4200);

    const delayTimeout = setTimeout(() => {
      toast.message("Still working… large exports may take a bit", {
        id: toastId,
      });
    }, 10000);

    try {
      await downloadImagesAsZip(imageBlocks, sectionTitle ?? undefined);

      toast.dismiss(toastId);
      toast.success("Export ready");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Server error. Please retry shortly.");
      console.error(err);
    } finally {
      clearTimeout(collectTimeout);
      clearTimeout(compressTimeout);
      clearTimeout(organizeTimeout);
      clearTimeout(delayTimeout);
    }
  }

  return (
    <button
      type="button"
      title="Download All Images In a ZIP"
      className="text-xs leading-tight text-left cursor-pointer hover:underline text-primary flex gap-1 items-center "
      onClick={handleZip}
    >
      <FaFileDownload />
      Download {imageBlocks.length} Images (ZIP)
    </button>
  );
}
