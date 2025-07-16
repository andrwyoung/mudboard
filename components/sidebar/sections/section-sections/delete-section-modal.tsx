import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DEFAULT_SECTION_NAME } from "@/types/constants";
import { BoardSection } from "@/types/board-types";
import { isLinkedSection } from "@/utils/is-linked-section";
import { canEditSection } from "@/lib/auth/can-edit-section";
import { softDeleteBoardSection } from "@/lib/db-actions/soft-delete-board-section";
import { useMetadataStore } from "@/store/metadata-store";

export function DeleteBoardSectionModal({
  boardSection,
  onClose,
}: {
  boardSection: BoardSection;
  onClose: () => void;
}) {
  const user = useMetadataStore((s) => s.user);
  const unLink =
    isLinkedSection(boardSection) || !canEditSection(boardSection.section);

  return (
    <AlertDialog
      open={!!boardSection}
      onOpenChange={(open) => !open && onClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-primary">
            {unLink ? "Unlink" : "Delete"} &quot;
            {boardSection.section.title ?? DEFAULT_SECTION_NAME}
            &quot;?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {unLink ? (
              <span>
                This will remove the section from this board, but keep it
                available for reuse elsewhere.
              </span>
            ) : (
              <span>
                This is the only remaining copy of this section. Deleting it
                will permanently remove the section and all its blocks. This
                action cannot be undone.
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="font-semibold">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="font-semibold"
            variant={unLink ? "kinda_good" : "destructive"}
            onClick={() => {
              softDeleteBoardSection(boardSection, user?.id);
              onClose();
            }}
          >
            {unLink ? "Unlink Section" : "Delete Section"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
