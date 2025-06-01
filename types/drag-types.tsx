type CanvasType = "main" | "mirror";
type DragTypes = "block" | "image" | "section" | "column" | "drop-indicator";

interface DragMetadata {
  type: DragTypes;
  id: string;
  col?: number;
  row?: number;
  canvas?: CanvasType;
}
