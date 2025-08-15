import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/utils"; // your className merge helper

const buttonVariants = cva(
  "flex flex-row gap-1.5 items-center justify-center cursor-pointer rounded-md font-medium transition-all" +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50" +
    "disabled:pointer-events-none px-3 py-1 duration-300",
  {
    variants: {
      variant: {
        default:
          "bg-primary border-primary text-off-white hover:text-primary hover:bg-accent",
        secondary:
          "bg-primary-foreground border-white text-primary hover:bg-accent hover:text-off-white",
        white:
          "bg-primary-foreground text-primary-darker border-white hover:bg-secondary-lighter",
        destructive:
          "bg-rose-400 outline-2 outline-rose-400 text-off-white  hover:outline-rose-500 hover:bg-rose-300",
        good: "bg-accent outline-2 outline-accent text-primary hover:text-off-white hover:bg-accent/60",
        kinda_good:
          "text-primary bg-secondary outline-2 outline-secondary hover:bg-primary-foreground",
        accent:
          "bg-primary-foreground text-primary hover:bg-primary-foreground",
        outline:
          "bg-transparent outline-2 outline-white text-off-white hover:bg-primary-foreground/30 ",
        outline_primary:
          "bg-transparent outline-2 outline-primary text-primary hover:bg-secondary/50 ",
        outline_accent:
          "bg-transparent outline-2 outline-white text-off-white hover:text-accent hover:outline-accent",
        dashboard_selected: "bg-accent text-primary",
        dashboard_unselected: "hover:bg-accent",
        dashboard_sidebar_selected:
          "text-primary bg-accent border-2 border-accent",
        dashboard_sidebar_unselected:
          "text-off-white border-2 border-transparent hover:bg-accent hover:text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant }),
          "disabled:opacity-50 disabled:pointer-events-none",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
