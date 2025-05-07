import { Block, MudboardImage } from "@/types/image-type";
import { ImageBlock } from "./image-block";

export function BlockChooser({ block }: { block: Block }) {
  switch (block.block_type) {
    case "image":
      return (
        <ImageBlock img={block.data as MudboardImage} height={block.height} />
      );
    case "text":
      return <div className="p-2 text-zinc-600 italic">[Text block]</div>; // placeholder
    case "spacer":
      return <div className="h-8 w-full bg-transparent" />; // placeholder
    default:
      return null;
  }
}
