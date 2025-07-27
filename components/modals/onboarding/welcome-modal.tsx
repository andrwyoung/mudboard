"use client";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useDemoStore } from "@/store/demo-store";
import { TUTORIAL_TITLE } from "@/types/constants";
import Image from "next/image";

export default function WelcomeModal() {
  const mode = useDemoStore((s) => s.mode);
  const closeModal = useDemoStore((s) => s.closeModal);
  const open = mode !== null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && closeModal()}>
      <DialogContent className="rounded-md bg-background p-6 shadow-lg max-w-md w-full">
        <DialogTitle className="text-2xl text-primary">
          Welcome to Mudboard!
        </DialogTitle>
        <div className="flex flex-col">
          {/* <p className="text-sm text-primary mt-2 mb-4">
            This is a copy of a board used by an artist for client work. <br />
            It&apos;s <strong>free to edit</strong> and explore.
          </p> */}

          <div className="text-sm text-primary hidden sm:flex flex-col">
            <p className=" mt-2 mb-6">
              Want a quick tour? The <strong>“{TUTORIAL_TITLE}”</strong> panel
              on the button right guides you through the main features.
            </p>

            <p className=" mb-2">
              If you get confused with any of the tasks, click the{" "}
              <span className="underline">Guide</span> button:
            </p>
            <Image
              src="/tutorial/welcome2.png"
              alt="Welcome Guide 1"
              width={302}
              height={95}
              className="self-center max-w-64 rounded-lg mb-6 border-2 border-primary"
            />
            <p>
              Try <strong>dragging a few images</strong> to begin!
            </p>
          </div>
          <p className="text-sm text-primary mb-6 sm:hidden block">
            <strong>Note:</strong> Mobile has limited features.
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={closeModal} className="font-header py-2">
            Get Started!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
