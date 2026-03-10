import { create } from "zustand";
import type { PageType, ScrapedPageData, UserProfile, ExtensionSettings, JobScore, PortfolioSources, FetchedPortfolioData, PortfolioSuggestions } from "../shared/types";
import { DEFAULT_SETTINGS, STORAGE_KEYS } from "../shared/constants";

interface UIState {
  activeTab: string;
  pageType: PageType;
  pageData: ScrapedPageData | null;
  profile: UserProfile | null;
  settings: ExtensionSettings;
  loading: Record<string, boolean>;
  errors: Record<string, string>;
  portfolioSources: PortfolioSources | null;
  portfolioData: FetchedPortfolioData | null;
  portfolioSuggestions: PortfolioSuggestions | null;

  setActiveTab: (tab: string) => void;
  setPageData: (data: ScrapedPageData | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setSettings: (settings: ExtensionSettings) => void;
  setLoading: (key: string, value: boolean) => void;
  setError: (key: string, error: string) => void;
  clearError: (key: string) => void;
  setPortfolioSources: (sources: PortfolioSources | null) => void;
  setPortfolioData: (data: FetchedPortfolioData | null) => void;
  setPortfolioSuggestions: (suggestions: PortfolioSuggestions | null) => void;
  initialize: () => Promise<void>;
}

const PAGE_TYPE_TO_TAB: Record<PageType, string> = {
  profile: "profile-scanner",
  "job-search": "job-hunter",
  "job-detail": "proposal",
  messages: "chat",
  unknown: "job-hunter",
};

export const useUIStore = create<UIState>((set, get) => ({
  activeTab: "job-hunter",
  pageType: "unknown",
  pageData: null,
  profile: null,
  settings: DEFAULT_SETTINGS,
  loading: {},
  errors: {},
  portfolioSources: null,
  portfolioData: null,
  portfolioSuggestions: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setPageData: (data) => {
    const updates: Partial<UIState> = { pageData: data };
    if (data) {
      updates.pageType = data.type;
      const { settings } = get();
      if (settings.autoSwitchTabs) {
        updates.activeTab = PAGE_TYPE_TO_TAB[data.type] || "job-hunter";
      }
    }
    set(updates);
  },

  setProfile: (profile) => set({ profile }),
  setSettings: (settings) => set({ settings }),
  setLoading: (key, value) => set({ loading: { ...get().loading, [key]: value } }),
  setError: (key, error) => set({ errors: { ...get().errors, [key]: error } }),
  clearError: (key) => {
    const errors = { ...get().errors };
    delete errors[key];
    set({ errors });
  },

  setPortfolioSources: (portfolioSources) => set({ portfolioSources }),
  setPortfolioData: (portfolioData) => set({ portfolioData }),
  setPortfolioSuggestions: (portfolioSuggestions) => set({ portfolioSuggestions }),

  initialize: async () => {
    // Load settings, profile, page data, and portfolio data in parallel
    const [settingsResult, profileResult, pageResult, portfolioResult] = await Promise.all([
      chrome.storage.local.get(STORAGE_KEYS.SETTINGS),
      chrome.storage.local.get(STORAGE_KEYS.PROFILE),
      chrome.storage.session.get(STORAGE_KEYS.CURRENT_PAGE),
      chrome.storage.local.get([
        STORAGE_KEYS.PORTFOLIO_SOURCES,
        STORAGE_KEYS.PORTFOLIO_DATA,
        STORAGE_KEYS.PORTFOLIO_SUGGESTIONS,
      ]),
    ]);

    const settings = { ...DEFAULT_SETTINGS, ...settingsResult[STORAGE_KEYS.SETTINGS] };
    const profile = profileResult[STORAGE_KEYS.PROFILE] || null;
    const pageData = pageResult[STORAGE_KEYS.CURRENT_PAGE] || null;

    set({
      settings,
      profile,
      pageData,
      pageType: pageData?.type || "unknown",
      activeTab: pageData ? (PAGE_TYPE_TO_TAB[pageData.type as PageType] || "job-hunter") : "job-hunter",
      portfolioSources: portfolioResult[STORAGE_KEYS.PORTFOLIO_SOURCES] || null,
      portfolioData: portfolioResult[STORAGE_KEYS.PORTFOLIO_DATA] || null,
      portfolioSuggestions: portfolioResult[STORAGE_KEYS.PORTFOLIO_SUGGESTIONS] || null,
    });

    // Listen for page data changes from content script
    chrome.storage.session.onChanged.addListener((changes) => {
      if (changes[STORAGE_KEYS.CURRENT_PAGE]) {
        const data = changes[STORAGE_KEYS.CURRENT_PAGE].newValue;
        get().setPageData(data || null);
      }
    });
  },
}));
