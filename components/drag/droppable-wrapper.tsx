import { useDroppable } from "@dnd-kit/core";

export function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      data-id={id}
      className={`flex flex-col transition-colors py-8 ${
        isOver ? "outline-2 outline-secondary" : "bg-transparent"
      }`}
    >
      {children}
    </div>
  );
}
