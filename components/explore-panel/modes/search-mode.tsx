// components/explore-panel/modes/search-mode.tsx

import { useExploreStore } from "@/store/explore-store";
import { useMetadataStore } from "@/store/metadata-store";
import { SectionWithStats } from "@/types/stat-types";
import { useState } from "react";
import { FaCaretDown, FaLeaf, FaSeedling } from "react-icons/fa6";
import { MudkitSelectButtonExplore } from "../mudkit-selectors copy";
import RefreshButton from "./search-mode/refresh-button";
import { BeanIcon } from "@/components/ui/bean-icon";

export default function SearchMode({
  handleFetchMudkit,
}: {
  handleFetchMudkit: (section: SectionWithStats) => void;
}) {
  const boardSections = useMetadataStore((s) => s.boardSections ?? []);

  const userMudkits = useExploreStore((s) => s.userMudkits);
  const otherMudkits = useExploreStore((s) => s.otherMudkits);

  const [showAdded, setShowAdded] = useState(false);
  const boardSectionIds = new Set(boardSections.map((s) => s.section_id));
  const activeUserMudkits = userMudkits.filter(
    (section) => !boardSectionIds.has(section.section_id)
  );
  const addedUserMudkits = userMudkits.filter((section) =>
    boardSectionIds.has(section.section_id)
  );

  return (
    <>
      <div>
        <h1 className="text-2xl mt-2 font-semibold">Greenhouse</h1>
      </div>
      <div className="flex flex-row justify-between items-start mb-8">
        <p className="text-sm font-semibold">
          Drag any image into your board to reuse or remix it!
        </p>
        <RefreshButton />
      </div>

      <div className="mb-8">
        <h3 className="text-white text-md font-bold mb-2 flex items-center gap-2">
          My Mudkits <FaLeaf />
        </h3>

        {userMudkits.length > 0 ? (
          <>
            {activeUserMudkits.length === 0 ? (
              <>
                {addedUserMudkits.length > 0 && (
                  <div className="text-sm text-white italic py-1 w-full text-center ">
                    All your mudkits are already on this board.
                  </div>
                )}
              </>
            ) : (
              <div className="p-1 bg-muted rounded-lg">
                {activeUserMudkits.map((section) => (
                  <MudkitSelectButtonExplore
                    key={section.section_id}
                    section={section}
                    onClick={() => handleFetchMudkit(section)}
                    isGrouped={false}
                    isSelected={false}
                    disabled={boardSections.some(
                      (s) => s.section_id === section.section_id
                    )}
                    showIconForIsOnMarketplace
                  />
                ))}
              </div>
            )}

            {addedUserMudkits.length > 0 && (
              <div>
                <button
                  onClick={() => setShowAdded((prev) => !prev)}
                  className="text-white text-sm my-2 mx-4 hover:text-accent transition-all 
              cursor-pointer duration-200 hover:underline font-semibold flex gap-1 items-center"
                  aria-expanded={showAdded}
                  aria-controls="added-mudkits"
                >
                  <FaCaretDown
                    className={`transition-transform duration-200 ${
                      showAdded ? "rotate-180" : ""
                    }`}
                  />
                  Already in board ({addedUserMudkits.length})
                </button>

                {showAdded && (
                  <div id="added-mudkits" className="p-1 bg-muted rounded-lg ">
                    {addedUserMudkits.map((section) => (
                      <MudkitSelectButtonExplore
                        key={section.section_id}
                        section={section}
                        onClick={() => {}}
                        isGrouped={false}
                        isSelected={false}
                        disabled
                        showIconForIsOnMarketplace
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="w-full text-center py-8 text-sm font-semibold ">
            You haven’t made any mudkits yet!
            <br /> Click the{" "}
            <BeanIcon className="inline mx-1 size-4 -translate-y-[1px]" /> icon
            on any section to publish one.
          </p>
        )}
      </div>

      <div>
        <h3 className="text-white text-md font-bold mb-2 flex items-center gap-2">
          Community Mudkits <FaSeedling />
        </h3>

        {otherMudkits.length === 0 ? (
          <p className="text-sm italic text-white px-2 py-4 text-center">
            Error fetching Community Mudkits
          </p>
        ) : (
          <div className="p-1 bg-muted rounded-lg">
            {otherMudkits.map((section) => (
              <MudkitSelectButtonExplore
                key={section.section_id}
                section={section}
                onClick={() => handleFetchMudkit(section)}
                isGrouped={false}
                isSelected={false}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
