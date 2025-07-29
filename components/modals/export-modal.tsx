import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { toast } from "sonner";
import { useLayoutStore } from "@/store/layout-store";
import { OFFSHORE_THUMBNAIL_GEN_URL } from "@/types/upload-settings";
import { CheckField } from "../ui/check-field";
import { Section } from "@/types/board-types";
import { useState } from "react";
import { useUIStore } from "@/store/ui-store";
import { getMismatchedColumnData } from "./export/mismatched-columns";
import { useMetadataStore } from "@/store/metadata-store";
import { useDemoStore } from "@/store/demo-store";

export type ExportMethod = "grid" | "freeform" | "autofit";

export default function ExportModal({
  sections,
  open,
  setOpen,
}: {
  sections: Section[];
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const exportMethods: ExportMethod[] = ["grid", "freeform"];
  const [exportMethod, setExportMethod] = useState<ExportMethod>("grid");

  const freeformMode = useUIStore((s) => s.freeformMode);
  const singleSectionExport = sections.length === 1;

  // export options
  const [excludeTitle, setExcludeTitle] = useState(false);
  const [noSpacing, setNoSpacing] = useState(false);
  const [transparentBg, setTransparentBg] = useState(false);

  const mismatchedInfo = getMismatchedColumnData(sections);
  const anyMismatch = mismatchedInfo.some((item) => item.isMismatch);
  const toggleClass =
    "font-header text-md px-4 py-0.5 rounded-md cursor-pointer hover:bg-accent/60  flex justify-center";

  async function handleSectionExport(
    relevantId: string,
    method: "section" | "board"
  ) {
    setOpen(false);
    // sync order real quick
    useLayoutStore.getState().syncLayout();

    const toastId = toast.loading("Requesting export...");

    const gatheringTimeout = setTimeout(() => {
      toast.message("Gathering Images...", { id: toastId });
    }, 500);

    const buildingTimeout = setTimeout(() => {
      toast.message("Building Board...", { id: toastId });
    }, 2000);

    const generatingTimeout = setTimeout(() => {
      toast.message("Generating export image...", { id: toastId });
    }, 5000);

    try {
      // calling your offshore export endpoint
      const res = await fetch(`${OFFSHORE_THUMBNAIL_GEN_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          relevantId: relevantId,
          exportType: method,
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

      const fileExtension = method === "board" ? "zip" : "png";
      a.download = `mudboard-${method}-${relevantId}.${fileExtension}`;
      a.click();

      // Revoke the URL after a few seconds
      setTimeout(() => URL.revokeObjectURL(url), 3000);

      toast.dismiss(toastId);
      toast.success("Export ready");
    } catch (err) {
      toast.dismiss(toastId);
      toast.error("Server error. Please retry shortly.");
      console.error(err);
    } finally {
      // clear all timeouts
      clearTimeout(gatheringTimeout);
      clearTimeout(buildingTimeout);
      clearTimeout(generatingTimeout);
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
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) resetDialog(); // reset only when closing
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-primary">
            Export{" "}
            {singleSectionExport
              ? `${
                  sections[0].title ? `"${sections[0].title}"` : "Untitled"
                } Section`
              : "All Sections"}
          </DialogTitle>
          <DialogDescription className="text-primary text-xs leading-relaxed">
            {!singleSectionExport && (
              <>
                Each section will be saved as an image and will be bundled into
                a ZIP file.
                <br />
              </>
            )}
            Beta Note: Only PNG exports are currently supported. Text blocks are
            excluded.
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
          <div className="w-full flex "></div>
        </div>

        <DialogFooter>
          <div className="flex justify-between items-center text-primary">
            {anyMismatch && exportMethod === "grid" && (
              <p className="text-xs text-warning italic">
                {singleSectionExport ? (
                  <>
                    Note: export will use the saved layout:{" "}
                    <strong>{mismatchedInfo[0].savedColumnNum}</strong> columns,
                    not the <strong>{mismatchedInfo[0].visualColumnNum}</strong>{" "}
                    shown.
                  </>
                ) : (
                  <>
                    Warning: Some sections have unsaved layouts.
                    {mismatchedInfo
                      .filter(({ isMismatch }) => isMismatch)
                      .slice(0, 3)
                      .map(
                        ({
                          sectionId,
                          sectionTitle,
                          savedColumnNum,
                          visualColumnNum,
                        }) => (
                          <>
                            <br />
                            <span key={sectionId} className="">
                              {sectionTitle}: {visualColumnNum} →{" "}
                              {savedColumnNum}
                            </span>
                          </>
                        )
                      )}
                  </>
                )}
              </p>
            )}

            {/* {imageBlocks.length > 50 && (
              <p className="text-xs text-destructive font-semibold italic">
                This section is large, so export may fail. Consider ZIP or
                splitting it up.
              </p>
            )} */}

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
                className="font-header items-center flex cursor-pointer px-4 py-0.5 border-2 border-primary/60 hover:border-accent rounded-lg hover:bg-accent/40"
                onClick={() => {
                  // if demo
                  useDemoStore.getState().markMissionComplete("export");

                  if (singleSectionExport) {
                    handleSectionExport(sections[0].section_id, "section");
                  } else {
                    const boardId = useMetadataStore.getState().board?.board_id;
                    if (!boardId)
                      throw new Error(
                        "Board ID not found. Cannot export board."
                      );

                    handleSectionExport(boardId, "board");
                  }
                }}
              >
                Export {singleSectionExport ? "Section" : "All"}
              </button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
