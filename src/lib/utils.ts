import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Compose and optimize a space-delimited CSS class string from multiple class value inputs.
 *
 * @param inputs - One or more class values (strings, arrays, or objects) to combine
 * @returns A single class string with duplicate and conflicting Tailwind CSS classes merged and deduplicated
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
