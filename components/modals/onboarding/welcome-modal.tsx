"use client";
import { Dialog, DialogContent, DialogTitle } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { useDemoStore } from "@/store/demo-store";

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
            This is a working board made and used by an artist for client work.{" "}
            <br />
            Explore it. Edit it. Add your own images.
          </p>
          <p className="text-sm text-primary mb-6 hidden sm:block">
            Try <strong>dragging a few images</strong> to rearrange.
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
