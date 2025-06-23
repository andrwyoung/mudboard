// this is the wrapper that lets you drag and drop a block

import { useSortable } from "@dnd-kit/sortable";

export function SortableBlock({
  canEdit,
  children,
  id,
  sectionId,
  isMirror,
}: {
  canEdit: boolean;
  children: React.ReactNode;
  id: string;
  sectionId: string;
  isMirror: boolean;
}) {
  const { attributes, listeners, setNodeRef } = useSortable({
    id,
    data: {
      sectionId,
      isMirror,
    },
  });

  return (
    <div
      ref={canEdit ? setNodeRef : undefined}
      {...(canEdit ? attributes : {})}
      {...(canEdit ? listeners : {})}
    >
      {children}
    </div>
  );
}
