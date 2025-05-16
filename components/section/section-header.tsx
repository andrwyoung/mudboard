import { Section } from "@/types/board-types";
import InlineEditText from "../ui/inline-edit";
import {
  updateSectionDescription,
  updateSectionTitle,
} from "@/lib/sync/section-actions";

export default function SectionHeader({ section }: { section: Section }) {
  const title = section?.title;
  const description = section?.description;

  return (
    <div className="flex flex-row justify-between items-center pt-6 pb-0 px-3">
      <div className="flex w-xs md:w-sm">
        <InlineEditText
          value={title && title.trim() != "" ? title : null}
          unnamedPlaceholder="Click to add Title"
          placeholder="Add title"
          onChange={(newTitle) => {
            updateSectionTitle(section.section_id, newTitle);
          }}
          className="text-lg sm:text-xl md:text-2xl text-left"
        />
      </div>
      <div className="hidden lg:flex w-xs md:w-sm">
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
    </div>
  );
}
