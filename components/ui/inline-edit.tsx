import { useLoadingStore } from "@/store/loading-store";
import { useEffect, useRef, useState } from "react";

export default function InlineEditText({
  value,
  onChange,
  isEditable = true,
  className,
  unnamedPlaceholder = "Click to Edit",
  placeholder,
  autofocus = false,
}: {
  value: string | null;
  onChange: (newValue: string | null) => void;
  isEditable?: boolean;
  className?: string;
  unnamedPlaceholder?: string;
  placeholder?: string;
  autofocus?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (autofocus && inputRef.current) {
      inputRef.current.focus();
      useLoadingStore.getState().setEditingSectionId(null);
    }
  }, [autofocus]);

  const confirm = () => {
    const trimmed = draft.trim();
    const nextValue = trimmed === "" ? null : trimmed;
    if (nextValue !== value) {
      onChange(nextValue);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`overflow-x-auto border py-1 px-3 rounded-md whitespace-nowrap 
        font-header ${className} text-primary w-full ${
        isEditing ? "border-input shadow-sm" : "border-transparent"
      }`}
      onClick={() => {
        if (!isEditable) return;
        setDraft(value ?? "");
        setIsEditing(true);
      }}
    >
      {isEditing ? (
        <input
          autoFocus={autofocus}
          ref={inputRef}
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={confirm}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setIsEditing(false);
          }}
          className={`w-full bg-transparent ${className} focus:outline-none `}
        />
      ) : (
        <h1
          className={`
            ${!value ? "italic opacity-50" : ""}
            ${
              isEditable
                ? "cursor-pointer hover:text-accent"
                : "cursor-default "
            }
            transition-colors 
            overflow-hidden text-ellipsis whitespace-nowrap block
        `}
          title={isEditable ? "Click to rename" : "This list can’t be renamed"}
        >
          {value ?? unnamedPlaceholder}
        </h1>
      )}
    </div>
  );
}
