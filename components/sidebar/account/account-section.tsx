import { MdSync } from "react-icons/md";
import ClaimBoardSection from "@/components/sidebar/claim-board-section";
import LoginSection from "@/components/sidebar/login-section";
import LoggedInSection from "@/components/sidebar/logged-in-section";
import { useMetadataStore } from "@/store/metadata-store";
import { useLayoutStore } from "@/store/layout-store";
import { useState } from "react";
import { FaCaretDown } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

export function AccordianWrapper({
  title,
  children,
  titleClassName = "",
}: {
  title?: string;
  children: React.ReactNode;
  titleClassName?: string;
}) {
  const [showForm, setShowForm] = useState(false);
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`text-sm flex flex-row gap-1 items-center transition-all duration-200
            font-semibold cursor-pointer hover:underline hover:underline-offset-2 ${titleClassName}`}
        onClick={() => setShowForm((prev) => !prev)}
      >
        {title}
        <FaCaretDown
          className={`transition-transform  duration-300 ${
            showForm ? "rotate-180" : "rotate-0"
          }`}
        />
      </div>
      <AnimatePresence initial={false}>
        {showForm && (
          <motion.div
            key="login"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AccountSyncSection() {
  const board = useMetadataStore((s) => s.board);
  const accessLevel = useMetadataStore((s) => s.accessLevel);
  const layoutDirty = useLayoutStore((s) => s.layoutDirty);

  const [isSpinning, setIsSpinning] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {accessLevel === "UNCLAIMED" && board && (
        <AccordianWrapper title="This board is unclaimed. Anyone can edit">
          <ClaimBoardSection board={board} />
        </AccordianWrapper>
      )}

      {accessLevel === "CLAIMED_NOT_LOGGED_IN" && board && (
        <AccordianWrapper title="This Board is Claimed">
          <LoginSection board={board} />
        </AccordianWrapper>
      )}

      {accessLevel === "CLAIMED_LOGGED_IN" && board && (
        <LoggedInSection board={board} />
      )}

      {accessLevel !== "CLAIMED_NOT_LOGGED_IN" && (
        <div
          className="text-sm flex flex-row gap-1 items-center text-accent
        cursor-pointer w-fit group"
          onClick={async () => {
            if (isSpinning) return; // prevent double tapping

            setIsSpinning(true);
            const success = await useLayoutStore.getState().syncLayout();

            setTimeout(() => {
              setIsSpinning(false);

              if (success) toast.success("Successfully synced!");
              else toast.error("Failed to sync.");
            }, 1600); // matches animation duration
          }}
        >
          <MdSync
            className={`h-4.5 w-4.5 group-hover:scale-105 font-semibold
          ${isSpinning ? "animate-spin-twice" : "group-hover:rotate-12"}`}
          />
          <p className="font-semibold ">
            {isSpinning
              ? "Syncing..."
              : layoutDirty
              ? "Unsaved Changes"
              : "Synced!"}
          </p>
        </div>
      )}
    </div>
  );
}
