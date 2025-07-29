import { useModalStore } from "@/store/modal-store";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { useLayoutStore } from "@/store/layout-store";
import { IoLibrary } from "react-icons/io5";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { CheckField } from "../ui/check-field";
import { fireUserConfetti } from "@/lib/db-actions/fire-user-confetti";
import { supabase } from "@/lib/supabase/supabase-client";
import { useDemoStore } from "@/store/demo-store";
import { useMetadataStore } from "@/store/metadata-store";
import { handleLibrarySync } from "./share/handle-add-library";

type ShareableSectionField =
  | "is_public"
  | "is_forkable"
  | "is_linkable"
  | "is_on_marketplace";

type ShareOption = {
  label: string;
  desc: string;
  field: ShareableSectionField;
  gated?: string;
  flip?: boolean;
  disabled?: boolean;
};

const shareOptions: ShareOption[] = [
  {
    label: "Share with Community",
    desc: "Let others discover this kit publicly",
    field: "is_on_marketplace",
    gated: "License required (Free in Beta)",
  },
  {
    label: "Prevent Copies",
    desc: "Stop others from duplicating this kit into their own boards.",
    field: "is_forkable",
    gated: "Pro plan",
    flip: true,
    disabled: true,
  },
  {
    label: "Disable Live Embeds",
    desc: "Stop others from embedding this kit with live updates.",
    field: "is_linkable",
    gated: "Pro plan",
    flip: true,
    disabled: true,
  },
];

export default function SectionShareModal() {
  const shareModalIsOpen = useModalStore((s) => s.shareModalIsOpen);
  const closeShareModal = useModalStore((s) => s.closeShareModal);
  const shareModalSectionId = useModalStore((s) => s.shareModalSectionId);

  const user = useMetadataStore.getState().user;
  const boardSectionMap = useMetadataStore((s) => s.boardSectionMap);

  const isDemo = useDemoStore((s) => s.isDemoBoard);

  // grab the real boardSection
  if (!shareModalSectionId) return null;
  const entry = boardSectionMap[shareModalSectionId];
  if (!entry || !entry.section) return null;

  const section = entry.section;
  const published = section.is_public;

  async function updateField(
    field: ShareableSectionField,
    value: boolean,
    toastText: { on: string; off: string }
  ) {
    if (section.owned_by && user?.id !== section.owned_by) {
      console.warn("Incorrect User, not saving");
      return;
    }

    // block if trying to publish to marketplace and it's less than 10 blocks
    const isTryingToPublishToMarketplace =
      field === "is_on_marketplace" &&
      value === true &&
      section.is_public &&
      !section.is_on_marketplace;

    if (isTryingToPublishToMarketplace) {
      const numBlocks =
        useLayoutStore.getState().sectionColumns[section.section_id]?.flat()
          .length ?? 0;

      if (numBlocks < 10) {
        toast.error(
          "Add at least 10 blocks before sharing to the Marketplace."
        );
        return;
      }
    }

    const updates: Record<string, boolean | string> = { [field]: value };

    const isFirstMarketplacePublish =
      field === "is_on_marketplace" &&
      value === true &&
      !section.first_published_at;

    if (isFirstMarketplacePublish) {
      updates.first_published_at = new Date().toISOString();
    }

    if (section.owned_by) {
      const { error } = await supabase
        .from("sections")
        .update(updates)
        .eq("section_id", section.section_id);
      if (error) {
        toast.error(`Failed to update ${field}`);
        return;
      }
    }

    // mark locally
    useMetadataStore.getState().updateBoardSection(section.section_id, updates);

    toast.success(value ? toastText.on : toastText.off);
    if (isFirstMarketplacePublish) {
      fireUserConfetti(); // 🎉 Celebrate!
    }
  }

  return (
    <Dialog open={shareModalIsOpen} onOpenChange={closeShareModal}>
      <DialogContent className="text-primary select-none">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {section.is_public
              ? `${
                  section.title ? `"${section.title}"` : "Untitled"
                } Section Settings`
              : `Add ${
                  section.title ? `"${section.title}"` : "Untitled Section"
                } To Library`}
          </DialogTitle>
        </DialogHeader>

        {published ? (
          <div>
            <p className="text-sm">
              This Section is saved in your <strong>Library</strong>
              <IoLibrary className="inline -translate-y-[2px] ml-1 mr-0.5" />{" "}
            </p>
            {!isDemo ? (
              <div className="flex flex-col gap-4 mt-2">
                {shareOptions.map(
                  ({ label, desc, field, gated, flip, disabled }) => (
                    <div className="flex flex-col" key={field + label}>
                      <CheckField
                        isChecked={
                          flip ? !section[field] : section[field] ?? false
                        }
                        onChange={(val) =>
                          updateField(field, flip ? !val : val, {
                            on: `${label} enabled`,
                            off: `${label} disabled`,
                          })
                        }
                        text={label}
                        isDisabled={disabled}
                      />
                      <div className={`text-xs text-muted-foreground pl-6`}>
                        {desc}
                        {gated && (
                          <span className="ml-2 italic text-[11px] text-emerald-600">
                            {gated}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="text-sm my-8 text-center italic">
                <p>Congrats saving your first Section!!</p>
                <p>You should see it now in your personal Library.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-primary leading-relaxed mt-3 space-y-4">
            <div>
              <p className="text-sm text-primary mt-1 mb-8 leading-relaxed">
                <strong>Add this section</strong> to your Library to reuse these
                images in other boards or projects.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <div className="flex items-center gap-3 pt-2 text-sm font-header">
            <Button
              className="text-lg px-4"
              onClick={async () => {
                const currentPublishState = published;

                // first check that we even have blocks
                // const numBlocks = useLayoutStore
                //   .getState()
                //   .sectionColumns[section.section_id].flat().length;

                // if (numBlocks === 0) {
                //   toast.error("Please at least add 1 block");
                //   return;
                // }

                await updateField("is_public", !currentPublishState, {
                  on: "Section Added to Library!",
                  off: "Section Removed from Library.",
                });

                await handleLibrarySync(section, !currentPublishState, isDemo);
              }}
            >
              {published ? "Unpublish" : "Add to Library!"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
