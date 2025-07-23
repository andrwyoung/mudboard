"use client";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { ModalType, useDemoStore } from "@/store/demo-store";
import { BeanIcon } from "../ui/bean-icon";

const welcomePages: Record<
  ModalType,
  {
    title: string;
    body: React.ReactNode;
    buttonText: string;
  }
> = {
  welcome: {
    title: "Welcome to Mudboard!",
    body: (
      <div>
        <p className="text-sm text-primary mt-2 mb-4">
          This is a working board made and used by an artist for client work.{" "}
          <br />
          Explore it. Edit it. Add your own images.
        </p>
        <p className="text-sm text-primary mb-6 hidden sm:block">
          Try <strong>dragging a few images</strong> to rearrange.
          {/* <FaLeaf className="inline -translate-y-[1px] ml-1" />{" "}
          <strong>Greenhouse</strong> to explain what it does. */}
        </p>
      </div>
    ),
    buttonText: "Get Started!",
  },
  greenhouse: {
    title: "Welcome to the Greenhouse!",
    body: (
      <div>
        <p className="text-sm text-primary mb-8 mt-2">
          The Greenhouse is your{" "}
          <span className="font-semibold">personal reference library</span>
          —and a space to explore ideas from others.
        </p>
        <p className="text-sm text-primary mb-1">
          It makes it <strong>easier to find</strong> your favorite refs.
        </p>

        <p className="text-sm text-primary mb-10">
          Or reuse something you loved <strong>from another project</strong>.
        </p>
        {/* <p className="text-sm text-primary ">Take a look around!</p> */}
        <p className="text-sm text-primary mb-2 text-center">
          Click
          <BeanIcon className="inline -translate-y-[1px] ml-1.5 mr-0.5 size-4" />{" "}
          to create a Mudkit
        </p>
      </div>
    ),
    buttonText: "Explore!",
  },
};

export default function WelcomeModal() {
  const mode = useDemoStore((s) => s.mode);
  const closeModal = useDemoStore((s) => s.closeModal);

  const content = mode ? welcomePages[mode] : null;
  const open = mode !== null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && closeModal()}>
      <DialogContent className="rounded-md bg-background p-6 shadow-lg max-w-md w-full">
        <DialogTitle className="text-2xl text-primary">
          {content?.title}
        </DialogTitle>
        {content?.body}
        <div className="flex justify-end">
          <Button onClick={closeModal} className="font-header py-2">
            {content?.buttonText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
