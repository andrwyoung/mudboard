import { Block, TextBlockType } from "@/types/block-types";
import { TEXT_BLOCK_HEIGHT } from "@/types/upload-settings";
import InlineEditText from "../ui/inline-edit";
import { updateTextBlockText } from "@/lib/db-actions/sync-text/text-block-actions";

export default function TextBlock({ block }: { block: Block }) {
  const textData = block.data as TextBlockType;

  // console.log("textdata: ", textData);

  return (
    <div
      style={{ height: TEXT_BLOCK_HEIGHT }}
      className="flex flex-col items-center justify-center px-4"
    >
      <InlineEditText
        value={textData?.text ?? null}
        onChange={(newTitle) => {
          updateTextBlockText(block, newTitle);
        }}
        unnamedPlaceholder="Click to add Text!"
        className="text-lg sm:text-xl md:text-2xl text-center"
      />
    </div>
  );
}
