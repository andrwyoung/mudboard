// this component is the thing that handles the title and description above
// every section inside the gallery

import { Section } from "@/types/board-types";
import InlineEditText from "../ui/inline-edit";
import {
  updateSectionDescription,
  updateSectionTitle,
} from "@/lib/db-actions/sync-text/update-section-text";
import { useLoadingStore } from "@/store/loading-store";
import { useImagePicker } from "@/hooks/use-image-picker";
import InlineEditTextarea from "../ui/inline-textarea";
import { useLayoutStore } from "@/store/layout-store";
import { useUIStore } from "@/store/ui-store";
import SectionDownloadButton from "./section-icons.tsx/download-button";
import SectionAddImageButton from "./section-icons.tsx/add-image-button";
import SectionColumnSelector from "./section-icons.tsx/change-columns-select";
import SectionShareDialog from "./section-icons.tsx/section-share-options";
import { useCanEditSection } from "@/lib/auth/can-edit-section";

export default function SectionHeader({ section }: { section: Section }) {
  const title = section?.title;
  const description = section?.description;
  const isEditing =
    useLoadingStore.getState().editingSectionId === section.section_id;

  const { triggerImagePicker, fileInput } = useImagePicker(section.section_id);
  const canEdit = useCanEditSection(section);

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
              <SectionAddImageButton
                triggerImagePicker={triggerImagePicker}
                fileInput={fileInput}
              />
            )}

            <SectionDownloadButton
              sectionTitle={section.title}
              blocks={(sectionColumns[section.section_id] ?? []).flat()}
            />

            {canEdit && <SectionShareDialog section={section} />}
          </div>

          <div className="hidden sm:block">
            <SectionColumnSelector
              sectionId={section.section_id}
              visualColumnNum={section.visualColumnNum}
              savedColumnNum={section.saved_column_num}
              canEdit={canEdit}
            />
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
    </div>
  );
}
