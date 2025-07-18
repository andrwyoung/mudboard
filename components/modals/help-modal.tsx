"use client";
import { AccordianWrapper } from "../ui/accordian-wrapper";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { SupportEmailAddress } from "@/utils/support-email";

const faqClass = "font-header text-md ml-2";

export default function HelpModal({
  open,
  setOpen,
  pageNum,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
  pageNum: number;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="rounded-md bg-background p-6 shadow-lg max-w-md w-full
      no-drag"
      >
        <DialogTitle className="text-2xl text-primary">
          {pageNum === 1 ? "FAQ" : "Keyboard Shortcuts"}
        </DialogTitle>

        <div className="space-y-3 text-sm text-primary ">
          {pageNum === 1 && <PageOne />}
          {pageNum === 2 && <PageTwo />}
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

export function PageOne() {
  return (
    <div className="mt-4">
      {/* <h1 className="text-2xl font-header mt-4 font-smibold">FAQ</h1> */}
      <div className="space-y-4 mb-8">
        {/* <AccordianWrapper
          title="My data is deleted/missing!"
          titleClassName={faqClass}
        >
          <p>
            Don’t panic — your work is likely still recoverable. It might be a
            glitch on my end, so please reach out.
          </p>
        </AccordianWrapper> */}

        <AccordianWrapper
          title="Colors look off when uploading images"
          titleClassName={faqClass}
        >
          <p>
            Some images, especially those exported in <em>CMYK</em> (print color
            mode), may look off after uploading — usually dull or with strange
            colors. This happens due to how browsers handle image compression.
          </p>
          <p className="mt-2">
            To avoid this, PNGs tend to preserve color better than JPEGs. Or if
            your images are in <strong>sRGB</strong> color mode.
          </p>
        </AccordianWrapper>

        <AccordianWrapper title="Greyscale looks off" titleClassName={faqClass}>
          <p>
            There are several ways to convert to greyscale, and we might not be
            using the ideal one (yet).
          </p>
          <p className="mt-2">
            If you know computer color science or have thoughts on how to
            improve this, I’d love to hear from you.
          </p>
        </AccordianWrapper>
      </div>
    </div>
  );
}

function Shortcut({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="flex items-start gap-2 ml-4">
      <span className="w-40 font-medium">{label}</span>
      <div className="flex flex-wrap gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="px-2 py-1 bg-muted text-xs font-mono font-semibold text-primary border rounded"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

export function PageTwo() {
  return (
    <div className="mt-2 mb-8">
      {/* <h1 className="text-lg font-header mb-4 font-semibold">
        Keyboard Shortcuts
      </h1> */}
      <p className="mb-6 text-sm">
        This canvas has 2 modes: <strong>View Mode</strong> for exploring.{" "}
        <strong>Arrange Mode </strong>for moving and resizing.
      </p>
      <div className="flex flex-col gap-2">
        <Shortcut label="Toggle Modes" keys={["E", "Middle Mouse Click"]} />
        <Shortcut label="Zoom In / Out" keys={["+", "-", "Scroll Wheel"]} />
        <Shortcut label="Fit to Screen" keys={["0"]} />

        <h3 className="mt-4 mb-1 font-semibold text-lg">Arrange Mode Only</h3>
        <Shortcut label="Pan" keys={["Space + Drag", "Middle Mouse Drag"]} />
      </div>
    </div>
  );
}
