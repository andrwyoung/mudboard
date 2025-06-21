import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Section } from "@/types/board-types";
import { FaShareAlt, FaLink } from "react-icons/fa";
import { supabase } from "@/utils/supabase";
import { useMetadataStore } from "@/store/metadata-store";
import { CheckField } from "@/components/ui/check-field";

const SECTION_BASE_URL = "https://mudboard.com/section";

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
    label: "Feature on Marketplace",
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

export default function SectionShareDialog({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);

  const published = section.is_public;
  const user = useMetadataStore.getState().user;

  const updateField = async (
    field: ShareableSectionField,
    value: boolean,
    toastText: { on: string; off: string }
  ) => {
    if (user?.id !== section.owned_by) {
      console.warn("Incorrect User, not saving");
      return;
    }

    const updates: Record<string, boolean | string> = { [field]: value };

    if (
      field === "is_public" &&
      value === true &&
      !section.first_published_at
    ) {
      updates.first_published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("sections")
      .update(updates)
      .eq("section_id", section.section_id);
    if (error) {
      toast.error(`Failed to update ${field}`);
      return;
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
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${SECTION_BASE_URL}/${section.section_id}`);
    toast.success("Share link copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          title="Open Sharing Options"
          className="text-primary hover:text-accent cursor-pointer transition-all duration-200 mr-1"
        >
          <FaShareAlt className="size-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="text-primary select-none">
        <DialogHeader>
          <DialogTitle className="text-xl">Publish as a Mudkit</DialogTitle>
        </DialogHeader>

        {published ? (
          <div>
            <p className="text-sm">This Section has been published.</p>
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
          </div>
        ) : (
          <div className="text-sm text-primary leading-relaxed my-3 space-y-4">
            <div>
              <p className="text-sm text-primary mt-1">
                Mudkits are reusable, shareable reference kits. You can publish
                this section to share it with others — or just reuse it in your
                own boards.
              </p>
            </div>

            <div className="mt-2">
              <strong className="block">What happens when you publish?</strong>
              <ul className="list-disc list-inside text-xs text-muted-foreground mt-1 space-y-1">
                <li>Your kit gets its own public link</li>
                <li>Only you can edit the original section</li>
                <li>You can unpublish or make it private anytime</li>
                <li>
                  If shared on the marketplace, others can fork or clone your
                  kit <br />
                  <span className="text-muted-foreground italic">
                    (advanced controls available with pro plan)
                  </span>
                </li>
              </ul>
            </div>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
