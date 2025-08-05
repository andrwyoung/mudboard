import { toast } from "sonner";
import { Section } from "@/types/board-types";
import { SECTION_BASE_URL } from "@/types/constants";
import { FaCopy, FaRegStar, FaStar } from "react-icons/fa6";
import { supabase } from "@/lib/supabase/supabase-client";
import { useMetadataStore } from "@/store/metadata-store";
import { handleLibrarySync } from "@/components/modals/share/handle-add-library";
import { useDemoStore } from "@/store/demo-store";

export default function SectionShareButton({
  section,
  canEdit,
}: {
  section: Section;
  canEdit: boolean;
}) {
  const copyLink = () => {
    navigator.clipboard.writeText(`${SECTION_BASE_URL}/${section.section_id}`);
    toast.success("Share link copied to clipboard");
  };

  const sectionIsPublic = section.is_public;

  const isDemo = useDemoStore((s) => s.isDemoBoard);
  const user = useMetadataStore.getState().user;

  async function toggleFavorited() {
    const newResult = !sectionIsPublic;
    const update = { is_public: newResult };

    if (section.owned_by) {
      const { error } = await supabase
        .from("sections")
        .update(update)
        .eq("section_id", section.section_id);
      if (error) {
        toast.error(`Failed to update Section`);
        return;
      }
    }

    useMetadataStore.getState().updateBoardSection(section.section_id, update);

    const sectionTitle = section.title
      ? `"${section.title}"`
      : "Untitled Section";
    if (newResult) {
      toast.success(`Starred: ${sectionTitle}`);
    } else {
      toast.success(`Unstarred: ${sectionTitle}`);
    }

    await handleLibrarySync(section, newResult, isDemo || !user);
  }

  return (
    <>
      {canEdit ? (
        <button
          onClick={() => toggleFavorited()}
          type="button"
          // title={
          //   section.is_public
          //     ? "Open Section Settings"
          //     : `Star ${
          //         section.title ? `"${section.title}"` : "Untitled Section"
          //       } in Library`
          // }
          title={section.is_public ? "Unfavorite Section" : `Star Section`}
          aria-label={"Open Sharing Options"}
          className="hover:text-accent cursor-pointer transition-all duration-200 mr-[1px] "
        >
          {section.is_public ? (
            <FaStar className="size-5.5" />
          ) : (
            <FaRegStar className="size-5.5" />
          )}
        </button>
      ) : (
        <button
          title="Copy Sharing Link"
          onClick={copyLink}
          className={`hover:text-accent cursor-pointer transition-all duration-200
            ${section.is_public ? "" : "hidden"}`}
        >
          <FaCopy className="size-5" />
        </button>
      )}
    </>
  );
}
