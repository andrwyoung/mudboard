// this component is the thing that handles the title and description above
// every section inside the gallery

import { Section } from "@/types/board-types";
import InlineEditText from "../ui/inline-edit";
import { updateSectionTitle } from "@/lib/sync/section-actions";
import { useLoadingStore } from "@/store/loading-store";
import { FaPlus } from "react-icons/fa";
import { useImagePicker } from "@/hooks/use-image-picker";
import { createTextBlock } from "@/lib/sync/text-block-actions";
import { canEditBoard } from "@/lib/auth/can-edit-board";

export default function SectionHeader({ section }: { section: Section }) {
  const title = section?.title;
  const isEditing =
    useLoadingStore.getState().editingSectionId === section.section_id;

  const { triggerImagePicker, fileInput } = useImagePicker(section.section_id);
  const canEdit = canEditBoard();

  function handleAddImageBlock() {
    triggerImagePicker();
  }

  function handleAddTextBlock() {
    createTextBlock(section.section_id);
  }

  return (
    <div className="flex flex-row justify-between items-center pt-6 pb-0 px-3">
      <div className="flex w-xs md:w-sm">
        <InlineEditText
          isEditable={canEdit}
          value={title && title.trim() != "" ? title : null}
          unnamedPlaceholder={
            canEdit ? "Click to add Title" : "Untitled Section"
          }
          autofocus={isEditing}
          placeholder="Add title"
          onChange={(newTitle) => {
            updateSectionTitle(section.section_id, newTitle);
          }}
          className="text-lg sm:text-xl md:text-2xl text-left"
        />
      </div>
      <div className="flex flex-row gap-2 items-center">
        {/* {!mirrorMode && (
          <div className="hidden lg:flex w-xs">
            <InlineEditText
              value={
                description && description.trim() != "" ? description : null
              }
              unnamedPlaceholder="Click to add a Description"
              placeholder="Add a Description"
              onChange={(newDesc) => {
                updateSectionDescription(section.section_id, newDesc);
              }}
              className="text-sm text-right"
            />
          </div>
        )} */}
        {/* <FaPlus className="text-primary hover:text-accent cursor-pointer" /> */}
        {canEdit && (
          <div className="group flex flex-row cursor-pointer text-primary">
            {fileInput}
            <div
              className="hidden group-hover:block font-header px-1 font-semibold hover:text-accent transition-all duration-300"
              onClick={() => handleAddTextBlock()}
            >
              Text
            </div>
            <div
              className="flex-shrink-0 relative size-6 group cursor-pointer hover:scale-95 
            transition-transform duration-200 flex items-center justify-center"
            >
              {/* <div className="absolute inset-0 rounded-full border-4 border-primary" /> */}
              <FaPlus className="z-2 size-4 text-primary group-hover:text-accent hover:primary transition-colors duration-300" />
              {/* <div
              className="absolute inset-0 rounded-full bg-primary/40 z-1 group-hover:bg-background transition-all duration-300
              group-hover:scale-30"
            /> */}
            </div>

            <div
              className="hidden group-hover:block font-header px-1 font-semibold hover:text-accent transition-all duration-300"
              onClick={() => handleAddImageBlock()}
            >
              Image
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
