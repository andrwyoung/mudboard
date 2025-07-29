import { useDemoStore } from "@/store/demo-store";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { FaBookBookmark } from "react-icons/fa6";
import { FaFileDownload } from "react-icons/fa";
import { NEW_BOARD_LINK } from "@/types/constants";
import Link from "next/link";
import { useEffect } from "react";
import { useModalStore } from "@/store/modal-store";
import { IoLibrary } from "react-icons/io5";

type HelpType = {
  title: string;
  body: React.ReactNode;
  cta?: React.ReactNode;
};

export default function DemoHelpModal() {
  const currentTipMission = useDemoStore((s) => s.currentHelpMission);
  const setLoginModalOpen = useModalStore((s) => s.setLoginModalOpen);

  const closeHelpModal = useDemoStore((s) => s.closeHelp);

  const tipText: Record<string, HelpType> = {
    greenhouse: {
      title: "Using the Library",
      body: (
        <div className="flex flex-col gap-1">
          <h2 className="text-lg">Where is it?</h2>
          <p className="mb-2">
            Click the Library{" "}
            <IoLibrary className="inline mx-[1px] -translate-y-[1px]" /> toggle
            on the side bar to open.
          </p>
          <Image
            src="/tutorial/greenhouse11.png"
            alt="Library Toggle"
            width={217}
            height={108}
            className="self-center mb-2 max-w-48 rounded-lg"
          />
          <h2 className="text-lg">How do I use it?</h2>
          <p className="mb-2">Click on one of the Sections.</p>
          <Image
            src="/tutorial/greenhouse3.png"
            alt="Greenhouse Toggle"
            width={660}
            height={188}
            className="self-center mb-2 max-w-96 rounded-sm"
          />
          <p className="mb-2">
            Then drag any image from the Greenhouse panel into your board.
          </p>
          <Image
            src="/tutorial/greenhouse4.png"
            alt="Greenhouse Toggle"
            width={449}
            height={276}
            className="self-center mb-2 max-w-64 rounded-lg"
          />
        </div>
      ),
    },
    mudkit: {
      title: "Save a Section to your Library",
      body: (
        <div className="flex flex-col gap-1">
          <h2 className="text-lg">Where is it?</h2>
          <p className="leading-relaxed">
            Click the{" "}
            <FaBookBookmark className="inline size-4 mx-[2px] -translate-y-[2px]" />{" "}
            icon in any of the section headers:
          </p>
          <Image
            src="/tutorial/mudkit4.png"
            alt="Greenhouse Toggle"
            width={108}
            height={68}
            className="self-center max-w-48 rounded-lg border-2 border-primary mb-2"
          />
          <p className="italic mb-4">
            Note: If you can&apos;t find it, make sure you&apos;re{" "}
            <strong>not in Freeform mode</strong>.
          </p>

          <p className="mb-4">
            You should see your Section in the Greenhouse after clicking Create:
          </p>
          <Image
            src="/tutorial/mudkit3.png"
            alt="Greenhouse Toggle"
            width={667}
            height={113}
            className="self-center mb-2 w-full rounded-lg"
          />
        </div>
      ),
    },
    // upload: {
    //   title: "Upload your Images",
    //   body: (
    //     <div className="flex flex-col gap-1">
    //       <h2 className="text-lg">8 Ways to upload an Image:</h2>
    //     </div>
    //   ),
    // },
    spotlight: {
      title: "Expand an Image",
      body: (
        <div className="flex flex-col gap-1">
          <h2 className="text-lg">Expand</h2>
          <p className="">Method 1: Double Click an Image</p>
          <p className=" mb-2">
            Method 2: Right Click an Image. Then click &quot;Expand Image&quot;
          </p>
          <Image
            src="/tutorial/spotlight2.png"
            alt="Spotlight Tutorial 1"
            width={357}
            height={284}
            className="self-center max-w-64 rounded-lg mb-2"
          />
          <h2 className="text-lg">Spotlight</h2>
          <p className=" mb-2">
            Right click an image. Then click &quot;Spotlight Image&quot;
          </p>
          <Image
            src="/tutorial/spotlight1.png"
            alt="Spotlight Tutorial 1"
            width={357}
            height={284}
            className="self-center max-w-64 rounded-lg mb-2"
          />
        </div>
      ),
    },
    export: {
      title: "Export your Canvas",
      body: (
        <div className="flex flex-col gap-1">
          <h2 className="text-lg">Where is it?</h2>
          <p className="leading-relaxed mb-2">
            Grid mode: click the{" "}
            <FaFileDownload className="inline  mx-[1px] -translate-y-[2px]" />{" "}
            icon in the section header.
            <br />
            Freeform mode: click the{" "}
            <FaFileDownload className="inline  mx-[1px] -translate-y-[2px]" />{" "}
            icon on the bottom left.
          </p>
          <div className="flex gap-6 self-center">
            <Image
              src="/tutorial/mudkit4.png"
              alt="Greenhouse Toggle"
              width={108}
              height={68}
              className="self-center max-w-48 rounded-lg border-2 border-primary mb-2"
            />
            <Image
              src="/tutorial/freeform1.png"
              alt="Greenhouse Toggle"
              width={62}
              height={121}
              className="self-center max-h-48 rounded-lg border-2 border-primary mb-2"
            />
          </div>
          <p className="leading-relaxed mb-2">
            Or you can export <strong>all sections</strong> under &quot;Share +
            Export&quot; in the sidebar.
          </p>
          <Image
            src="/tutorial/export2.png"
            alt="Greenhouse Toggle"
            width={213}
            height={133}
            className="self-center max-h-48 rounded-lg border-2 border-primary mb-2"
          />
        </div>
      ),
    },
    complete: {
      title: "Hooray!",
      body: (
        <div className="flex flex-col gap-2">
          <p className="mb-2">
            You&apos;ve hit the essential flow of reusing images in Mudboard!
          </p>
          {/* <p className="mb-4">
            You&apos;ve hit the essential flow of Mudboard.
          </p> */}
          <p className="mb-6">
            There&apos;s much more to explore (check out the{" "}
            <strong>Extra Credit</strong>), or you can start your own board.
          </p>
          {/* <p className="">
            Feedback? I&apos;d love to hear from you:{" "}
            <a href="mailto:andrew@mudboard.com" className="text-primary">
              andrew@mudboard.com
            </a>
          </p> */}
        </div>
      ),
      cta: (
        <>
          <Link
            href={NEW_BOARD_LINK}
            title="Create a New Board"
            className="font-header cursor-pointer hover:text-accent"
            target="_blank"
            rel="noopener noreferrer"
          >
            Create New Board
          </Link>
          <button
            type="button"
            onClick={closeHelpModal}
            title="Return to Demo Board"
            className="px-4 py-2 bg-primary text-white rounded-lg font-header
          hover:bg-accent hover:text-primary cursor-pointer transition-all duration-100"
          >
            Continue Exploring
          </button>
        </>
      ),
    },

    complete2: {
      title: "You've Completed the Tutorial!",
      body: (
        <div className="flex flex-col gap-2">
          <p className=""></p>
          <p className="mb-4">
            {
              "Looks like you've got the hang of it (you even did the Extra Credit!)"
            }
          </p>
          <p className="mb-6 leading-relaxed">
            Want to save your work and create your own boards? <br />
            <strong>Create a free account!</strong>
          </p>
          {/* <p>
            Feedback or ideas? I&apos;d love to hear from you:{" "}
            <strong>andrew@mudboard.com</strong>
          </p> */}
          <p className="text-sm text-muted-foreground mt-2">
            Feedback?{" "}
            <a href="mailto:andrew@mudboard.com" className="underline">
              andrew@mudboard.com
            </a>
          </p>
        </div>
      ),
      cta: (
        <>
          <button
            type="button"
            onClick={closeHelpModal}
            title="Return to Demo Board"
            className="font-header cursor-pointer hover:text-accent"
          >
            Continue Exploring
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginModalOpen(true);
              closeHelpModal();
            }}
            className="px-4 py-1 bg-primary text-white rounded-lg font-header
        hover:bg-accent hover:text-primary cursor-pointer transition-all duration-100"
          >
            Create an Account
          </button>
        </>
      ),
    },
  };

  const missions = useDemoStore((s) => s.missionsCompleted);
  useEffect(() => {
    const allComplete = Object.values(missions).every(Boolean);

    if (allComplete) {
      setTimeout(() => {
        useDemoStore.getState().markFinalComplete();
      }, 500);
    }
  }, [missions]);

  if (currentTipMission === null) return null;
  const currentTip = tipText[currentTipMission];

  return (
    <Dialog open onOpenChange={closeHelpModal}>
      <DialogContent className="max-w-md text-primary">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {currentTip.title}
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm mt-2">{currentTip.body}</div>

        {currentTip.cta ? (
          <DialogFooter>
            <div className="w-full flex justify-end mt-4">
              <div className="flex gap-4 items-center">{currentTip.cta}</div>
            </div>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
