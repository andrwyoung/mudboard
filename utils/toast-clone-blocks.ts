import { toast } from "sonner";

export function toastClonedBlocks(num: number) {
  const label = num === 1 ? "Block" : "Blocks";
  toast.success(`Successfully cloned ${num} ${label}`);
}
