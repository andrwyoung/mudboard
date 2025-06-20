// this component is the thing that handles the title and description above
// every section inside the gallery
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"; // ensure this path matches your project structure

import { Section } from "@/types/board-types";
import InlineEditText from "../ui/inline-edit";
import {
  updateSectionDescription,
  updateSectionTitle,
} from "@/lib/db-actions/sync-text/update-section-text";
import { useLoadingStore } from "@/store/loading-store";
import { FaFileDownload, FaPlus, FaSave } from "react-icons/fa";
import { useImagePicker } from "@/hooks/use-image-picker";
import { canEditBoard } from "@/lib/auth/can-edit-board";
import InlineEditTextarea from "../ui/inline-textarea";
import { useLayoutStore } from "@/store/layout-store";
import { downloadImagesAsZip } from "../download-images/zip-images";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { useState } from "react";
import { Block, MudboardImage } from "@/types/block-types";
import { useUIStore } from "@/store/ui-store";
import { toast } from "sonner";
import { MAX_COLUMNS, MIN_COLUMNS } from "@/types/constants";
import { updateSectionColumnNum } from "@/lib/db-actions/update-section-columns";
import { setVisualColumnNum } from "@/lib/local-actions/set-visual-columns";
import { cn } from "@/utils/utils";

export default function SectionHeader({ section }: { section: Section }) {
  const title = section?.title;
  const description = section?.description;
  const isEditing =
    useLoadingStore.getState().editingSectionId === section.section_id;

  const { triggerImagePicker, fileInput } = useImagePicker(section.section_id);
  const canEdit = canEditBoard();

  const [downloadConfirmOpen, setDownloadConfirmOpen] = useState(false);
  const [imagesToDownload, setImagesToDownload] = useState<Block[]>([]);
  const sectionColumns = useLayoutStore((s) => s.sectionColumns);

  const mirrorMode = useUIStore((s) => s.mirrorMode);

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between items-center pt-6 pb-0 px-3">
        <div className="flex w-48 sm:w-xs md:w-sm">
          <InlineEditText
            isEditable={canEdit}
            value={title && title.trim() != "" ? title : null}
            unnamedPlaceholder={
              canEdit ? "Double click to add Title" : "Untitled Section"
            }
            autofocus={isEditing}
            placeholder="Add title"
            onChange={(newTitle) => {
              updateSectionTitle(section.section_id, newTitle);
            }}
            className="text-lg sm:text-xl md:text-2xl text-left"
          />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div
            className={`flex flex-row-reverse gap-2 items-center ${
              mirrorMode ? "opacity-50" : "opacity-80"
            }`}
          >
            {canEdit && (
              <div className="group flex flex-row cursor-pointer text-primary">
                {fileInput}
                {/* <div
                className="hidden group-hover:block font-header px-1 font-semibold hover:text-accent transition-all duration-300"
                onClick={() => createTextBlock(section.section_id)}
              >
                Text
              </div> */}
                <div
                  className="flex-shrink-0 relative size-6 group cursor-pointer hover:scale-95 
                  transition-transform duration-200 flex items-center justify-center"
                >
                  <FaPlus
                    className="z-2 size-5 text-primary group-hover:text-accent hover:primary transition-colors duration-300"
                    onClick={() => triggerImagePicker()}
                    title="Add Image to Section"
                  />
                </div>

                {/* <div
                className="hidden group-hover:block font-header px-1 font-semibold hover:text-accent transition-all duration-300"
                onClick={() => triggerImagePicker()}
              >
                Image
              </div> */}
              </div>
            )}

            <button
              title="Download Images in Section"
              className=" text-primary hover:text-accent hover:scale-105
            transition-all duration-300 cursor-pointer"
              onClick={() => {
                const blocks = sectionColumns[section.section_id] ?? [];
                const flattened = blocks.flat();
                const imageBlocks = flattened.filter(
                  (
                    b
                  ): b is Block & {
                    block_type: "image";
                    data: MudboardImage;
                  } => b.block_type === "image" && !!b.data
                );

                setImagesToDownload(imageBlocks);
                setDownloadConfirmOpen(true);
              }}
            >
              <FaFileDownload className="size-4.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 ">
            <div className="flex flex-row-reverse items-center gap-2">
              {canEdit &&
                section.visualColumnNum !== section.saved_column_num && (
                  <FaSave
                    className="text-primary cursor-pointer hover:text-accent
                    transition-all duration-200"
                    title="Save Number of Columns"
                    onClick={() => {
                      updateSectionColumnNum(
                        section.section_id,
                        section.visualColumnNum
                      );
                    }}
                  />
                )}
              <Select
                value={section.visualColumnNum.toString()}
                onValueChange={(val) => {
                  const newVal = parseInt(val);
                  setVisualColumnNum(section.section_id, newVal);
                }}
              >
                <SelectTrigger id={`select-trigger-${section.section_id}`}>
                  <div
                    className={`flex items-center gap-1 font-header text-sm 
                hover:text-accent transition-colors duration-200 text-primary
               `}
                    title="Change Column Number"
                  >
                    Columns: {section.visualColumnNum}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {Array.from(
                    { length: MAX_COLUMNS - MIN_COLUMNS + 1 },
                    (_, i) => {
                      const n = i + MIN_COLUMNS;
                      const isHighlighted = n === section.saved_column_num;

                      return (
                        <SelectItem key={n} value={n.toString()}>
                          <span
                            className={cn(
                              isHighlighted &&
                                n.toString() !==
                                  section.visualColumnNum.toString()
                                ? "text-accent  font-bold"
                                : ""
                            )}
                          >
                            {n}
                          </span>
                        </SelectItem>
                      );
                    }
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className=" px-1 sm:px-3">
        <InlineEditTextarea
          isEditable={canEdit}
          value={description && description.trim() != "" ? description : null}
          unnamedPlaceholder="Double click to add a Description"
          placeholder="Add a Description"
          onChange={(newDesc) => {
            updateSectionDescription(section.section_id, newDesc);
          }}
          className="leading-relaxed"
        />
      </div>

      <AlertDialog
        open={downloadConfirmOpen}
        onOpenChange={setDownloadConfirmOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-semibold text-primary">
              Download {imagesToDownload.length} image
              {imagesToDownload.length !== 1 ? "s" : ""} from &quot;
              {section.title?.trim() || "Untitled Section"}&quot;?
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
                setDownloadConfirmOpen(false);

                const toastId = toast.loading(
                  "Zipping images. This may take a while"
                );
                await downloadImagesAsZip(
                  imagesToDownload,
                  section.title ?? undefined
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
    </div>
  );
}
