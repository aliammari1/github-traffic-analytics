import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Renders a card container element with preset styling and layout, while forwarding any additional `div` props.
 *
 * @returns A `div` element with `data-slot="card"`, default card classes for spacing, borders, and shadow, and any provided props (including `className`) merged into its attributes.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  );
}

/**
 * Header area wrapper for Card that applies the component's grid layout and header-specific styling.
 *
 * @param className - Additional CSS classes to merge with the header's default classes
 * @param props - Additional props are spread onto the underlying div element
 * @returns The rendered div element with `data-slot="card-header"` and the header layout classes applied
 */
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders the card's title container.
 *
 * The element is a div with `data-slot="card-title"` and base classes for title styling;
 * any provided `className` is merged with the base classes and all other props are passed to the div.
 *
 * @param className - Additional CSS class names to apply to the title container
 * @returns The div element used as the card title slot
 */
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  );
}

/**
 * Card description area used for supporting text within a card header.
 *
 * @returns A `div` element styled as the card's description area.
 */
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

/**
 * Renders the card action slot aligned within the card header grid.
 *
 * Accepts standard div props (including `className`) which are applied to the element.
 *
 * @returns The action container div used to position controls or actions in the card header.
 */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

/**
 * Main content area of a Card with horizontal padding.
 *
 * @returns A `div` element that serves as the card's content container, includes horizontal padding, and forwards any provided `className` and other props.
 */
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-6", className)} {...props} />;
}

/**
 * Footer area for a Card that provides horizontal padding and spacing for a top border.
 *
 * @returns A `div` element configured as the card footer with flex layout and padding.
 */
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
