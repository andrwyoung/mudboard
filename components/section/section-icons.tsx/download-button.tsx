import { Block, MudboardImage } from "@/types/block-types";
import { useState } from "react";
import { FaFileDownload } from "react-icons/fa";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../ui/alert-dialog";
import { toast } from "sonner";
import { downloadImagesAsZip } from "@/components/download-images/zip-images";

export default function SectionDownloadButton({
  sectionTitle,
  blocks,
}: {
  sectionTitle?: string | null;
  blocks: Block[];
}) {
  const [open, setOpen] = useState(false);
  const imageBlocks = blocks.filter(
    (b): b is Block & { block_type: "image"; data: MudboardImage } =>
      b.block_type === "image" && !!b.data
  );

  return (
    <>
      <button
        title="Download Images in Section"
        className="hover:text-accent hover:scale-105 transition-all duration-300 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <FaFileDownload className="size-4.5" />
      </button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-primary">
              Download {imageBlocks.length} image
              {imageBlocks.length !== 1 ? "s" : ""} from &quot;
              {sectionTitle?.trim() || "Untitled Section"}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will generate a ZIP file with all image blocks from this
              section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="font-bold"
              variant="good"
              title="Download Images"
              onClick={async () => {
                setOpen(false);
                const toastId = toast.loading(
                  "Zipping images. This may take a while"
                );
                await downloadImagesAsZip(
                  imageBlocks,
                  sectionTitle ?? undefined
                );
                toast.dismiss(toastId);
                toast.success("Download ready");
              }}
            >
              Download
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
