import { toast } from "sonner";
import { Section } from "@/types/board-types";
import { SECTION_BASE_URL } from "@/types/constants";
import { FaCopy, FaRegStar, FaStar } from "react-icons/fa6";
import { toggleFavorited } from "@/lib/db-actions/explore/toggle-starred";

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

  return (
    <>
      {canEdit ? (
        <button
          onClick={() => toggleFavorited(!section.is_public, section)}
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
