"use client";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { FaLeaf } from "react-icons/fa6";
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
        <p className="text-sm text-primary mt-2 mb-2">
          This is the real app. <strong>Drag images around</strong> and make
          this board yours!
        </p>
        <p className="text-sm text-primary mb-6 hidden sm:block">
          When you&apos;re ready, I’ll be at the{" "}
          <FaLeaf className="inline -translate-y-[1px] ml-1" />{" "}
          <strong>Greenhouse</strong> to explain what it does.
        </p>
      </div>
    ),
    buttonText: "Get Started!",
  },
  greenhouse: {
    title: "Welcome to the Greenhouse!",
    body: (
      <div>
        <p className="text-sm text-primary mt-2 mb-1">
          Wish it were <strong>easier to find</strong> your favorite refs?
        </p>
        <p className="text-sm text-primary mt-1 mb-6">
          Or reuse something you loved <strong>from another project</strong>?
        </p>
        <p className="text-sm text-primary mb-10">
          The Greenhouse is your{" "}
          <span className="font-semibold">personal reference library</span>
          —and a space to explore ideas from others.
        </p>
        <p className="text-sm text-primary mb-2 text-center">
          When you&apos;re ready, finish the tutorial at a
          <BeanIcon className="inline -translate-y-[1px] ml-1.5 mr-0.5 size-4" />{" "}
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
