import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "selection-pill h-10 w-full px-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--brand)] focus:ring-1 focus:ring-[var(--brand)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
