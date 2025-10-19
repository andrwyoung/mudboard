// Reusable drag overlay component
// Shows visual feedback when dragging images over the page

import { Upload } from "lucide-react";

export function DragOverlay({ dragCount }: { dragCount: number | null }) {
  if (dragCount === null) return null;

  return (
    <div className="fixed inset-0 bg-accent/20 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white/80 rounded-lg p-8 shadow-lg border-4 border-dashed border-accent">
        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-accent" />
          <h3 className="text-2xl font-semibold text-primary mb-1">
            Drop {dragCount} image{dragCount > 1 ? "s" : ""} here
          </h3>
          <p className="text-primary text-sm">
            Release to add {dragCount > 1 ? "them" : "it"} to your collection
          </p>
        </div>
      </div>
    </div>
  );
}
