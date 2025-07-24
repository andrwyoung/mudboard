import { useState } from "react";
import { FaFileDownload } from "react-icons/fa";

import ExportModal from "@/components/modals/export-modal";
import { Section } from "@/types/board-types";

export default function SectionDownloadButton({
  section,
}: {
  section: Section;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        title="Export Options"
        className="hover:text-accent hover:scale-105 transition-all duration-300 cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <FaFileDownload className="size-4.5" />
      </button>

      <ExportModal sections={[section]} open={open} setOpen={setOpen} />
    </>
  );
}
