import { useEffect } from "react";
import { useUIStore } from "../store";
import { STORAGE_KEYS } from "../../shared/constants";
import type { ScrapedPageData } from "../../shared/types";

export function usePageData() {
  const pageData = useUIStore((s) => s.pageData);
  const pageType = useUIStore((s) => s.pageType);
  const setPageData = useUIStore((s) => s.setPageData);

  useEffect(() => {
    // Initial load
    chrome.storage.session.get(STORAGE_KEYS.CURRENT_PAGE).then((result) => {
      const data = result[STORAGE_KEYS.CURRENT_PAGE] as ScrapedPageData | undefined;
      if (data) setPageData(data);
    });
  }, [setPageData]);

  return { pageData, pageType };
}
