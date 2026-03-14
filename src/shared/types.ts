export interface UserProfile {
  name: string;
  title: string;
  bio: string;
  skills: { name: string; level: number }[];
  hourlyRateMin: number;
  hourlyRateMax: number;
  experience: string;
  categories: string[];
  portfolioLinks: string[];
  jobSuccessScore?: number;
  completeness?: number;
}

export interface SavedJob {
  id: string;
  title: string;
  link: string;
  budget: string;
  description: string;
  skills: string[];
  category: string;
  jobType: string;
  experienceLevel: string;
  clientCountry: string;
  pubDate: string;
  status: "saved" | "applied" | "rejected";
  score?: number;
  savedAt: string;
  source?: string;
  company?: string;
  salaryType?: string;
  remoteType?: string;
  clientRating?: number;
  clientSpent?: string;
  clientHires?: number;
  proposals?: string;
  connectsRequired?: number;
}

export interface SavedProposal {
  id: string;
  jobId: string;
  jobTitle: string;
  text: string;
  createdAt: string;
  status: "draft" | "sent" | "viewed" | "replied";
  score?: number;
}

export interface ScrapedPageData {
  type: PageType;
  url: string;
  timestamp: number;
  data: ProfileData | JobSearchData | JobDetailData | ChatData | null;
}

export type PageType =
  | "profile"
  | "job-search"
  | "job-detail"
  | "messages"
  | "unknown";

export interface ProfileData {
  name: string;
  title: string;
  bio: string;
  skills: string[];
  hourlyRate: string;
  jobSuccessScore: string;
  totalEarnings: string;
  totalJobs: string;
  location: string;
  memberSince: string;
  portfolio: { title: string; description: string }[];
  completeness: number;
}

export interface JobSearchData {
  jobs: ScrapedJob[];
}

export interface ScrapedJob {
  id: string;
  title: string;
  description: string;
  skills: string[];
  budget: string;
  jobType: string;
  experienceLevel: string;
  clientCountry: string;
  clientRating: string;
  clientSpent: string;
  proposals: string;
  connectsRequired: string;
  postedTime: string;
  link: string;
}

export interface JobDetailData extends ScrapedJob {
  fullDescription: string;
  clientHires: string;
  clientOpenJobs: string;
  attachments: string[];
  questions: string[];
}

export interface ChatData {
  contactName: string;
  jobTitle: string;
  messages: ChatMessage[];
  meetings?: MeetingData[];
}

export interface ChatMessage {
  sender: string;
  text: string;
  timestamp: string;
}

export interface MeetingData {
  title: string;
  scheduledTime: string;
  contactName: string;
  jobContext: string;
}

export interface ProfileAnalysis {
  overallScore: number;
  sections: {
    name: string;
    score: number;
    suggestions: string[];
  }[];
  summary: string;
}

export interface JobScore {
  id: string;
  score: number;
  reason: string;
}

export interface ChatReply {
  tone: "brief" | "detailed" | "custom";
  text: string;
}

export interface MeetingPrep {
  talkingPoints: string[];
  likelyQuestions: string[];
  preparationTips: string[];
}

export interface ExtensionSettings {
  openrouterApiKey: string;
  aiModel: string;
  theme: "light" | "dark";
  autoScore: boolean;
  autoSwitchTabs: boolean;
}

export interface PortfolioSources {
  githubUrl: string;
  portfolioUrl: string;
}

export interface GitHubRepoData {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  topics: string[];
  readme?: string;
}

export interface GitHubProfileData {
  username: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  publicRepos: number;
  followers: number;
  repos: GitHubRepoData[];
}

export interface PortfolioWebsiteData {
  url: string;
  title: string;
  extractedText: string;
}

export interface FetchedPortfolioData {
  github?: GitHubProfileData;
  website?: PortfolioWebsiteData;
  fetchedAt: string;
}

export interface PortfolioSuggestions {
  suggestedTitles: string[];
  suggestedBio: string;
  suggestedSkills: { name: string; level: number; source: string }[];
  rateRecommendation: { min: number; max: number; reasoning: string };
  portfolioHighlights: { projectName: string; description: string; relevantSkills: string[] }[];
  completenessAssessment: { score: number; strengths: string[]; gaps: string[]; recommendations: string[] };
  generatedAt: string;
}
