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
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      data-id={id}
      className={`flex ${isOver ? "bg-accent/40 border-accent" : ""}`}
    >
      {children}
    </div>
  );
}
