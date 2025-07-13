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
import { FaLink, FaLeaf } from "react-icons/fa";
import { supabase } from "@/lib/supabase/supabase-client";
import { useMetadataStore } from "@/store/metadata-store";
import { CheckField } from "@/components/ui/check-field";
import { SECTION_BASE_URL } from "@/types/constants";
import { FaCopy, FaSeedling } from "react-icons/fa6";
import { BeanIcon } from "@/components/ui/bean-icon";
import { AccordianWrapper } from "@/components/ui/accordian-wrapper";
import { useExploreStore } from "@/store/explore-store";
import { SectionWithStats } from "@/types/stat-types";
import { useLayoutStore } from "@/store/layout-store";
import { useDemoStore } from "@/store/demo-store";
import { fireUserConfetti } from "@/lib/db-actions/fire-user-confetti";

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

    // don't allow publishing sections without any blocks
    if (field === "is_public" && value) {
      const numBlocks = useLayoutStore
        .getState()
        .sectionColumns[section.section_id].flat().length;
      if (numBlocks === 0) {
        toast.error("Please at least add 1 block");
        return;
      }
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

    useMetadataStore.setState((s) => ({
      boardSections: s.boardSections.map((bs) =>
        bs.section.section_id === section.section_id
          ? {
              ...bs,
              section: {
                ...bs.section,
                ...updates, // includes field and possibly first_published_at
              },
            }
          : bs
      ),
    }));

    toast.success(value ? toastText.on : toastText.off);
    if (isFirstMarketplacePublish) {
      fireUserConfetti(); // 🎉 Celebrate!
    }

    // DEMO: handle temporary Mudkits
    if (!section.owned_by && field === "is_public") {
      const { tempMudkits, setTempMudkits } = useExploreStore.getState();

      if (value) {
        useDemoStore.getState().fireConfetti();

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
          title={section.is_public ? "Open Sharing Options" : "Plant a Mudkit"}
          aria-label={"Open Sharing Options"}
          className="hover:text-accent cursor-pointer transition-all duration-200 "
        >
          {section.is_public ? (
            section.is_on_marketplace ? (
              <FaSeedling className="size-4.5 mr-[1px]" />
            ) : (
              <FaLeaf className="size-5 mr-[1px]" />
            )
          ) : (
            <BeanIcon className="size-5 mr-[1px] -translate-y-[2px]" />
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
              {section.is_public ? "Mudkit Settings" : "Publish as a Mudkit"}
            </DialogTitle>
          </DialogHeader>

          {published ? (
            <div>
              <p className="text-sm">
                This Section is published as a Mudkit. Find it in the
                <FaLeaf className="inline -translate-y-[1px] ml-1 mr-0.5" />{" "}
                <strong>Greenhouse</strong>
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
                <div className="text-sm mt-8 mb-8 text-center italic">
                  <p className="">
                    This is a <strong>temporary</strong> Mudkit.
                  </p>
                  <p>
                    Make an account and <strong>save board</strong> to share and
                    reuse.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-primary leading-relaxed mt-3 space-y-4">
              <div>
                <p className="text-sm text-primary mt-1 mb-12">
                  Mudkits are{" "}
                  <strong>reusable, shareable reference kits</strong>. Share it
                  with others — or just reuse it in your own boards.
                </p>
              </div>

              <AccordianWrapper title="What happens when you publish?">
                <ul className="list-disc list-inside text-xs text-primary space-y-1">
                  <li>Your kit gets its own public link</li>
                  <li>
                    If shared to community, others can use it in their
                    Greenhouse.
                  </li>
                  <li>Only you can edit the original section</li>
                  <li>You can unpublish or make it private anytime</li>
                </ul>
              </AccordianWrapper>
            </div>
          )}

          <DialogFooter>
            <div className="flex items-center gap-3 pt-2 text-sm font-header">
              <Button
                onClick={() =>
                  updateField("is_public", !published, {
                    on: "Mudkit Published!",
                    off: "Mudkit Unpublished.",
                  })
                }
              >
                {published ? "Unpublish" : "Publish Mudkit!"}
              </Button>
              {published && (
                <Button variant="secondary" onClick={copyLink}>
                  <FaLink />
                  Copy Share Link
                </Button>
              )}
            </div>
            <p className="text-xs mt-1">
              {!section.owned_by &&
                !published &&
                "This board hasn’t been saved yet — your Mudkit will be temporary."}
            </p>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
