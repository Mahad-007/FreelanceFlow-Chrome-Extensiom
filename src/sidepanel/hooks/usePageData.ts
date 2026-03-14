import { useUIStore } from "../store";

export function usePageData() {
  const pageData = useUIStore((s) => s.pageData);
  const pageType = useUIStore((s) => s.pageType);
  return { pageData, pageType };
}
