export const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
export const DEFAULT_MODEL = "anthropic/claude-opus-4-6";

export const AVAILABLE_MODELS = [
  { id: "anthropic/claude-opus-4-6", name: "Claude Opus 4.6" },
  { id: "anthropic/claude-sonnet-4-6", name: "Claude Sonnet 4.6" },
  { id: "anthropic/claude-sonnet-4-5-20250514", name: "Claude Sonnet 4.5" },
  { id: "anthropic/claude-haiku-4-5-20251001", name: "Claude Haiku 4.5" },
  { id: "openai/gpt-4o", name: "GPT-4o" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash" },
];

export const RATE_LIMIT = {
  maxRequests: 10,
  windowMs: 60_000,
};

export const STORAGE_KEYS = {
  SETTINGS: "settings",
  PROFILE: "userProfile",
  CACHED_SCORES: "cachedJobScores",
  PROPOSALS: "generatedProposals",
  CHAT_HISTORY: "chatReplyHistory",
  CURRENT_PAGE: "currentPage",
  PORTFOLIO_SOURCES: "portfolioSources",
  PORTFOLIO_DATA: "portfolioData",
  PORTFOLIO_SUGGESTIONS: "portfolioSuggestions",
} as const;

export const MAX_PROPOSALS = 50;
export const MAX_CHAT_HISTORY = 20;
export const SCORE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

export const DEFAULT_SETTINGS = {
  openrouterApiKey: "",
  aiModel: DEFAULT_MODEL,
  theme: "dark" as const,
  autoScore: true,
  autoSwitchTabs: true,
};
