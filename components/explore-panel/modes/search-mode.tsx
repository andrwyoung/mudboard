// components/explore-panel/modes/search-mode.tsx

import { useExploreStore } from "@/store/explore-store";
import { useMetadataStore } from "@/store/metadata-store";
import { SectionWithStats } from "@/types/stat-types";
import { useState } from "react";
import { FaBookBookmark, FaCaretDown } from "react-icons/fa6";
import { MudkitSelectButtonExplore } from "../mudkit-selectors copy";
import RefreshButton from "./search-mode/refresh-button";
import { useDemoStore } from "@/store/demo-store";
import { FaGlobeAmericas } from "react-icons/fa";

export default function SearchMode({
  handleFetchMudkit,
}: {
  handleFetchMudkit: (section: SectionWithStats) => void;
}) {
  const boardSections = useMetadataStore((s) => s.boardSections ?? []);
  const setCurrentSelectedMudkitType = useExploreStore(
    (s) => s.setCurrentSelectedMudkitType
  );

  const userMudkits = useExploreStore((s) => s.userMudkits);
  const otherMudkits = useExploreStore((s) => s.otherMudkits);

  const tempMudkits = useExploreStore((s) => s.tempMudkits);
  const existsUserOrTempMudkits =
    userMudkits.length > 0 || tempMudkits.length > 0;

  const isDemo = useDemoStore((s) => s.isDemoBoard);

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
        <h1 className="text-2xl mt-2 font-semibold">Library</h1>
      </div>
      <div className="flex flex-row justify-between items-start mb-8 gap-8">
        <p className="text-sm font-medium mt-1">
          Your collection of resuable sections.
        </p>
        <RefreshButton />
      </div>

      {(!isDemo || tempMudkits.length > 0) && (
        <div className="mb-8">
          <h3 className="text-white text-md font-bold mb-2 flex items-center gap-2">
            Your Private Sections
            <FaBookBookmark />
          </h3>

          {existsUserOrTempMudkits ? (
            <>
              {tempMudkits.length > 0 && (
                <div className="p-1 bg-muted rounded-lg mb-1">
                  {tempMudkits.map((section) => (
                    <MudkitSelectButtonExplore
                      key={section.section_id}
                      section={section}
                      onClick={() => {
                        setCurrentSelectedMudkitType("temp");
                        handleFetchMudkit(section);
                      }}
                      isGrouped={false}
                      isSelected={false}
                      temporary
                    />
                  ))}
                </div>
              )}
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
                      onClick={() => {
                        setCurrentSelectedMudkitType("mine");
                        handleFetchMudkit(section);
                      }}
                      isGrouped={false}
                      isSelected={false}
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
                    <div
                      id="added-mudkits"
                      className="p-1 bg-muted rounded-lg "
                    >
                      {addedUserMudkits.map((section) => (
                        <MudkitSelectButtonExplore
                          key={section.section_id}
                          section={section}
                          onClick={() => {
                            setCurrentSelectedMudkitType("others");
                            handleFetchMudkit(section);
                          }}
                          isGrouped={false}
                          isSelected={false}
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
              You haven’t saved any sections yet!
              <br /> Click the{" "}
              <FaBookBookmark className="inline mx-1 size-4 -translate-y-[1px]" />{" "}
              icon on any section to save one.
            </p>
          )}
        </div>
      )}

      <div>
        <h3 className="text-white text-md font-bold mb-2 flex items-center gap-2">
          Community Sections
          {isDemo ? " (DEMO: Click on one!)" : ""}
          <FaGlobeAmericas />
        </h3>

        {otherMudkits.length === 0 ? (
          <p className="text-sm italic text-white px-2 py-4 text-center">
            Error fetching Community Sections
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
