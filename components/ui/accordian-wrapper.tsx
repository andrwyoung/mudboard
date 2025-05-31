// this is the drop down component wrapper used in the sidebar
// I mainly wanted it to handle the animation

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { FaCaretDown } from "react-icons/fa";

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
        className={`flex flex-row gap-1 items-center transition-all duration-200
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
