"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { getPageContext } from "@/services/chatbot/pageContext";

/**
 * Returns the page context config for the current route.
 * Updates reactively when navigation occurs.
 */
export function usePageContext() {
  const pathname = usePathname();
  return useMemo(
    () => getPageContext(pathname ?? ""),
    [pathname]
  );
}
