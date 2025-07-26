"use client";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useDemoStore } from "@/store/demo-store";
import { TUTORIAL_TITLE } from "@/types/constants";

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
          <p className="text-sm text-primary mt-2 mb-4">
            This is a copy of a board used by an artist for client work. <br />
            It&apos;s <strong>free to edit</strong> and explore.
          </p>
          <p className="text-sm text-primary mb-6 hidden sm:block">
            Not sure where to start? The <strong>“{TUTORIAL_TITLE}”</strong>{" "}
            panel guides you through what Mudboard is about.
            <br />
            <br />
            Try <strong>dragging a few images</strong> to begin!
          </p>
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
