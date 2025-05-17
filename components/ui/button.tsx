import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils"; // your className merge helper

const buttonVariants = cva(
  "flex flex-row items-center justify-center cursor-pointer rounded-md font-medium transition-all" +
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50" +
    "disabled:pointer-events-none px-3 py-1 duration-300",
  {
    variants: {
      variant: {
        default:
          "bg-primary border-primary text-foreground hover:text-primary-darker hover:bg-secondary-light",
        secondary:
          "bg-secondary border-secondary text-primary hover:bg-secondary-lighter hover:outline-2 hover:outline-secondary",
        white:
          "bg-white text-primary-darker border-white hover:bg-secondary-lighter",
        destructive:
          "bg-rose-400 outline-2 outline-rose-400 text-white  hover:outline-rose-500 hover:bg-rose-300",
        accent: "bg-white text-primary hover:bg-white",
        outline:
          "bg-transparent outline-2 outline-white text-white hover:bg-white/30 ",
        outline_primary:
          "bg-transparent outline-2 outline-primary text-primary hover:bg-secondary/50 ",
        outline_accent:
          "bg-transparent outline-2 outline-white text-white hover:text-accent hover:outline-accent",
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
