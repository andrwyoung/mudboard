import { Section } from "@/types/board-types";
import InlineEditText from "../ui/inline-edit";
import { useMetadataStore } from "@/store/metadata-store";

export default function SectionHeader({ section }: { section: Section }) {
  const setSections = useMetadataStore((s) => s.setSections);
  const allSections = useMetadataStore((s) => s.sections);

  const title = section?.title ?? "Untitled";
  const description = section?.description;

  return (
    <div className="flex flex-row justify-between items-center pt-6 pb-0 px-6">
      <InlineEditText
        value={title}
        onChange={(newTitle) => {
          setSections(
            allSections.map((s) =>
              s.section_id === section.section_id
                ? { ...s, title: newTitle }
                : s
            )
          );
        }}
      />
      {description && (
        <p className="text-primary text-sm ml-4 italic opacity-80">
          {description}
        </p>
      )}
    </div>
  );
}
