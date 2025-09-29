"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import FormatBar from "./format-bar";

export default function RichInlineTextarea({
  value,
  onChange,
  isEditable = true,
  unnamedPlaceholder = "Double click to add text",
  placeholder,
  className,
  onEditingChange,
}: {
  value: string | null;
  onChange: (newValue: string | null) => void;
  isEditable?: boolean;
  unnamedPlaceholder?: string;
  placeholder?: string;
  className?: string;
  onEditingChange?: (isEditing: boolean) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);

  // Notify parent when editing state changes
  useEffect(() => {
    onEditingChange?.(isEditing);
  }, [isEditing, onEditingChange]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Disable heading, code, etc. - keep it simple
        heading: false,
        code: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
      }),
      TextStyle,
      Color,
      Underline,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "w-full p-0 focus:outline-none prose prose-sm max-w-none",
      },
      handleKeyDown: (view, event) => {
        // Intercept Cmd/Ctrl + Enter BEFORE Tiptap processes it
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
          return true; // Prevent Tiptap from handling it
        }
        // Intercept Escape
        if (event.key === "Escape") {
          return true; // Prevent Tiptap from handling it
        }
        return false; // Let Tiptap handle other keys
      },
    },
    // onUpdate: ({ editor }) => {
    //   const html = editor.getHTML();
    //   // Don't trigger onChange on every keystroke, just update local state
    // },
  });

  useEffect(() => {
    if (editor && value !== null && !isEditing) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor, isEditing]);

  useEffect(() => {
    if (isEditing && editor) {
      editor.commands.focus("end");
    }
  }, [isEditing, editor]);

  const confirm = () => {
    if (!editor) return;

    const html = editor.getHTML();
    const text = editor.getText().trim();

    // If empty, save as null
    const nextValue = text === "" ? null : html;

    if (nextValue !== value) {
      onChange(nextValue);
    }

    setIsEditing(false);
  };

  const cancel = () => {
    if (editor && value) {
      editor.commands.setContent(value);
    }
    setIsEditing(false);
  };

  if (!editor) return null;

  const handleContainerDoubleClick = () => {
    if (!isEditable || isEditing) return;
    setIsEditing(true);
  };

  return (
    <div
      className={`border py-1 px-3 text-sm rounded-md w-full transition-all ${
        isEditing ? "border-input shadow-sm" : "border-transparent"
      } ${className}`}
      onDoubleClick={handleContainerDoubleClick}
    >
      {isEditing ? (
        <div
          className="flex flex-col gap-2"
          onKeyDown={(e) => {
            // Handle Cmd/Ctrl + Enter = Save
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              confirm();
            }
            // Handle Escape = Cancel
            if (e.key === "Escape") {
              e.preventDefault();
              cancel();
            }
          }}
        >
          {/* Formatting Toolbar */}
          <FormatBar editor={editor} />

          {/* Editor */}
          <div onMouseDown={(e) => e.stopPropagation()}>
            <EditorContent
              editor={editor}
              className="prose prose-sm max-w-none [&_.ProseMirror]:select-text"
              placeholder={placeholder}
            />
          </div>

          <div className="self-end mb-2">
            <button
              type="button"
              onClick={cancel}
              className="text-xs px-2 py-1 text-muted-foreground hover:text-primary"
            >
              Discard (Esc)
            </button>

            <button
              type="button"
              onClick={confirm}
              className="text-sm px-3 py-1 bg-accent text-accent-foreground 
              rounded hover:bg-accent/80 transition-colors font-medium"
            >
              Save{" "}
              <span className="opacity-60 text-xs">
                (
                {typeof navigator !== "undefined" &&
                navigator.platform.toLowerCase().includes("mac")
                  ? "⌘↵"
                  : "Ctrl+↵"}
                )
              </span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {(isEditable || value) && (
            <div className="relative w-full">
              {/* Transparent overlay to catch double-clicks */}
              {isEditable && (
                <div
                  className="absolute inset-0 z-10 cursor-pointer"
                  onDoubleClick={handleContainerDoubleClick}
                  title="Double click to edit"
                />
              )}
              <div
                style={{
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
                className={`
                  ${!value ? "italic opacity-50" : ""}
                  whitespace-pre-wrap transition-colors select-none w-full
                  [&_strong]:font-bold [&_em]:italic [&_u]:underline
                `}
                dangerouslySetInnerHTML={{
                  __html:
                    value && value.trim() !== "" ? value : unnamedPlaceholder,
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
