import type { GitHubProfileData, GitHubRepoData, PortfolioWebsiteData } from "../shared/types";

const GITHUB_HEADERS = {
  "User-Agent": "FreelanceFlow",
  Accept: "application/vnd.github.v3+json",
};

function extractGitHubUsername(url: string): string {
  const match = url.match(/github\.com\/([^/?\s#]+)/i);
  if (!match) throw new Error("Invalid GitHub URL. Expected format: https://github.com/username");
  return match[1];
}

export async function fetchGitHubProfile(url: string): Promise<GitHubProfileData> {
  const username = extractGitHubUsername(url);

  // Fetch profile and repos in parallel
  const [profileRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${username}`, { headers: GITHUB_HEADERS }),
    fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=20`, { headers: GITHUB_HEADERS }),
  ]);

  if (!profileRes.ok) {
    if (profileRes.status === 404) throw new Error(`GitHub user "${username}" not found`);
    if (profileRes.status === 403) throw new Error("GitHub API rate limit reached. Try again later.");
    throw new Error(`GitHub API error: ${profileRes.status}`);
  }

  const profileJson = await profileRes.json();
  const reposJson: unknown[] = reposRes.ok ? await reposRes.json() : [];

  // Map repos
  const repos: GitHubRepoData[] = (reposJson as Record<string, unknown>[])
    .filter((r) => !r.fork)
    .map((r) => ({
      name: r.name as string,
      description: (r.description as string) || null,
      language: (r.language as string) || null,
      stars: (r.stargazers_count as number) || 0,
      forks: (r.forks_count as number) || 0,
      url: (r.html_url as string) || "",
      topics: (r.topics as string[]) || [],
    }));

  // Fetch READMEs for top 5 repos by stars
  const topRepos = repos.slice(0, 5);
  const readmePromises = topRepos.map(async (repo) => {
    try {
      const res = await fetch(
        `https://raw.githubusercontent.com/${username}/${repo.name}/HEAD/README.md`,
        { headers: { "User-Agent": "FreelanceFlow" } }
      );
      if (res.ok) {
        const text = await res.text();
        repo.readme = text.slice(0, 2000);
      }
    } catch {
      // README not available, skip
    }
  });
  await Promise.all(readmePromises);

  return {
    username,
    name: (profileJson.name as string) || null,
    bio: (profileJson.bio as string) || null,
    location: (profileJson.location as string) || null,
    publicRepos: (profileJson.public_repos as number) || 0,
    followers: (profileJson.followers as number) || 0,
    repos,
  };
}

export async function fetchPortfolioWebsite(url: string): Promise<PortfolioWebsiteData> {
  // Ensure URL has protocol
  let fetchUrl = url;
  if (!/^https?:\/\//i.test(fetchUrl)) {
    fetchUrl = "https://" + fetchUrl;
  }

  const res = await fetch(fetchUrl, {
    headers: { "User-Agent": "FreelanceFlow" },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch portfolio website: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Strip non-content tags
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "");

  // Strip remaining HTML tags and collapse whitespace
  cleaned = cleaned
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Truncate to keep token usage manageable
  const extractedText = cleaned.slice(0, 10000);

  return { url: fetchUrl, title, extractedText };
}
