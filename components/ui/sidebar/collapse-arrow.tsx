// this is the little button on the sidebar to collapse the sidebar

import { FaCaretLeft } from "react-icons/fa6";

export function CollapseArrow({
  left = true,
  onClick,
}: {
  left?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={`text-primary-text hover:text-accent hover:scale-110
          cursor-pointer transition-all duration-200`}
      onClick={onClick}
      title={!left ? "Collapse Sidebar" : "Open Sidebar"}
    >
      {left ? (
        <FaCaretLeft className="size-6 rotate-180" />
      ) : (
        <FaCaretLeft className="size-5" />
      )}
    </div>
  );
}
