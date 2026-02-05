import type { ComponentChildren } from "preact";

export interface ButtonProps {
  id?: string;
  onClick?: () => void;
  children?: ComponentChildren;
  disabled?: boolean;
}

export function Button(props: ButtonProps) {
  return (
    <button
      {...props}
      class="px-4 py-2 font-heading font-semibold text-sm text-white bg-meadow border-2 border-meadow-dark rounded-xl transition-all duration-150 hover:brightness-95 hover:translate-y-px active:translate-y-0.5 disabled:opacity-50"
      style={{
        boxShadow: "0 3px 0 var(--color-meadow-dark)",
      }}
    />
  );
}
