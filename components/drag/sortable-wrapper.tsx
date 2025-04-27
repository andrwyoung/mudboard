import { useSortable } from "@dnd-kit/sortable";

export function SortableImageItem({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const { attributes, listeners, setNodeRef } = useSortable({ id });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
