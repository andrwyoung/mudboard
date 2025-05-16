import { useEffect, useRef, useState } from "react";

type InlineEditTextProps = {
  value: string;
  onChange: (newValue: string) => void;
  isEditable?: boolean;
};

export default function InlineEditText({
  value,
  onChange,
  isEditable = true,
}: InlineEditTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUnnamed = /^Unnamed List( \d+)?$/.test(value);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select();
    }
  }, [isEditing]);

  const confirm = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) {
      onChange(trimmed);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`max-w-[12rem] overflow-x-auto text-left border p-1 rounded-md whitespace-nowrap font-bold tracking-wide text-xl text-primary-text ${
        isEditing ? "border-input shadow-sm" : "border-transparent"
      }`}
    >
      {isEditing ? (
        <input
          autoFocus
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={confirm}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") setIsEditing(false);
          }}
          className="w-full bg-transparent text-left focus:outline-none "
        />
      ) : (
        <span
          className={`
          ${
            isEditable
              ? "cursor-pointer hover:text-primary-muted"
              : "cursor-default text-primary-text"
          }
          ${isUnnamed ? "opacity-80 font-semibold" : "font-bold"}
          transition-colors 
          overflow-hidden text-ellipsis whitespace-nowrap block
        `}
          title={isEditable ? "Click to rename" : "This list can’t be renamed"}
          onClick={() => {
            if (!isEditable) return;
            setDraft(value);
            setIsEditing(true);
          }}
        >
          {value}
        </span>
      )}
    </div>
  );
}
