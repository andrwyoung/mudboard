"use client";

import { useState } from "react";
import { Editor } from "@tiptap/react";
import { Bold, Italic, Palette, LucideIcon } from "lucide-react";
import ColorPickerWheel from "@/components/modals/color-picker/color-picker";
import { FaEyeDropper } from "react-icons/fa6";

const COLORS = [
  "#DC2626", // red
  "#EA580C", // orange
  "#CA8A04", // yellow
  "#16A34A", // green
  "#2563EB", // blue
  "#9333EA", // purple
];

function FormatButton({
  icon: Icon,
  isActive,
  onClick,
  title,
}: {
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-accent/40 transition-colors cursor-pointer ${
        isActive ? "bg-accent text-primary" : "text-muted-foreground"
      }`}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

export default function FormatBar({
  editor,
  onCancel,
}: {
  editor: Editor;
  onCancel: () => void;
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFullPicker, setShowFullPicker] = useState(false);

  return (
    <div className="flex items-center gap-2 pb-1 border-b border-border">
      <FormatButton
        icon={Bold}
        isActive={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Bold (Ctrl+B)"
      />

      <FormatButton
        icon={Italic}
        isActive={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Italic (Ctrl+I)"
      />

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setShowColorPicker(!showColorPicker);
            if (!showColorPicker) setShowFullPicker(false); // Reset to swatches when opening
          }}
          className="p-1.5 rounded hover:bg-accent/40 
          cursor-pointer transition-colors text-muted-foreground"
          title="Text Color"
        >
          <Palette className="w-4 h-4" />
        </button>

        {showColorPicker && (
          <div
            className="absolute top-full mt-1 left-0 bg-popover border border-border 
          flex flex-col rounded-md shadow-lg p-3 z-50"
          >
            {!showFullPicker ? (
              <>
                {/* Quick color swatches */}
                <div className="flex flex-row gap-1">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setShowColorPicker(false);
                      }}
                      className="w-6 h-6 rounded shadow-md hover:scale-110 cursor-pointer transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                  {/* Custom color picker button */}
                  <button
                    type="button"
                    onClick={() => setShowFullPicker(true)}
                    className="w-6 h-6 rounded hover:scale-110 cursor-pointer transition-transform flex items-center justify-center"
                    title="Custom color"
                  >
                    <FaEyeDropper className="size-4 text-primary" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Full color picker */}
                <ColorPickerWheel
                  initialColor={
                    editor.getAttributes("textStyle").color || "#000000"
                  }
                  onChange={(color) => {
                    editor.chain().focus().setColor(color).run();
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowFullPicker(false)}
                  className="w-full mt-2 text-xs text-muted-foreground cursor-pointer hover:text-primary"
                >
                  ← Back to swatches
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                setShowColorPicker(false);
                setShowFullPicker(false);
              }}
              className="w-full mt-1 text-xs text-muted-foreground cursor-pointer hover:text-primary border-t border-border pt-1"
            >
              Reset Color
            </button>
          </div>
        )}
      </div>

      <div className="flex-1" />

      <button
        type="button"
        onClick={onCancel}
        className="text-xs px-2 py-1 text-muted-foreground hover:text-primary"
      >
        Discard (Esc)
      </button>
    </div>
  );
}
