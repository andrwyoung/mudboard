import { useDroppable } from "@dnd-kit/core";

export function DropIndicator({
  id,
  isActive,
  height,
  padding,
}: {
  id: string;
  isActive: boolean;
  height?: number;
  padding?: "bottom" | "above";
}) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      data-id={id}
      className={`w-full transition-all duration-150 ease-in-out ${
        isActive || padding ? "bg-primary rounded" : "bg-orange-200"
      } ${!height ? "flex-1" : ""}`}
      style={{
        height: height ?? undefined, // only apply inline height if it's provided
      }}
    />
  );
}
