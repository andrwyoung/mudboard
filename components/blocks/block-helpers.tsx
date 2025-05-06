import { Block, MudboardImage } from "@/types/image-type";
import { ImageBlock } from "./image-block";

export function BlockRenderer({
  block,
  isErrored,
  onClick,
  onError,
}: {
  block: Block;
  isErrored?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onError?: () => void;
}) {
  switch (block.type) {
    case "image":
      return (
        <ImageBlock
          img={block.data as MudboardImage}
          isErrored={isErrored}
          onClick={onClick}
          onError={onError}
        />
      );
    case "text":
      return <div className="p-2 text-zinc-600 italic">[Text block]</div>; // placeholder
    case "spacer":
      return <div className="h-8 w-full bg-transparent" />; // placeholder
    default:
      return null;
  }
}
