import { useDroppable } from "@dnd-kit/core";

export function DroppableColumn({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div ref={setNodeRef} data-id={id}>
      {children}
    </div>
  );
}
