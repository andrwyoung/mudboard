// this component is the thing that handles the title and description above
// every section inside the gallery

import { CanvasScope, Section } from "@/types/board-types";
import InlineEditText from "../ui/inline-edit";
import { updateSectionTitle } from "@/lib/db-actions/sync-text/update-section-title";
import { useLoadingStore } from "@/store/loading-store";
import { useImagePicker } from "@/hooks/use-image-picker";
import InlineEditTextarea from "../ui/inline-textarea";
import { useLayoutStore } from "@/store/layout-store";
import { useUIStore } from "@/store/ui-store";
import SectionDownloadButton from "./section-icons.tsx/download-button";
import SectionAddImageButton from "./section-icons.tsx/add-image-button";
import SectionColumnSelector from "./section-icons.tsx/change-columns-select";
import SectionShareButton from "./section-icons.tsx/mudkit-share-modal";
import { FaLock } from "react-icons/fa6";
import { updateSectionDescription } from "@/lib/db-actions/sync-text/update-section-description";
import { useSecondaryLayoutStore } from "@/store/secondary-layout-store";
import React from "react";

function SectionHeader({
  section,
  canEdit,
  scope = "main",
}: {
  section: Section;
  canEdit: boolean;
  scope?: CanvasScope;
}) {
  const title = section?.title;
  const description = section?.description;
  const isEditing =
    useLoadingStore.getState().editingSectionId === section.section_id;

  console.log("regenerating section header");
  const visualNumColsMirror = useSecondaryLayoutStore((s) => s.visualColumnNum);
  const visualNumColsMain = useLayoutStore((s) =>
    s.getVisualNumColsForSection(section.section_id)
  );
  const visualNumCols =
    scope === "mirror" ? visualNumColsMirror : visualNumColsMain;

  const textColor = scope === "main" ? "text-primary" : "text-primary-text";

  const { triggerImagePicker, fileInput } = useImagePicker(section.section_id);

  const mirrorMode = useUIStore((s) => s.mirrorMode);

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-between items-start pt-3 pb-0 px-3">
        <div className="flex flex-col gap-0">
          <div className="flex  w-48 sm:w-xs md:w-sm">
            <InlineEditText
              isEditable={canEdit}
              value={title && title.trim() != "" ? title : null}
              unnamedPlaceholder={
                canEdit ? "Double click to add Title" : "Untitled Section"
              }
              autofocus={isEditing}
              placeholder="Add title"
              onChange={(newTitle) => {
                updateSectionTitle(section.section_id, newTitle, canEdit);
              }}
              className={`text-lg sm:text-xl md:text-2xl text-left  ${textColor} `}
            />
          </div>
          {/* {!canEdit && username && (
            <h3 className="ml-4 text-xs font-semibold mb-4">
              Created by: {username}
            </h3>
          )} */}
        </div>
        <div className={`flex flex-col items-end gap-2 ${textColor}`}>
          <div
            className={`flex flex-row-reverse gap-2 items-center ${
              mirrorMode ? "opacity-50" : "opacity-80"
            }`}
          >
            {!canEdit && scope === "main" && (
              <FaLock
                title="Editing is Locked"
                className={`opacity-50 size-4.5`}
              />
            )}

            {canEdit && (
              <SectionAddImageButton
                triggerImagePicker={triggerImagePicker}
                fileInput={fileInput}
              />
            )}

            <SectionDownloadButton section={section} />

            <SectionShareButton section={section} canEdit={canEdit} />
          </div>

          <div className="hidden sm:block">
            <SectionColumnSelector
              sectionId={section.section_id}
              visualNumCols={visualNumCols}
              savedColumnNum={section.saved_column_num}
              canEdit={canEdit}
              scope={scope}
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
          className={`leading-relaxed ${textColor}`}
        />
      </div>
    </div>
  );
}

export default React.memo(SectionHeader);
