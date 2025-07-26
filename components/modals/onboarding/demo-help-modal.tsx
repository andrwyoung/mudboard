import { useDemoStore } from "@/store/demo-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DemoHelpModal() {
  const currentTipMission = useDemoStore((s) => s.currentHelpMission);
  const close = useDemoStore((s) => s.closeHelp);

  const tipText: Record<string, React.ReactNode> = {
    drag: "Click and drag images to move them around.",
    greenhouse: "Click on the Greenhouse icon to explore new images.",
    mudkit: "A Mudkit lets you group images into a reusable bundle.",
    mudkit2: "Try reusing a Mudkit image by dragging it out again.",
    upload: "Drag in an image from Pinterest, or upload from your device.",
    spotlight: "Click the Spotlight button to zoom in on one image.",
    export: "Use the Export button to download your section as a PNG or ZIP.",
  };

  return (
    <Dialog open={currentTipMission !== null} onOpenChange={close}>
      <DialogContent className="max-w-md text-primary">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Tips for: {currentTipMission}
          </DialogTitle>
        </DialogHeader>
        <div className="text-sm  mt-2">
          {currentTipMission && tipText[currentTipMission]}
        </div>
      </DialogContent>
    </Dialog>
  );
}
