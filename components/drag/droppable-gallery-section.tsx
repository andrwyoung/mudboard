// this is the green overlay when you drag 2 or more images over a section
// it's important only because it lets people know that you can drop into sections

import { useGetScope } from "@/hooks/use-get-scope";
import { useDroppable } from "@dnd-kit/core";
import React from "react";

export default function DroppableGallerySection({
  sectionId,
  isMirror,
  isActive,
  isExternalDrag,
}: {
  sectionId: string;
  isMirror: boolean;
  isActive: boolean;
  isExternalDrag: boolean;
}) {
  const scope = useGetScope();

  const { setNodeRef, isOver, over } = useDroppable({
    id: `gallery-${scope}-${sectionId}`,
  });

  const realIsOver =
    isOver ||
    (over?.data.current?.sectionId === sectionId &&
      over?.data.current?.isMirror === isMirror);

  return (
    <div
      ref={setNodeRef}
      className={`absolute inset-0 z-50 pointer-events-none rounded-sm border-2 opacity-30 ${
        (realIsOver && isActive) || isExternalDrag
          ? "bg-accent  border-accent"
          : "border-transparent"
      }`}
    />
  );
}
