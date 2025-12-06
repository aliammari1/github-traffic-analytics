"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "@/lib/utils";

/**
 * Styled wrapper around the Radix Label primitive that provides consistent layout and disabled-state styling.
 *
 * Merges the provided `className` with the component's default classes (layout, typography, and disabled/peer-disabled styles),
 * sets `data-slot="label"`, and forwards all other props to `LabelPrimitive.Root`.
 *
 * @param className - Additional CSS class names to merge with the component's default classes
 * @param props - Remaining props forwarded to the underlying `LabelPrimitive.Root`
 * @returns The rendered `LabelPrimitive.Root` element
 */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Label };
