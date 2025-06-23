// the title is confusing, but you know how in the sidebar you can drop images into the
// section headers? well this is the thing that lets you do that

import { useDroppable } from "@dnd-kit/core";

export function DroppableForImages({
  canEdit,
  id,
  children,
  highlighted,
  isLinked,
  sectionId,
}: {
  canEdit: boolean;
  id: string;
  children: React.ReactNode;
  highlighted: boolean;
  isLinked: boolean;
  sectionId: string;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      sectionId,
    },
  });

  // const isSidebar =

  return (
    <div
      ref={canEdit ? setNodeRef : undefined}
      data-id={canEdit ? id : undefined}
      className={`border rounded-sm transition-colors duration-150 w-full px-1 ${
        isOver || highlighted
          ? isLinked
            ? "bg-secondary/40 border-secondary"
            : "bg-accent/40 border-accent"
          : "bg-transparent border-transparent"
      }`}
    >
      {children}
    </div>
  );
}
