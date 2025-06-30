"use client";
import { AccordianWrapper } from "../ui/accordian-wrapper";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { SupportEmailAddress } from "@/utils/support-email";

const faqClass = "font-header text-md ml-2";

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

        <div className="space-y-3 text-sm text-primary ">
          <h1 className="text-2xl font-header mt-4 font-smibold">FAQ</h1>
          <div className="space-y-4 mb-8">
            <AccordianWrapper
              title="My data is deleted/missing!"
              titleClassName={faqClass}
            >
              <p>
                Don’t panic — your work is likely still recoverable. It might be
                a glitch on my end, so please reach out.
              </p>
            </AccordianWrapper>

            <AccordianWrapper
              title="Colors look off when uploading images"
              titleClassName={faqClass}
            >
              <p>
                Some images, especially those exported in <em>CMYK</em> (print
                color mode), may look off after uploading — usually dull or with
                strange colors. This happens due to how browsers handle image
                compression.
              </p>
              <p className="mt-2">
                To avoid this, export your images in <strong>sRGB</strong> color
                mode. PNGs also tend to preserve color better than JPEGs.
              </p>
            </AccordianWrapper>

            <AccordianWrapper
              title="Greyscale looks off"
              titleClassName={faqClass}
            >
              <p>
                There are several ways to convert to greyscale, and we might not
                be using the ideal one (yet).
              </p>
              <p className="mt-2">
                If you know computer color science or have thoughts on how to
                improve this, I’d love to hear from you.
              </p>
            </AccordianWrapper>
          </div>
          <div className="mt-2">
            <p className="mb-2 font-header font-semibold">Something Else?</p>
            <p>
              Reach out via email at <SupportEmailAddress />.
            </p>
          </div>
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
