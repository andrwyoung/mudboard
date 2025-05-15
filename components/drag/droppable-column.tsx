import { useDroppable } from "@dnd-kit/core";

export function DroppableColumn({
  id,
  children,
  paddingLeft,
  paddingRight,
}: {
  id: string;
  children: React.ReactNode;
  paddingLeft: number;
  paddingRight: number;
}) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      data-id={id}
      className={`flex flex-col transition-colors `}
      style={{
        paddingLeft,
        paddingRight,
      }}
    >
      {children}
    </div>
  );
}
