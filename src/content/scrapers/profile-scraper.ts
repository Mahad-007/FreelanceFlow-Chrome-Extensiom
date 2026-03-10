import type { ProfileData } from "../../shared/types";

export function scrapeProfile(): ProfileData {
  const getText = (selector: string): string =>
    document.querySelector(selector)?.textContent?.trim() || "";

  const getTexts = (selector: string): string[] =>
    Array.from(document.querySelectorAll(selector))
      .map((el) => el.textContent?.trim() || "")
      .filter(Boolean);

  // Name - try multiple selectors (Upwork changes DOM frequently)
  const name =
    getText('[data-qa="freelancer-profile-name"]') ||
    getText("h1.identity-name") ||
    getText('[itemprop="name"]') ||
    getText(".fe-profile-name") ||
    getText("h2.my-0");

  // Title
  const title =
    getText('[data-qa="freelancer-profile-title"]') ||
    getText(".up-card-section .my-0.d-lg-block") ||
    getText('[role="presentation"] .up-card-section h2') ||
    getText(".profile-title");

  // Bio/Overview
  const bio =
    getText('[data-qa="profile-overview"]') ||
    getText(".up-line-clamp-v2") ||
    getText(".overview .up-card-section p") ||
    getText('[data-qa="description"]');

  // Skills
  const skills =
    getTexts('[data-qa="freelancer-skill"] .up-skill-badge') ||
    getTexts(".up-skill-badge span") ||
    getTexts('[data-qa="skill-list"] .skill') ||
    getTexts(".skills-list .badge");

  // Hourly rate
  const hourlyRate =
    getText('[data-qa="hourly-rate"] span') ||
    getText(".rate .up-card-section span") ||
    getText('[data-qa="rate"]') ||
    getText(".hourly-rate");

  // Job success score
  const jobSuccessScore =
    getText('[data-qa="job-success-score"]') ||
    getText(".job-success-score") ||
    getText('[data-qa="job-success"] .up-card-section span');

  // Earnings
  const totalEarnings =
    getText('[data-qa="total-earnings"]') ||
    getText(".total-earnings") ||
    getText(".earnings-amount");

  // Total jobs
  const totalJobs =
    getText('[data-qa="total-jobs"]') ||
    getText(".total-jobs") ||
    getText(".jobs-completed");

  // Location
  const location =
    getText('[data-qa="freelancer-location"]') ||
    getText('[itemprop="address"]') ||
    getText(".location");

  // Member since
  const memberSince =
    getText('[data-qa="member-since"]') ||
    getText(".member-since");

  // Portfolio items
  const portfolioElements = document.querySelectorAll(
    '[data-qa="portfolio-item"], .portfolio-item, .up-card-section .portfolio'
  );
  const portfolio = Array.from(portfolioElements).map((el) => ({
    title: el.querySelector("h3, .title")?.textContent?.trim() || "",
    description: el.querySelector("p, .description")?.textContent?.trim() || "",
  }));

  // Calculate completeness (rough estimate)
  let completeness = 0;
  if (name) completeness += 10;
  if (title) completeness += 15;
  if (bio && bio.length > 50) completeness += 20;
  if (skills.length >= 3) completeness += 15;
  if (hourlyRate) completeness += 10;
  if (portfolio.length > 0) completeness += 15;
  if (jobSuccessScore) completeness += 10;
  if (totalEarnings) completeness += 5;

  return {
    name,
    title,
    bio,
    skills,
    hourlyRate,
    jobSuccessScore,
    totalEarnings,
    totalJobs,
    location,
    memberSince,
    portfolio,
    completeness,
  };
}
