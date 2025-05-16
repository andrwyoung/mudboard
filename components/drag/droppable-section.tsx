import { useDroppable } from "@dnd-kit/core";

export function DroppableSection({
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
      className={`rounded transition-colors duration-150 w-full ${
        isOver ? "bg-accent/40 border border-accent" : "bg-transparent"
      }`}
    >
      {children}
    </div>
  );
}
