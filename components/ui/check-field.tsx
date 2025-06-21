// this is the checkbox + label component

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

export function CheckField({
  text,
  isChecked,
  onChange,
  isMuted = false,
  isDisabled = false,
  isDiff = false,
  title = "",
}: {
  text: string;
  isChecked: boolean;
  onChange: (b: boolean) => void;
  isMuted?: boolean;
  isDisabled?: boolean;
  isDiff?: boolean;
  title?: string;
}) {
  return (
    <label
      className={`flex items-center gap-2 select-none p-1 group ${
        isDisabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
      title={title}
    >
      <CheckboxPrimitive.Root
        data-slot="checkbox"
        className={`
            peer border-primary dark:bg-input/30  bg-transparent
            dark:data-[state=checked]:bg-primary  focus-visible:border-ring focus-visible:ring-ring/50
            aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-3.5 shrink-0
            rounded-[4px] border-2 shadow-sm  transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed
            disabled:opacity-35 cursor-pointer ${
              isMuted
                ? "data-[state=checked]:bg-primary data-[state=checked]:border-primary/60"
                : "data-[state=checked]:bg-accent data-[state=checked]:border-primary/60"
            }
          `}
        id={`${text}-checkbox`}
        checked={isChecked}
        onCheckedChange={(checked) => onChange(checked === true)}
        disabled={isDisabled}
      >
        <CheckboxPrimitive.Indicator
          data-slot="checkbox-indicator"
          className="flex items-center justify-center text-current transition-none"
          id={`${text}-checkbox`}
        >
          {/* <FaCheck className="size-2.5 text-primary-muted" /> */}
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      <span
        className={`text-sm font-semibold leading-tight transition-colors duration-150
            ${isDiff ? "text-secondary-darker" : ""}
            ${isDisabled ? "text-primary/60" : " group-hover:text-accent"}`}
      >
        {text}
      </span>
    </label>
  );
}
