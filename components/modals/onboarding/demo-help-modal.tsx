import { useDemoStore } from "@/store/demo-store";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { FaLeaf } from "react-icons/fa6";
import { BeanIcon } from "@/components/ui/bean-icon";
import { FaFileDownload } from "react-icons/fa";
import { NEW_BOARD_LINK } from "@/types/constants";
import Link from "next/link";

type HelpType = {
  title: string;
  body: React.ReactNode;
  cta?: React.ReactNode;
};

export default function DemoHelpModal() {
  const currentTipMission = useDemoStore((s) => s.currentHelpMission);
  const close = useDemoStore((s) => s.closeHelp);

  const tipText: Record<string, HelpType> = {
    greenhouse: {
      title: "Using the Greenhouse",
      body: (
        <div className="flex flex-col gap-1">
          <h2 className="text-lg">Where is it?</h2>
          <p className="mb-2">
            Click the Greenhouse{" "}
            <FaLeaf className="inline mx-[1px] -translate-y-[1px]" /> toggle on
            the side bar to open.
          </p>
          <Image
            src="/tutorial/greenhouse2.png"
            alt="Greenhouse Toggle"
            width={217}
            height={108}
            className="self-center mb-2 max-w-48 rounded-lg"
          />
          <h2 className="text-lg">How do I use it?</h2>
          <p className="mb-2">Click on one of the Mudkits.</p>
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
      title: "Create a Mudkit",
      body: (
        <div className="flex flex-col gap-1">
          <h2 className="text-lg">Where is it?</h2>
          <p className="leading-relaxed">
            Click the{" "}
            <BeanIcon className="inline size-4 mx-[1px] -translate-y-[2px]" />{" "}
            icon in any of the section headers:
          </p>
          <Image
            src="/tutorial/mudkit1.png"
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
            You should see your Mudkit in the Greenhouse after clicking Create:
          </p>
          <Image
            src="/tutorial/mudkit3.png"
            alt="Greenhouse Toggle"
            width={667}
            height={113}
            className="self-center mb-2 w-full rounded-lg"
          />
          <p className="mb-2 italic">
            Note: This is just a demo, so Mudkits you create here are temporary.
          </p>
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
      title: "Spotlight an Image",
      body: (
        <div className="flex flex-col gap-1">
          <h2 className="text-lg">What is it?</h2>
          <p className=" mb-2">
            The Spotlight is an easy way to always keep 1 image in view.
          </p>
          <h2 className="text-lg">Where is it?</h2>
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
              src="/tutorial/mudkit1.png"
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

          {/* <p className="mb-2 italic">
            Note: This is just a demo, so Mudkits you create here are temporary.
          </p> */}
        </div>
      ),
    },
    complete: {
      title: "Hooray!",
      body: (
        <div className="flex flex-col gap-2">
          <p>You&apos;ve hit the essential flow of Mudboard.</p>
          <p className="mb-6">
            Feel free to explore more (complete the{" "}
            <strong>Extra Credit</strong>), or start your own board when
            you&apos;re ready.
          </p>
          <p className="">
            Feedback? I&apos;d love to hear from you:{" "}
            <a href="mailto:andrew@mudboard.com" className="text-primary">
              andrew@mudboard.com
            </a>
          </p>
        </div>
      ),
      cta: (
        <Link
          href={NEW_BOARD_LINK}
          title="Create a New Board"
          className="px-4 py-2 bg-primary text-white rounded-lg font-header
          hover:bg-accent hover:text-primary cursor-pointer transition-all duration-100"
          target="_blank"
          rel="noopener noreferrer"
        >
          Create New Board
        </Link>
      ),
    },

    complete2: {
      title: "Looks like you've got the hang of it!",
      body: (
        <div className="flex flex-col gap-2">
          <p>Thanks for giving Mudboard a try.</p>
          <p className="mb-4">
            You’ve hit the essentials—feel free to explore more, or start your
            own board when you&apos;re ready.
          </p>
          <p>
            Feedback or ideas? I&apos;d love to hear from you:{" "}
            <strong>andrew@mudboard.com</strong>
          </p>
        </div>
      ),
      cta: (
        <button className="mt-4 px-4 py-2 bg-primary text-white rounded">
          Create your own board
        </button>
      ),
    },
  };

  if (currentTipMission === null) return null;
  const currentTip = tipText[currentTipMission];

  return (
    <Dialog open onOpenChange={close}>
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
              <div className="flex gap-4 items-center">
                <button
                  type="button"
                  onClick={close}
                  title="Return to Demo Board"
                  className="font-header cursor-pointer hover:text-accent"
                >
                  Continue Exploring
                </button>
                {currentTip.cta}
              </div>
            </div>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
