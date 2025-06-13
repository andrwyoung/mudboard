"use client";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

export default function HelpModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-md bg-background p-6 shadow-lg max-w-md w-full">
        <DialogTitle className="text-2xl text-primary">Need Help?</DialogTitle>

        <div className="space-y-3 text-sm text-primary pt-2">
          {/* <p>
            Press <kbd className="kbd">⌘</kbd>/<kbd className="kbd">Ctrl</kbd> +{" "}
            <kbd className="kbd">Z</kbd> to undo, and{" "}
            <kbd className="kbd">⇧</kbd> + <kbd className="kbd">⌘</kbd> +{" "}
            <kbd className="kbd">Z</kbd> or <kbd className="kbd">Ctrl</kbd> +{" "}
            <kbd className="kbd">Y</kbd> to redo.
          </p>
          <p>
            You can drag images between sections, delete blocks, and even change
            the layout with column settings.
          </p> 
          <p>
            Changes are saved in real-time. Use undo to explore freely without
            fear.
          </p> */}
          <p>
            Stuck? Reach out via email at{" "}
            <a
              href="mailto:andrew@jonadrew.com"
              className="underline hover:text-accent duration-200 transition-all"
            >
              andrew@jonadrew.com
            </a>
            .
          </p>
        </div>
        {/* 
        <div className="flex justify-end pt-4">
          <Button onClick={() => setOpen(false)} className="font-header py-2">
            Close
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
}
