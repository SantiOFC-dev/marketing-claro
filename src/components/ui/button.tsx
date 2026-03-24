import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-[var(--brand)] bg-[var(--brand)] px-4 py-2 text-slate-950 hover:brightness-110",
        outline: "border-[var(--app-border-strong)] bg-white/0 px-4 py-2 text-[var(--text-primary)] hover:bg-white/5",
        ghost: "border-transparent bg-white/0 px-3 py-2 text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]",
      },
      size: {
        default: "h-10",
        sm: "h-8 rounded-lg px-3 text-xs",
        icon: "h-9 w-9 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
