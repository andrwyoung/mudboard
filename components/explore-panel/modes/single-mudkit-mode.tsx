import SectionHeader from "@/components/section/section-header";
import SectionGallery from "@/app/b/[boardId]/gallery";
import { Block } from "@/types/block-types";
import { useOverlayStore } from "@/store/overlay-store";
import OverlayGallery from "@/app/b/[boardId]/overlay-gallery";
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { SectionWithStats } from "@/types/stat-types";

export default function ExploreSingleMudkitMode({
  selectedSection,
  columns,
  backButton,
}: {
  selectedSection: SectionWithStats;
  columns: Block[][];
  backButton: () => void;
}) {
  const overlaySelectedBlock = useOverlayStore("mirror").overlayBlock;

  return (
    <div className={`flex flex-col `}>
      {overlaySelectedBlock && (
        <OverlayGallery isMirror={true} selectedBlock={overlaySelectedBlock} />
      )}

      <button
        type="button"
        className="text-white hover:text-accent transition-all duration-200 w-fit 
        cursor-pointer flex items-center font-header gap-2 font-semibold mb-12 
        opacity-80 hover:opacity-100"
        onClick={backButton}
        aria-label="Go back to all mudkits"
        title="Go back to all mudkits"
      >
        <FaArrowAltCircleLeft className="size-5" /> Back
      </button>

      <SectionHeader
        section={selectedSection}
        canEdit={false}
        scope="mirror"
        username={selectedSection.username}
      />

      <SectionGallery
        isMirror={true}
        section={selectedSection}
        columns={columns}
        canEdit={false}
      />
    </div>
  );
}
