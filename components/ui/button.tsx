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
          "bg-primary border-primary text-white hover:text-primary hover:bg-accent",
        secondary:
          "bg-white border-white text-primary hover:bg-accent hover:text-white",
        white:
          "bg-white text-primary-darker border-white hover:bg-secondary-lighter",
        destructive:
          "bg-rose-400 outline-2 outline-rose-400 text-white  hover:outline-rose-500 hover:bg-rose-300",
        good: "bg-accent outline-2 outline-accent text-primary hover:text-white hover:bg-accent/60",
        accent: "bg-white text-primary hover:bg-white",
        outline:
          "bg-transparent outline-2 outline-white text-white hover:bg-white/30 ",
        outline_primary:
          "bg-transparent outline-2 outline-primary text-primary hover:bg-secondary/50 ",
        outline_accent:
          "bg-transparent outline-2 outline-white text-white hover:text-accent hover:outline-accent",
        dashboard_selected: "bg-accent text-primary",
        dashboard_unselected: "hover:bg-accent",
        dashboard_sidebar_selected:
          "text-primary bg-accent border-2 border-accent",
        dashboard_sidebar_unselected:
          "text-white border-2 border-transparent hover:bg-accent hover:text-primary",
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
        className={cn(buttonVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
