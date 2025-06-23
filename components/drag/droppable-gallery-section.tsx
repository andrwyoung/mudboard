// this is the green overlay when you drag 2 or more images over a section
// it's important only because it lets people know that you can drop into sections

import { useGetScope } from "@/hooks/use-get-scope";
import { useDroppable } from "@dnd-kit/core";
import React from "react";

export default function DroppableGallerySection({
  canEdit,
  sectionId,
  isLinked,
  isMirror,
  isActive,
  isExternalDrag,
}: {
  canEdit: boolean;
  sectionId: string;
  isLinked: boolean;
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
      ref={canEdit ? setNodeRef : undefined}
      className={`absolute inset-0 z-50 pointer-events-none rounded-sm border-2 ${
        (realIsOver && isActive) || isExternalDrag
          ? isLinked
            ? "bg-secondary border-secondary opacity-50 "
            : "bg-accent border-accent opacity-30 "
          : "border-transparent"
      }`}
    />
  );
}
