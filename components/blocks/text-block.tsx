// this what a text block looks like

import { useState } from "react";
import { Block, TextBlockType } from "@/types/block-types";
import RichInlineTextarea from "../ui/text-edit/rich-inline-textarea";
import { updateTextBlockText } from "@/lib/db-actions/sync-text/update-text-block-text";

export default function TextBlock({
  block,
  canEdit,
}: {
  block: Block;
  canEdit: boolean;
}) {
  const textData = block.data as TextBlockType;
  const [isEditing, setIsEditing] = useState(false);

  // console.log("textdata: ", textData);

  return (
    <div
      className={`outline outline-border rounded-sm text-foreground ${
        isEditing ? "text-block-editing" : ""
      }`}
    >
      <RichInlineTextarea
        value={textData?.text ?? null}
        onChange={(newTitle) => {
          updateTextBlockText(block, newTitle, canEdit);
        }}
        isEditable={canEdit}
        unnamedPlaceholder="Double Click to add Text!"
        className="text-sm sm:text-md md:text-lg"
        onEditingChange={setIsEditing}
      />
    </div>
    // <div
    //   style={{ height: TEXT_BLOCK_HEIGHT }}
    //   className="flex flex-col items-center overflow-hidden"
    // >

    //   <InlineEditText
    //     value={textData?.text ?? null}
    //     onChange={(newTitle) => {
    //       updateTextBlockText(block, newTitle);
    //     }}
    //     unnamedPlaceholder="Click to add Text!"
    //     className="text-lg sm:text-xl md:text-2xl text-center"
    //   />
    // </div>
  );
}
