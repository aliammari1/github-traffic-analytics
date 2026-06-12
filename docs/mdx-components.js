// SPDX-License-Identifier: MIT
import { useMDXComponents as getDocsMDXComponents } from "nextra-theme-docs";

const docsComponents = getDocsMDXComponents();

export function useMDXComponents(components) {
  return { ...docsComponents, ...components };
}
