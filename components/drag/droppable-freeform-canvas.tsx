import { useDroppable } from "@dnd-kit/core";

export function DroppableFreeformCanvas({
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
    <div ref={setNodeRef} data-id={id} className="relative w-full h-full">
      {/* Optional overlay */}
      {isOver && (
        <div className="absolute inset-0 z-50 bg-accent opacity-30 pointer-events-none" />
      )}
      {children}
    </div>
  );
}
