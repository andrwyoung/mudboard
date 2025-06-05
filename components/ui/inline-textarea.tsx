import { useEffect, useRef, useState } from "react";

export default function InlineEditTextarea({
  value,
  onChange,
  isEditable = true,
  unnamedPlaceholder = "Double click to add text",
  placeholder,
  className,
}: {
  value: string | null;
  onChange: (newValue: string | null) => void;
  isEditable?: boolean;
  unnamedPlaceholder?: string;
  placeholder?: string;
  className?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.select();
    }
  }, [isEditing]);

  const confirm = () => {
    const trimmed = draft.trim();
    const nextValue = trimmed === "" ? null : trimmed;
    if (nextValue !== value) onChange(nextValue);
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      const el = textareaRef.current;
      el.style.height = "auto"; // reset first
      el.style.height = `${el.scrollHeight}px`; // set to full content height
      el.select(); // optional: auto-select text
    }
  }, [isEditing]);

  return (
    <div
      className={`border py-1 px-3 text-sm rounded-md  text-primary w-full transition-all ${
        isEditing ? "border-input shadow-sm" : "border-transparent"
      } ${className}`}
      onDoubleClick={() => {
        if (!isEditable || isEditing) return;
        setDraft(value ?? "");
        setIsEditing(true);
      }}
    >
      {isEditing ? (
        <textarea
          ref={textareaRef}
          rows={Math.max(1, (draft.match(/\n/g)?.length ?? 0) + 1)}
          value={draft}
          placeholder={placeholder}
          //   onChange={(e) => setDraft(e.target.value)}
          onChange={(e) => {
            setDraft(e.target.value);
            const el = e.target;
            el.style.height = "auto"; // reset first
            el.style.height = `${el.scrollHeight}px`; // match content height
          }}
          onBlur={() => confirm()}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsEditing(false);
            }
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              confirm();
            }
          }}
          className={`w-full p-0 align-top bg-transparent resize-none focus:outline-none`}
        />
      ) : (
        <>
          {(isEditable || value) && (
            <p
              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
              className={`
                ${!value ? "italic opacity-50" : ""}
                ${isEditable ? "cursor-pointer " : "cursor-default"}  
                whitespace-pre-wrap transition-colors select-none w-full
             `}
              title={isEditable ? "Double click to rename" : ""}
            >
              {value && value.trim() !== "" ? value : unnamedPlaceholder}
            </p>
          )}
        </>
      )}
    </div>
  );
}
