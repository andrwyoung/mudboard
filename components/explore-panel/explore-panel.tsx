"use client";

import { useEffect, useState } from "react";
import { useMetadataStore } from "@/store/metadata-store";
import { BoardWithStats, SectionWithStats } from "@/types/stat-types";
import { SectionSelectButton } from "@/components/sidebar/section-sections/section-picker-groupings";
import { buildMudboardLink } from "@/utils/build-mudboard-link";
import Link from "next/link";
import fetchMudkits from "@/lib/db-actions/explore/get-mudkits";
import { getUserBoardsWithStats } from "@/lib/db-actions/explore/get-user-board-with-stats";

export default function ExplorePanel() {
  const user = useMetadataStore((s) => s.user);

  const [userBoards, setUserBoards] = useState<BoardWithStats[]>([]);
  const [mudkits, setMudkits] = useState<SectionWithStats[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetch = async () => {
      try {
        const boards = await getUserBoardsWithStats(user.id);
        setUserBoards(boards);

        const mudkits = await fetchMudkits();
        setMudkits(mudkits);
      } catch (err) {
        console.error("Explore panel fetch error", err);
      }
    };

    fetch();
  }, [user]);

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* --- YOUR BOARDS --- */}
      <div>
        <h3 className="text-primary text-md font-bold mb-2">My Boards</h3>
        {userBoards.map((board) => (
          <div key={board.board_id} className="mb-4">
            <Link
              href={buildMudboardLink(board.board_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary hover:text-accent"
            >
              {board.title || "Untitled Board"}
            </Link>
            {/* <div className="p-1 bg-muted rounded-lg mt-1">
              {sections.map((section) => (
                <SectionSelectButton
                  key={section.section_id}
                  section={section}
                  onClick={() => {
                    // preview or pin to panel
                  }}
                />
              ))}
            </div> */}
          </div>
        ))}
      </div>

      {/* --- PUBLIC MUDKITS --- */}
      <div>
        <h3 className="text-primary text-md font-bold mb-2">Explore Mudkits</h3>
        <div className="p-1 bg-muted rounded-lg">
          {mudkits.map((section) => (
            <SectionSelectButton
              key={section.section_id}
              section={section}
              onClick={() => {
                // open in read-only viewer, or pin to panel
              }}
              isGrouped={false}
              isSelected={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
