"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Renders a responsive, horizontally scrollable container that holds a table element.
 *
 * The table receives default styling (`w-full caption-bottom text-sm`) merged with any
 * provided `className`, and all other props are forwarded to the underlying table element.
 *
 * @returns A React element containing a table inside a horizontally scrollable container.
 */
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}

/**
 * Renders a table header (<thead>) with default bottom borders applied to its rows and accepts additional classes.
 *
 * @returns The rendered `<thead>` element with `data-slot="table-header"` and combined class names.
 */
function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("[&_tr]:border-b", className)} {...props} />;
}

/**
 * Renders a table body element with default styling that removes the bottom border from the last row.
 *
 * @param className - Additional CSS classes to apply to the `tbody` element
 * @returns A `tbody` element with the default "[&_tr:last-child]:border-0" style and any provided classes and props forwarded
 */
function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

/**
 * Renders a table footer element with default footer styling and forwards provided props to the underlying <tfoot>.
 *
 * @param className - Additional class names to merge with the component's default footer styles
 * @returns The table footer (`<tfoot>`) element
 */
function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  );
}

/**
 * Renders a table row with default interactive and structural styles.
 *
 * The returned `<tr>` includes a data-slot attribute and default classes that
 * provide a hover background, selected-state background, bottom border, and
 * color transition. Any provided `className` is merged with these defaults;
 * remaining props are forwarded to the `<tr>`.
 *
 * @param className - Additional class names to append to the row's default classes
 * @returns A `<tr>` element with hover background, selected-state background, bottom border, and color transition
 */
function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a table header cell with base typography, spacing, alignment, and checkbox-aware spacing.
 *
 * @returns The rendered `<th>` element with `data-slot="table-head"` and the composed className.
 */
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a table cell (`td`) with sensible default spacing, alignment, and checkbox-aware adjustments.
 *
 * The element includes a `data-slot="table-cell"` attribute and merges provided `className` with built-in styles for padding, vertical alignment, and whitespace handling; nested elements with `role="checkbox"` receive special spacing/positioning.
 *
 * @param className - Additional CSS classes to append to the cell's default classes
 * @param props - Additional attributes and event handlers passed through to the underlying `td` element
 * @returns A `td` React element with the component's default styling and forwarded props
 */
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  );
}

/**
 * Renders a table caption element with default muted styling and spacing.
 *
 * @returns A `caption` element with muted foreground color, top margin, and small text; merges `className` with the component's default classes and forwards other caption props.
 */
function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };