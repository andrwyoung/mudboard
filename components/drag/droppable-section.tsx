import { useDroppable } from "@dnd-kit/core";

export function DroppableForImages({
  id,
  children,
  highlighted,
  sectionId,
}: {
  id: string;
  children: React.ReactNode;
  highlighted: boolean;
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
      ref={setNodeRef}
      data-id={id}
      className={`border  rounded transition-colors duration-150 w-full px-1 ${
        isOver || highlighted
          ? "bg-accent/40 border border-accent"
          : "bg-transparent border-transparent"
      }`}
    >
      {children}
    </div>
  );
}
