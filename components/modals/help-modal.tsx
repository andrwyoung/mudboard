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
          <p>
            <strong>FAQ: My colors look wierd when uploading Images</strong>
          </p>
          <p>
            Some images, especially those exported in <em>CMYK</em> (print color
            mode), may look off after uploading — usually dull or with strange
            colors. This happens due to how browsers handle image compression.
          </p>
          <p>
            To avoid this, export your images in <strong>sRGB</strong> color
            mode. PNGs also tend to preserve color better than JPEGs.
          </p>
          <p>
            <strong>Something Else?</strong>
          </p>
          <p>
            Reach out via email at{" "}
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
