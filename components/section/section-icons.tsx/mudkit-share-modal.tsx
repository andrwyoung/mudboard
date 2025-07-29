import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Section } from "@/types/board-types";
import { supabase } from "@/lib/supabase/supabase-client";
import { useMetadataStore } from "@/store/metadata-store";
import { CheckField } from "@/components/ui/check-field";
import { SECTION_BASE_URL } from "@/types/constants";
import { FaBookBookmark, FaCopy } from "react-icons/fa6";
import { useExploreStore } from "@/store/explore-store";
import { SectionWithStats } from "@/types/stat-types";
import { useLayoutStore } from "@/store/layout-store";
import { useDemoStore } from "@/store/demo-store";
import { fireUserConfetti } from "@/lib/db-actions/fire-user-confetti";
import { IoLibrary } from "react-icons/io5";
import { usePanelStore } from "@/store/panel-store";

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

export default function SectionShareModal({
  section,
  canEdit,
}: {
  section: Section;
  canEdit: boolean;
}) {
  const [open, setOpen] = useState(false);

  const published = section.is_public;
  const user = useMetadataStore.getState().user;

  const copyLink = () => {
    navigator.clipboard.writeText(`${SECTION_BASE_URL}/${section.section_id}`);
    toast.success("Share link copied to clipboard");
  };

  const updateField = async (
    field: ShareableSectionField,
    value: boolean,
    toastText: { on: string; off: string }
  ) => {
    if (section.owned_by && user?.id !== section.owned_by) {
      console.warn("Incorrect User, not saving");
      return;
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

    // DEMO: handle temporary Mudkits
    if (!section.owned_by && field === "is_public") {
      // tutorial specific
      useDemoStore.getState().markMissionComplete("mudkit");
      useExploreStore.getState().setExploreMode("search");
      usePanelStore.getState().setPanelMode("explore");

      const { tempMudkits, setTempMudkits } = useExploreStore.getState();

      if (value) {
        // useDemoStore.getState().fireConfetti();

        // Prevent duplicate entries
        const alreadyExists = tempMudkits.some(
          (s) => s.section_id === section.section_id
        );
        if (!alreadyExists) {
          const mudkit: SectionWithStats = {
            ...section,
          };
          setTempMudkits([...tempMudkits, mudkit]);
        }
      } else {
        // Remove the section from tempMudkits
        const filtered = tempMudkits.filter(
          (s) => s.section_id !== section.section_id
        );
        setTempMudkits(filtered);
      }
    }
  };

  return (
    <>
      {canEdit ? (
        <button
          onClick={() => setOpen(true)}
          type="button"
          title={
            section.is_public
              ? "Open Section Settings"
              : `Add ${
                  section.title ? `"${section.title}"` : "Untitled Section"
                } To Library`
          }
          aria-label={"Open Sharing Options"}
          className="hover:text-accent cursor-pointer transition-all duration-200 mr-[2px]"
        >
          {section.is_public ? (
            <IoLibrary className="size-5" />
          ) : (
            <FaBookBookmark className="size-4.5" />
          )}
        </button>
      ) : (
        <button
          title="Copy Sharing Link"
          onClick={copyLink}
          className={`hover:text-accent cursor-pointer transition-all duration-200
            ${section.is_public ? "" : "hidden"}`}
        >
          <FaCopy className="size-5" />
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
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
              {section.owned_by ? (
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
                  <strong>Add this section</strong> to your Library to reuse
                  these images in other boards or projects.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <div className="flex items-center gap-3 pt-2 text-sm font-header">
              <Button
                className="text-lg px-4"
                onClick={() => {
                  // first check that we even have blocks
                  const numBlocks = useLayoutStore
                    .getState()
                    .sectionColumns[section.section_id].flat().length;

                  if (numBlocks === 0) {
                    toast.error("Please at least add 1 block");
                    return;
                  }

                  updateField("is_public", !published, {
                    on: "Section Added to Library!",
                    off: "Section Removed from Library.",
                  });
                }}
              >
                {published ? "Unpublish" : "Add to Library!"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
