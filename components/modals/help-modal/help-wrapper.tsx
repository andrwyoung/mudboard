import { useState } from "react";
import { FaQuestion } from "react-icons/fa6";
import HelpModal from "./help-modal";
import { useDemoStore } from "@/store/demo-store";

export default function HelpButton({ pageNum }: { pageNum: number }) {
  const [helpOpen, setHelpOpen] = useState(false);

  const isDemo = useDemoStore((s) => s.isDemoBoard);

  return (
    <>
      {!isDemo && (
        <>
          <button
            onClick={() => setHelpOpen(true)}
            type="button"
            title="Help / Support"
            className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-50 p-1.5 bg-white 
               border-primary text-primary-darker rounded-full hover:border-accent
              shadow hover:bg-accent transition-all duration-200 text-sm cursor-pointer"
          >
            <FaQuestion />
          </button>
          <HelpModal open={helpOpen} setOpen={setHelpOpen} pageNum={pageNum} />
        </>
      )}
    </>
  );
}
