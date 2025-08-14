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
        className="text-primary-text hover:text-accent transition-all duration-200 w-fit 
        cursor-pointer flex items-center font-header gap-2 font-semibold mb-2 
        opacity-80 hover:opacity-100"
        onClick={backButton}
        aria-label="Go back to all sections"
        title="Go back to all sections"
      >
        <FaArrowAltCircleLeft className="size-5" /> Back
      </button>

      <p
        className="self-center mb-6 text-sm text-center px-4 py-1 bg-background 
      font-body-secondary text-primary w-fit rounded-lg font-semibold"
      >
        Drag any image into your board to make a copy!{" "}
      </p>
      <SectionHeader
        section={selectedSection}
        canEdit={true}
        scope="mirror"
        // username={selectedSection.username}
      />

      <SectionGallery
        isMirror={true}
        section={selectedSection}
        columns={columns}
        canEdit={true}
      />
    </div>
  );
}
