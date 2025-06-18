"use client";
import { AccordianWrapper } from "../ui/accordian-wrapper";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";

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
          <h1 className="text-xl font-header mt-4">FAQ</h1>
          <div className="space-y-4 mb-8">
            <AccordianWrapper
              title="My ___ is deleted/missing!"
              titleClassName={faqClass}
            >
              <p>
                Don&apos;t worry! It can very likely be recovered. And it might
                be something wrong on my end, so please do let me know.
              </p>
              <p className="mt-2">Just reach out and we can fix it.</p>
            </AccordianWrapper>

            <AccordianWrapper
              title="My colors look wierd when uploading Images"
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
              title="Greyscale is wrong"
              titleClassName={faqClass}
            >
              <p>
                Yea, we are technically not using the correct Greyscale method,
                but I&apos;m not educated enough to know which one I should use.
              </p>
              <p className="mt-2">
                Please reach out if you&apos;re an expert on this topic.
                I&apos;d love how to discuss how to use the correct greyscale.
              </p>
            </AccordianWrapper>
          </div>
          <div className="mt-2">
            <p className="mb-2 font-header font-semibold">Something Else?</p>
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
