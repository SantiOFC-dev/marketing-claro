import * as SeparatorPrimitive from "@radix-ui/react-separator";

export function Separator(props: React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>) {
  return <SeparatorPrimitive.Root className="bg-white/8" {...props} />;
}
