"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function SelectionUnlocker() {
  const pathname = usePathname();

  useEffect(() => {
    const shouldUnlockSelection = pathname === "/developer" || pathname.startsWith("/developer/");

    if (shouldUnlockSelection) {
      document.body.dataset.selectionUnlocked = "true";
    } else {
      delete document.body.dataset.selectionUnlocked;
    }

    return () => {
      delete document.body.dataset.selectionUnlocked;
    };
  }, [pathname]);

  return null;
}
