import { useEffect } from "react";

/** Sets the document title (and optionally meta description) per route. */
export function useDocumentMeta(title: string, description?: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    let metaEl: HTMLMetaElement | null = null;
    let previousDescription: string | null = null;
    if (description) {
      metaEl = document.querySelector('meta[name="description"]');
      if (metaEl) {
        previousDescription = metaEl.getAttribute("content");
        metaEl.setAttribute("content", description);
      }
    }
    return () => {
      document.title = previous;
      if (metaEl && previousDescription !== null) {
        metaEl.setAttribute("content", previousDescription);
      }
    };
  }, [title, description]);
}
