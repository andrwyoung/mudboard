"use client";

import { FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useMetadataStore } from "@/store/metadata-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserBoardSection } from "@/types/board-types";
import { getOrphanedSectionsForUser } from "@/lib/db-actions/user-sections.tsx/fetch-user-orphaned-sections";
import { SectionWithStats } from "@/types/stat-types";
import { getUserBoardSections } from "@/lib/db-actions/user-sections.tsx/fetch-user-board-sections";
import { AccordianWrapper } from "@/components/ui/accordian-wrapper";

const accordianClass = "text-primary font-header text-xl";

export default function SectionPickerDialog({
  open,
  setOpen,
  onAddSection,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
  onAddSection: (section: string | null) => void;
}) {
  const [allUserOrphanedSections, setAllUserOrphanedSections] = useState<
    SectionWithStats[]
  >([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [groupedSections, setGroupedSections] = useState<
    [string, UserBoardSection[]][]
  >([]);

  const user = useMetadataStore((s) => s.user);
  const boardSections = useMetadataStore((s) => s.boardSections);

  useEffect(() => {
    if (!open || !user) return;

    const fetchSections = async () => {
      try {
        const data = await getUserBoardSections(user.id);
        const currentSectionIds = new Set(
          boardSections.map((bs) => bs.section.section_id)
        );

        const grouped = data.reduce<Record<string, UserBoardSection[]>>(
          (acc, userBoardSection) => {
            // skip sections already currently in the board
            if (currentSectionIds.has(userBoardSection.section_id)) {
              return acc;
            }

            const boardId = userBoardSection.board_id;
            if (!acc[boardId]) acc[boardId] = [];
            acc[boardId].push(userBoardSection);
            return acc;
          },
          {}
        );
        const sortedEntries = Object.entries(grouped)
          .map(([boardId, sections]): [string, UserBoardSection[]] => [
            boardId,
            sections.sort((a, b) => a.order_index - b.order_index),
          ])
          .sort(([, aSections], [, bSections]) => {
            const aDate = new Date(aSections[0]?.created_at ?? 0);
            const bDate = new Date(bSections[0]?.created_at ?? 0);
            return bDate.getTime() - aDate.getTime();
          });

        setGroupedSections(sortedEntries);

        const fetchedSections = await getOrphanedSectionsForUser(user.id);
        setAllUserOrphanedSections(fetchedSections);
      } catch (err) {
        console.error("Failed to fetch board sections", err);
      }
    };

    fetchSections();
  }, [boardSections, open, setAllUserOrphanedSections, user]);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) setSelectedSection(null); // reset when closing
      }}
    >
      <DialogContent className="rounded-md bg-background p-6 max-w-md w-full">
        <DialogTitle className="flex flex-col mb-4 gap-1 text-primary">
          <div className="text-xl font-semibold">Choose a Section To Add:</div>
          <p className="text-sm">
            Choose to add a section from another section, or make a Blank
            Section
          </p>
        </DialogTitle>

        <div className="space-y-4 max-h-[500px] overflow-y-auto p-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary">
          <AccordianWrapper title="My Boards" titleClassName={accordianClass}>
            {groupedSections.map(([boardId, sections]) => (
              <div key={boardId} className="mb-4">
                <h2 className="text-md font-semibold mb-1 text-primary">
                  {sections[0]?.board_title || "Untitled Board"}
                </h2>
                <div className="p-1 bg-white/80 rounded-lg">
                  {sections.map((section) => (
                    <button
                      key={section.section_id}
                      type="button"
                      className={`w-full justify-start border-2 border-transparent text-primary font-header
                      cursor-pointer rounded-md hover:bg-accent hover:border-accent
                      transition-all duration-50 px-2 py-1 
                      ${
                        selectedSection === section.section_id
                          ? "bg-accent text-primary"
                          : "bg-transparent text-primary"
                      }`}
                      onClick={() => {
                        setSelectedSection(section.section_id);
                        if (process.env.NODE_ENV === "development") {
                          navigator.clipboard.writeText(section.section_id);
                        }
                      }}
                    >
                      <div className="flex flex-row justify-between items-center">
                        <div>
                          <h3
                            className={`text-sm ${
                              section.section_title ? "" : "italic opacity-80"
                            }`}
                          >
                            {section.section_title || "Untitled Section"}
                          </h3>
                        </div>

                        <div className="flex flex-row gap-2 items-center">
                          <p className="font-header font-semibold text-xs">
                            Blocks: {section.block_count}
                          </p>
                          <div
                            title={
                              section.shallow_copy_count <= 1
                                ? "Only copy"
                                : "This Section used in multiple boards"
                            }
                            className={` w-2 h-2 rounded-full translate-y-[1px] ${
                              section.shallow_copy_count <= 1
                                ? "bg-primary"
                                : "bg-secondary"
                            }`}
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </AccordianWrapper>

          <AccordianWrapper
            title="Orphaned Sections"
            titleClassName={accordianClass}
          >
            <div className="flex flex-col gap-2">
              {allUserOrphanedSections.length > 0 &&
                allUserOrphanedSections.map((section) => (
                  <button
                    key={section.section_id}
                    type="button"
                    className={`w-full justify-start border-2 border-transparent text-white font-header
                    cursor-pointer rounded-md hover:bg-accent hover:border-accent
                    transition-all duration-50 px-2 py-2 
                    ${
                      selectedSection === section.section_id
                        ? "bg-accent text-primary"
                        : "bg-primary"
                    }`}
                    onClick={() => {
                      setSelectedSection(section.section_id);
                      if (process.env.NODE_ENV === "development") {
                        navigator.clipboard.writeText(section.section_id);
                      }
                    }}
                  >
                    <div className="flex flex-row justify-between">
                      <h3>{section.title || "Untitled Section"}</h3>
                      <p className="text-sm">
                        Boards using this section: {section.personal_copy_count}
                      </p>
                      {false && process.env.NODE_ENV === "development" && (
                        <p className="text-xs">{section.section_id}</p>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          </AccordianWrapper>
        </div>

        <DialogFooter className="flex justify-center w-full mt-6">
          <div className="flex flex-col gap-2 w-fit self-center font-header">
            <Button
              variant={"outline_primary"}
              onClick={() => {
                onAddSection(null);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4"
            >
              Create Blank Section
            </Button>
            <Button
              onClick={() => {
                if (selectedSection) onAddSection(selectedSection);
                setOpen(false);
              }}
              className="w-full flex items-center gap-2 border-2 hover:border-accent"
              disabled={!selectedSection}
            >
              <FaPlus className="size-3" />
              Add Section
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
