import { Block, MudboardImage } from "@/types/block-types";
import { useState } from "react";
import { FaFileDownload } from "react-icons/fa";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../ui/dialog";
import { toast } from "sonner";
import { downloadImagesAsZip } from "@/components/download-images/zip-images";
import { useUIStore } from "@/store/ui-store";
import { OFFSHORE_THUMBNAIL_GEN_URL } from "@/types/upload-settings";
import { CheckField } from "@/components/ui/check-field";
import { useLayoutStore } from "@/store/layout-store";

export type ExportMethod = "grid" | "freeform" | "autofit";

export default function SectionDownloadButton({
  sectionTitle,
  sectionId,
  blocks,
  visualColumnNum,
  savedColumnNum,
}: {
  sectionTitle?: string | null;
  sectionId: string;
  blocks: Block[];
  visualColumnNum: number;
  savedColumnNum: number;
}) {
  const freeformMode = useUIStore((s) => s.freeformMode);

  const exportMethods: ExportMethod[] = ["grid", "freeform"];

  const [open, setOpen] = useState(false);
  const [exportMethod, setExportMethod] = useState<ExportMethod>("grid");
  const imageBlocks = blocks.filter(
    (b): b is Block & { block_type: "image"; data: MudboardImage } =>
      b.block_type === "image" && !!b.data
  );

  // export options
  const [excludeTitle, setExcludeTitle] = useState(false);
  const [noSpacing, setNoSpacing] = useState(false);
  const [transparentBg, setTransparentBg] = useState(false);

  const mismatchedLayout =
    visualColumnNum !== savedColumnNum && exportMethod === "grid";
  const toggleClass =
    "font-header text-md px-4 py-0.5 rounded-md cursor-pointer hover:bg-accent/60  flex justify-center";

  async function handleExport() {
    setOpen(false);
    // sync order real quick
    useLayoutStore.getState().syncLayout();

    const toastId = toast.loading("Requesting export...");

    try {
      setTimeout(() => {
        toast.message("Building Board...", { id: toastId });
      }, 500);

      setTimeout(() => {
        toast.message("Generating export image...", { id: toastId });
      }, 2000);

      setTimeout(() => {
        toast.message("Finalizing...", { id: toastId });
      }, 5000);

      // Call your offshore export endpoint here
      const res = await fetch(`${OFFSHORE_THUMBNAIL_GEN_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relevantId: sectionId,
          exportType: "section",
          boardExportOptions: {
            isFreeform: exportMethod === "freeform",
            includeTitle: !excludeTitle,
            spacing: noSpacing ? 0 : undefined,
            sidePadding: noSpacing ? 0 : undefined,
            backgroundColor: transparentBg ? undefined : "#ffffff",
          },
        }),
      });
      if (!res.ok) throw new Error(`Export failed: ${res.statusText}`);

      toast.message("Downloading file...", { id: toastId });

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      // Create a download link and click it
      const a = document.createElement("a");
      a.href = url;
      a.download = `mudboard-section-${sectionId}.png`; // or .zip/.webp
      a.click();

      // Revoke the URL after a few seconds
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      toast.dismiss(toastId);
      toast.success("Export ready");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Server error. Please retry shortly.");
      console.error(err);
    }
  }

  async function handleZip() {
    setOpen(false);
    const toastId = toast.loading(`Preparing image ZIP…`);

    try {
      setTimeout(() => {
        toast.message(
          `Collecting ${imageBlocks.length} image${
            imageBlocks.length !== 1 ? "s" : ""
          }…`,
          {
            id: toastId,
          }
        );
      }, 600);

      setTimeout(() => {
        toast.message("Compressing files…", { id: toastId });
      }, 2200);

      setTimeout(() => {
        toast.message("Organizing ZIP archive…", { id: toastId });
      }, 600);

      setTimeout(() => {
        toast.message("Still working… large exports may take a bit", {
          id: toastId,
        });
      }, 10000);

      await downloadImagesAsZip(imageBlocks, sectionTitle ?? undefined);

      toast.dismiss(toastId);
      toast.success("Export ready");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Server error. Please retry shortly.");
      console.error(err);
    }
  }

  function resetOptions() {
    setExcludeTitle(false);
    setNoSpacing(false);
    setTransparentBg(false);
  }

  function resetDialog() {
    setExportMethod(freeformMode ? "freeform" : "grid");
    resetOptions();
  }

  return (
    <>
      <button
        title="Export Options"
        className="hover:text-accent hover:scale-105 transition-all duration-300 cursor-pointer"
        onClick={() => {
          setOpen(true);
          resetDialog();
        }}
      >
        <FaFileDownload className="size-4.5" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-primary">
              Export Single Section
            </DialogTitle>
            <DialogDescription className="text-primary text-xs">
              Beta Note: Only PNG exports are currently supported. Text blocks
              are excluded.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col text-primary mb-4">
            <div className="mt-2 mb-8 flex flex-col gap-1 ">
              <label className="font-medium text-sm self-center -translate-x-[1px]">
                Export method:
              </label>
              <div className="flex flex-row self-center gap-2 rounded-lg border-2 border-accent">
                {exportMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    title={`Export as ${
                      method.charAt(0).toUpperCase() + method.slice(1)
                    } View`}
                    className={`${toggleClass} ${
                      exportMethod === method
                        ? "bg-accent border-accent"
                        : "border-transparent"
                    }`}
                    onClick={() => {
                      resetOptions();
                      setExportMethod(method);
                    }}
                  >
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="">
              <h3 className="text-sm mb-2">
                Additional Options (
                {exportMethod.charAt(0).toUpperCase() + exportMethod.slice(1)}):
              </h3>
              <div className="flex flex-col gap-1 mb-4">
                <CheckField
                  text="Exclude Title"
                  isChecked={excludeTitle}
                  onChange={setExcludeTitle}
                />
                {exportMethod !== "freeform" && (
                  <CheckField
                    text="No Spacing Between Images"
                    isChecked={noSpacing}
                    onChange={setNoSpacing}
                  />
                )}
                <CheckField
                  text="Transparent Background"
                  isChecked={transparentBg}
                  onChange={setTransparentBg}
                />
              </div>
            </div>
            <div className="w-full flex ">
              <button
                type="button"
                title="Download All Images In a ZIP"
                className="text-xs leading-tight text-left cursor-pointer hover:underline text-primary flex gap-1 items-center "
                onClick={handleZip}
              >
                <FaFileDownload />
                Download {imageBlocks.length} Images (ZIP)
              </button>
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-between items-center text-primary">
              {mismatchedLayout && (
                <p className="text-xs text-warning italic">
                  Note: export will use the saved layout:{" "}
                  <strong>{savedColumnNum}</strong> columns, not the{" "}
                  <strong>{visualColumnNum}</strong> shown.
                </p>
              )}

              {imageBlocks.length > 50 && (
                <p className="text-xs text-destructive font-semibold italic">
                  This section is large, so export may fail. Consider ZIP or
                  splitting it up.
                </p>
              )}

              <div className=" w-full flex justify-end gap-1 items-center">
                <button
                  type="button"
                  title="Close Export Panel"
                  className="font-header  cursor-pointer px-4 py-0.5 rounded-lg hover:text-rose-500"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  title="Export Section"
                  className="font-header  cursor-pointer px-4 py-0.5 border-2 border-primary/60 hover:border-accent rounded-lg hover:bg-accent/40"
                  onClick={handleExport}
                >
                  Export PNG
                </button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 
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
      </AlertDialog> */}
    </>
  );
}
