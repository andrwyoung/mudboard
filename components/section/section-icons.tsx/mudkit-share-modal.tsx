import { toast } from "sonner";
import { Section } from "@/types/board-types";
import { SECTION_BASE_URL } from "@/types/constants";
import { FaBookBookmark, FaCopy } from "react-icons/fa6";
import { IoLibrary } from "react-icons/io5";
import { useModalStore } from "@/store/modal-store";

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

  const setOpen = useModalStore((s) => s.openShareModal);

  return (
    <>
      {canEdit ? (
        <button
          onClick={() => setOpen(section.section_id)}
          type="button"
          title={
            section.is_public
              ? "Open Section Settings"
              : `Add ${
                  section.title ? `"${section.title}"` : "Untitled Section"
                } To Library`
          }
          aria-label={"Open Sharing Options"}
          className="hover:text-accent cursor-pointer transition-all duration-200 mr-[2px]"
        >
          {section.is_public ? (
            <IoLibrary className="size-5" />
          ) : (
            <FaBookBookmark className="size-4.5" />
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
