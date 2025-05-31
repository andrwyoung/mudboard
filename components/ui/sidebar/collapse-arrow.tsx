// this is the little button on the sidebar to collapse the sidebar

import { FaOutdent } from "react-icons/fa6";
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
        <FaOutdent className="size-5" />
      ) : (
        <IoCaretBackOutline className="size-5" />
      )}
    </div>
  );
}
