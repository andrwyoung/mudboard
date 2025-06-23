// the title is confusing, but you know how in the sidebar you can drop images into the
// section headers? well this is the thing that lets you do that

import { useDroppable } from "@dnd-kit/core";

export function DroppablePanel({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: "pinned-panel-dropzone",
  });

  return (
    <div
      ref={setNodeRef}
      data-id={id}
      className={`absolute inset-0 z-100 opacity-50  ${
        isOver ? "bg-accent" : "hidden"
      } `}
    >
      {children}
    </div>
  );
}
