import { FaFileDownload } from "react-icons/fa";

export type ModalType = "welcome" | "greenhouse";
export type MissionType =
  | "drag"
  | "freeform"
  | "expand"
  | "section"
  | "greenhouse"
  | "mudkit"
  | "mudkit2"
  | "upload"
  | "spotlight"
  | "export";

export type TutorialRowType = {
  text: React.ReactNode;
  mission: MissionType;
};

export const essentialItems: TutorialRowType[] = [
  { text: "Drag around an image", mission: "drag" },
  { text: "Double click an image to expand it", mission: "expand" },
  { text: "Add a new Section (in the sidebar)", mission: "section" },

  // {
  //   text: (
  //     <>
  //       Save a Section to your Library{" "}
  //       <FaBookBookmark
  //         className="inline -translate-y-[2px] mx-0.5
  //       size-3 opacity-75"
  //       />{" "}
  //       <button
  //         type="button"
  //         className="text-xs underline cursor-pointer hover:text-accent"
  //         onClick={() => {
  //           useUIStore.getState().setFreeformMode(false);
  //           usePanelStore.getState().setPanelMode("none");
  //           scrollToSelectedSection();
  //           toast("Look for the Book Icon (Top Right)");
  //         }}
  //       >
  //         (hint)
  //       </button>
  //     </>
  //   ),
  //   mission: "mudkit",
  // },
];

export const extraItems: TutorialRowType[] = [
  {
    text: (
      <div className="flex flex-col">
        <span>Upload an Image</span>{" "}
        <span className="text-xs">
          (Hint: drag/drop works from most websites)
        </span>
      </div>
    ),
    mission: "upload",
  },
  { text: "Switch to Freeform View (in the sidebar)", mission: "freeform" },

  {
    text: (
      <>
        Export a Section{" "}
        <FaFileDownload
          className="inline -translate-y-[2px] ml-0.5
          size-3 opacity-75"
        />
      </>
    ),
    mission: "export",
  },
  // {
  //   text: (
  //     <>
  //       Grab an Image from the Library{" "}
  //       <IoLibrary className="inline -translate-y-[2px] ml-0.5 opacity-75" />
  //     </>
  //   ),
  //   mission: "greenhouse",
  // },
];

export const mainTutorialItems: MissionType[] = essentialItems.map(
  (item) => item.mission
);
export const extraTutorialItems: MissionType[] = extraItems.map(
  (item) => item.mission
);
