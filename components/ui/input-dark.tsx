import * as React from "react";

import { cn } from "@/utils/utils";

function InputDark({
  className,
  type,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "placeholder:text-primary/80 selection:bg-secondary selection:text-primary dark:bg-input/30 border-primary",
        "flex w-full rounded-md border-2 bg-transparent px-3 py-1 text-primary shadow-xs transition-[color,box-shadow] outline-none",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-accent focus-visible:ring-accent/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  );
}

export { InputDark };
