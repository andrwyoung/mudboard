"use client";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

export default function WelcomeModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-md bg-background p-6 shadow-lg max-w-md w-full">
        <DialogTitle className="text-2xl text-primary">
          Welcome to Mudboard!
        </DialogTitle>
        <p className="text-sm text-primary pt-2">
          Welcome to the <strong>live demo and tutorial</strong>! You can add
          images, move things around, and explore how sections work — all in
          real time.
        </p>
        <p className="text-sm text-primary">
          Like what you see? Sign up anytime to save this board and{" "}
          <strong>keep all your changes</strong>.
        </p>
        <div className="flex justify-end">
          <Button onClick={() => setOpen(false)} className="font-header py-2">
            Get Started!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
