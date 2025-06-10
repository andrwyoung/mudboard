// this is the little button on the sidebar to collapse the sidebar

import { FiSidebar } from "react-icons/fi";
import { IoCaretBackOutline } from "react-icons/io5";

export function CollapseArrow({
  left = true,
  onClick,
}: {
  left?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`text-white hover:text-accent hover:scale-110
          cursor-pointer transition-all duration-200
          ${left ? "rotate-180" : ""}`}
      onClick={onClick}
      title={!left ? "Collapse Sidebar" : "Open Sidebar"}
    >
      {left ? (
        <FiSidebar className="size-5.5" />
      ) : (
        <IoCaretBackOutline className="size-5" />
      )}
    </div>
  );
}
