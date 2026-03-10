import { observePageChanges } from "./page-observer";
import { scrapeProfile } from "./scrapers/profile-scraper";
import { scrapeJobSearch, scrapeJobDetail } from "./scrapers/job-scraper";
import { scrapeChat } from "./scrapers/chat-scraper";
import type { PageType, ScrapedPageData } from "../shared/types";

function detectPageType(url: string): PageType {
  const path = new URL(url).pathname;

  if (path.match(/\/freelancers\/~/) || path.match(/\/fl\//)) {
    return "profile";
  }
  if (path.match(/\/nx\/search\/jobs/) || path.match(/\/ab\/jobs\/search/) || path.match(/\/search\/jobs/)) {
    return "job-search";
  }
  if (path.match(/\/jobs\/~/) || path.match(/\/nx\/proposals\/job\/~/)) {
    return "job-detail";
  }
  if (path.match(/\/ab\/messages/) || path.match(/\/nx\/messages/)) {
    return "messages";
  }
  return "unknown";
}

async function scrapePage(pageType: PageType): Promise<ScrapedPageData["data"]> {
  // Wait a bit for SPA content to render
  await new Promise((r) => setTimeout(r, 1500));

  switch (pageType) {
    case "profile":
      return scrapeProfile();
    case "job-search":
      return scrapeJobSearch();
    case "job-detail":
      return scrapeJobDetail();
    case "messages":
      return scrapeChat();
    default:
      return null;
  }
}

async function handlePageChange(url: string) {
  const pageType = detectPageType(url);

  // Notify about page change immediately
  chrome.runtime.sendMessage({
    type: "PAGE_CHANGED",
    pageType,
    url,
  }).catch(() => {}); // Side panel may not be open

  // Scrape and send data
  const data = await scrapePage(pageType);
  const pageData: ScrapedPageData = {
    type: pageType,
    url,
    timestamp: Date.now(),
    data,
  };

  chrome.runtime.sendMessage({
    type: "PAGE_DATA",
    data: pageData,
  }).catch(() => {});
}

// Initial scrape
handlePageChange(window.location.href);

// Observe SPA navigation
observePageChanges((url) => {
  handlePageChange(url);
});
