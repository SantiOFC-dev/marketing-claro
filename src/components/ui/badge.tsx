import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
};

const toneClasses: Record<NonNullable<BadgeProps["tone"]>, string> = {
  brand: "bg-[var(--brand-soft)] text-[var(--brand)]",
  success: "bg-emerald-400/12 text-emerald-300",
  warning: "bg-amber-400/12 text-amber-300",
  danger: "bg-red-400/12 text-red-300",
  neutral: "bg-white/6 text-[var(--text-secondary)]",
};

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
