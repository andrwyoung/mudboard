import { useSortable } from "@dnd-kit/sortable";

export function SortableItem({
  children,
  id,
  sectionId,
  isMirror,
}: {
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
    <div ref={setNodeRef} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
