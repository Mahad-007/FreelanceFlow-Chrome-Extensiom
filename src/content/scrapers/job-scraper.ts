import type { JobSearchData, ScrapedJob, JobDetailData } from "../../shared/types";

export function scrapeJobSearch(): JobSearchData {
  const jobCards = document.querySelectorAll(
    '[data-test="job-tile-list"] > section, ' +
    '[data-test="JobTile"], ' +
    '.job-tile, ' +
    'article[data-ev-label="search_results_impression"]'
  );

  const jobs: ScrapedJob[] = Array.from(jobCards).map((card, i) => {
    const getText = (selector: string) =>
      card.querySelector(selector)?.textContent?.trim() || "";

    const getHref = (selector: string) =>
      (card.querySelector(selector) as HTMLAnchorElement)?.href || "";

    // Title and link
    const titleEl = card.querySelector(
      'a[data-test="job-tile-title-link"], ' +
      'a.job-title-link, ' +
      'h2 a, ' +
      '.up-card-section a.up-n-link'
    ) as HTMLAnchorElement | null;

    const title = titleEl?.textContent?.trim() || getText("h2") || `Job ${i + 1}`;
    const link = titleEl?.href || "";

    // Extract job ID from link
    const idMatch = link.match(/~([a-zA-Z0-9]+)/);
    const id = idMatch ? idMatch[1] : `job-${i}-${Date.now()}`;

    // Description
    const description =
      getText('[data-test="job-description-text"]') ||
      getText('[data-test="UpCLineClamp"] span') ||
      getText(".job-description") ||
      getText(".up-line-clamp-v2 span");

    // Skills
    const skills = Array.from(
      card.querySelectorAll(
        '[data-test="token"] .air3-token, ' +
        '[data-test="attr-item"], ' +
        '.up-skill-badge span, ' +
        '[data-test="job-tile-skills"] .air3-token'
      )
    )
      .map((el) => el.textContent?.trim() || "")
      .filter(Boolean);

    // Budget
    const budget =
      getText('[data-test="budget"]') ||
      getText('[data-test="is-fixed-price"]') ||
      getText('[data-test="job-type-label"]') ||
      getText(".budget") ||
      "";

    // Job type (fixed/hourly)
    const jobType =
      getText('[data-test="job-type"]') ||
      (budget.toLowerCase().includes("fixed") ? "Fixed" : "Hourly");

    // Experience level
    const experienceLevel =
      getText('[data-test="contractor-tier"]') ||
      getText('[data-test="experience-level"]') ||
      getText(".experience-level") ||
      "";

    // Client info
    const clientCountry =
      getText('[data-test="client-country"]') ||
      getText('[data-test="location"]') ||
      getText(".client-location") ||
      "";

    const clientRating =
      getText('[data-test="client-rating"]') ||
      getText(".rating") ||
      "";

    const clientSpent =
      getText('[data-test="total-spent"]') ||
      getText('[data-test="client-spendings"]') ||
      getText(".client-spent") ||
      "";

    // Proposals count
    const proposals =
      getText('[data-test="proposals"]') ||
      getText('[data-test="proposals-tier"]') ||
      getText(".proposals") ||
      "";

    // Connects required
    const connectsText =
      getText('[data-test="connects"]') ||
      getText(".connects-required") ||
      "";

    // Posted time
    const postedTime =
      getText('[data-test="posted-on"]') ||
      getText('[data-test="job-pubilshed-date"]') ||
      getText("time") ||
      getText(".posted-on") ||
      "";

    return {
      id,
      title,
      description,
      skills,
      budget,
      jobType,
      experienceLevel,
      clientCountry,
      clientRating,
      clientSpent,
      proposals,
      connectsRequired: connectsText,
      postedTime,
      link,
    };
  });

  return { jobs };
}

export function scrapeJobDetail(): JobDetailData {
  const getText = (selector: string) =>
    document.querySelector(selector)?.textContent?.trim() || "";

  const getTexts = (selector: string) =>
    Array.from(document.querySelectorAll(selector))
      .map((el) => el.textContent?.trim() || "")
      .filter(Boolean);

  const getHref = (selector: string) =>
    (document.querySelector(selector) as HTMLAnchorElement)?.href || "";

  // Title
  const title =
    getText('[data-test="job-details-header"] h4') ||
    getText('[data-qa="job-title"]') ||
    getText("header h4") ||
    getText("h1");

  // Full description
  const fullDescription =
    getText('[data-test="description"]') ||
    getText('[data-qa="job-description"]') ||
    getText(".job-description .break") ||
    getText('[data-test="job-description-text"]');

  // Short description (first 500 chars)
  const description = fullDescription.slice(0, 500);

  // Skills
  const skills =
    getTexts('[data-test="skill"] .air3-token') ||
    getTexts('[data-qa="skill-list"] .skill') ||
    getTexts(".up-skill-badge span") ||
    getTexts('[data-test="attrs-skills"] .air3-token');

  // Budget
  const budget =
    getText('[data-test="budget"]') ||
    getText('[data-qa="budget"]') ||
    getText(".budget") ||
    "";

  // Job type
  const jobType =
    getText('[data-test="job-type"]') ||
    (budget.toLowerCase().includes("fixed") ? "Fixed" : "Hourly");

  // Experience level
  const experienceLevel =
    getText('[data-test="experience-level"]') ||
    getText('[data-qa="experience-level"]') ||
    "";

  // Client info
  const clientCountry =
    getText('[data-test="client-location"]') ||
    getText('[data-qa="client-location"]') ||
    "";

  const clientRating =
    getText('[data-test="client-rating"]') ||
    getText('[data-qa="client-rating"]') ||
    "";

  const clientSpent =
    getText('[data-test="total-spent"]') ||
    getText('[data-qa="total-spent"]') ||
    "";

  const clientHires =
    getText('[data-test="total-hires"]') ||
    getText('[data-qa="total-hires"]') ||
    "";

  const clientOpenJobs =
    getText('[data-test="open-jobs"]') ||
    getText('[data-qa="open-jobs"]') ||
    "";

  const proposals =
    getText('[data-test="proposals"]') ||
    getText('[data-qa="proposals"]') ||
    "";

  const connectsRequired =
    getText('[data-test="connects"]') ||
    getText('[data-qa="connects"]') ||
    "";

  const postedTime =
    getText('[data-test="posted-on"]') ||
    getText('[data-qa="posted-on"]') ||
    getText("time") ||
    "";

  // URL and ID
  const link = window.location.href;
  const idMatch = link.match(/~([a-zA-Z0-9]+)/);
  const id = idMatch ? idMatch[1] : `job-${Date.now()}`;

  // Attachments
  const attachments = Array.from(
    document.querySelectorAll('[data-test="attachment"] a, .attachment a')
  ).map((el) => (el as HTMLAnchorElement).href);

  // Client questions
  const questions = getTexts(
    '[data-test="question"], .additional-questions li, [data-qa="screening-question"]'
  );

  return {
    id,
    title,
    description,
    fullDescription,
    skills,
    budget,
    jobType,
    experienceLevel,
    clientCountry,
    clientRating,
    clientSpent,
    clientHires,
    clientOpenJobs,
    proposals,
    connectsRequired,
    postedTime,
    link,
    attachments,
    questions,
  };
}
