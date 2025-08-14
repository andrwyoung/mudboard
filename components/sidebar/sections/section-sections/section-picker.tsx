// UNUSED
// when you click "+ Add Section" this is the dialog that pops up

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
import { MudkitSelectButton } from "./OLD-mudkit-selectors";
import Link from "next/link";
import { buildMudboardLink } from "@/utils/build-mudboard-link";

import InfoTooltip from "@/components/ui/info-tooltip";

const accordianClass = "text-primary font-header text-md";

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
        <DialogTitle className="flex flex-col mb-4  text-primary">
          <div className="text-2xl font-semibold font-header">
            Add a Section to This Board
          </div>
          <div className="flex flex-row gap-4">
            <p className="text-sm">
              Reuse a section from another board, or create a brand new one.
            </p>
            <div className="flex">
              <InfoTooltip
                text={
                  "Sections can be reused across multiple boards. Any edits made in one board will instantly reflect in all others using the same section. Use this to keep shared content in sync across projects."
                }
              />
            </div>
          </div>
        </DialogTitle>

        <div className="space-y-4 max-h-[500px] overflow-y-auto p-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary">
          <AccordianWrapper
            title="My Sections"
            titleClassName={accordianClass}
            onCollapse={() => {
              requestAnimationFrame(() => {
                setSelectedSection(null);
              });
            }}
          >
            {groupedSections.length > 0 ? (
              <div className="mt-4">
                {groupedSections.map(([boardId, sections]) => (
                  <div key={boardId} className="flex flex-col mb-4">
                    <Link
                      href={buildMudboardLink(boardId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open Board in new tab"
                      className="text-md font-semibold mb-1 text-primary hover:text-accent 
                  transition-all duration-150 self-start"
                    >
                      {sections[0]?.board_title || "Untitled Board"}
                    </Link>
                    <div className="p-1 bg-primary-foreground/80 rounded-lg">
                      {sections.map((section) => (
                        <MudkitSelectButton
                          key={`${section.section_id} - ${boardId}`}
                          section={section}
                          isSelected={selectedSection === section.section_id}
                          onClick={() => {
                            setSelectedSection(section.section_id);
                          }}
                          onDoubleClick={() => {
                            if (selectedSection) onAddSection(selectedSection);
                            setOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-primary text-center text-sm font-medium py-2">
                No reusable sections found.
                <br /> Create boards and sections to reuse them here!
              </div>
            )}
          </AccordianWrapper>

          {allUserOrphanedSections.length > 0 && (
            <AccordianWrapper
              title="Boardless Sections"
              titleClassName={accordianClass}
              onCollapse={() => {
                requestAnimationFrame(() => {
                  setSelectedSection(null);
                });
              }}
            >
              <div className="flex flex-col bg-primary-foreground p-2 rounded-lg">
                {allUserOrphanedSections.map((section) => (
                  <MudkitSelectButton
                    key={section.section_id}
                    section={section}
                    isSelected={selectedSection === section.section_id}
                    onClick={() => {
                      setSelectedSection(section.section_id);
                    }}
                    onDoubleClick={() => {
                      if (selectedSection) onAddSection(selectedSection);
                      setOpen(false);
                    }}
                    isGrouped={false}
                  />
                ))}
              </div>
            </AccordianWrapper>
          )}
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
