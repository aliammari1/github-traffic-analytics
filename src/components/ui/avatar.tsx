"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

/**
 * Renders an avatar root element with circular default styling and optional additional classes.
 *
 * @param className - Additional class names to merge with the component's default classes.
 * @param props - Remaining props forwarded to the underlying AvatarPrimitive.Root element.
 * @returns The configured AvatarPrimitive.Root element used as the avatar container.
 */
function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    />
  );
}

/**
 * Renders an avatar image element with aspect ratio and sizing classes.
 *
 * @returns The Avatar image element with data-slot "avatar-image" and combined `className` values.
 */
function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
}

/**
 * Renders the avatar fallback content shown when the avatar image is unavailable.
 *
 * The component applies default styling for a circular, centered fallback and merges any
 * provided `className` with those defaults.
 *
 * @param className - Additional CSS classes to merge with the component's default classes
 * @returns The AvatarFallback React element
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn("bg-muted flex size-full items-center justify-center rounded-full", className)}
      {...props}
    />
  );
}

export { Avatar, AvatarImage, AvatarFallback };
