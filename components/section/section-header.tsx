// this component is the thing that handles the title and description above
// every section inside the gallery

import { Section } from "@/types/board-types";
import InlineEditText from "../ui/inline-edit";
import {
  updateSectionDescription,
  updateSectionTitle,
} from "@/lib/sync/section-actions";
import { useLoadingStore } from "@/store/loading-store";
import { useUIStore } from "@/store/ui-store";

export default function SectionHeader({ section }: { section: Section }) {
  const title = section?.title;
  const description = section?.description;

  const mirrorMode = useUIStore((s) => s.mirrorMode);
  const isEditing =
    useLoadingStore.getState().editingSectionId === section.section_id;

  return (
    <div className="flex flex-row justify-between items-center pt-6 pb-0 px-3">
      <div className="flex w-xs md:w-sm">
        <InlineEditText
          value={title && title.trim() != "" ? title : null}
          unnamedPlaceholder="Click to add Title"
          autofocus={isEditing}
          placeholder="Add title"
          onChange={(newTitle) => {
            updateSectionTitle(section.section_id, newTitle);
          }}
          className="text-lg sm:text-xl md:text-2xl text-left"
        />
      </div>
      {!mirrorMode && (
        <div className="hidden lg:flex w-xs">
          <InlineEditText
            value={description && description.trim() != "" ? description : null}
            unnamedPlaceholder="Click to add a Description"
            placeholder="Add a Description"
            onChange={(newDesc) => {
              updateSectionDescription(section.section_id, newDesc);
            }}
            className="text-sm text-right"
          />
        </div>
      )}
    </div>
  );
}
