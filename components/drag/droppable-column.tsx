import { useDroppable } from "@dnd-kit/core";

export function DroppableColumn({
  id,
  children,
  paddingLeft,
  paddingRight,
  sectionId,
  isMirror,
}: {
  id: string;
  children: React.ReactNode;
  paddingLeft: number;
  paddingRight: number;
  sectionId: string;
  isMirror: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      sectionId,
      isMirror,
    },
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
