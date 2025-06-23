// this is the wrapper that allows things to be dropped into columns

import { useDroppable } from "@dnd-kit/core";

export function DroppableColumn({
  canEdit,
  id,
  children,
  paddingLeft,
  paddingRight,
  sectionId,
  isMirror,
}: {
  canEdit: boolean;
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
      ref={canEdit ? setNodeRef : undefined}
      data-id={canEdit ? id : null}
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
