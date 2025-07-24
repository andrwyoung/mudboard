import { useState } from "react";
import { FaFileDownload } from "react-icons/fa";

import ExportModal from "@/components/modals/export-modal";
import { useMetadataStore } from "@/store/metadata-store";

export default function BoardDownloadButton() {
  const [open, setOpen] = useState(false);

  const boardSections = useMetadataStore((s) => s.boardSections);
  const sections = boardSections.map((b) => b.section);

  return (
    <>
      <button
        title="Download Board"
        className="flex items-center gap-1 cursor-pointer mt-2 mb-1 text-white text-sm font-bold font-header
                 hover:text-accent transition-all duration-100"
        onClick={() => setOpen(true)}
      >
        <FaFileDownload className="" />
        Export Sections (ZIP)
      </button>

      <ExportModal sections={sections} open={open} setOpen={setOpen} />
    </>
  );
}
