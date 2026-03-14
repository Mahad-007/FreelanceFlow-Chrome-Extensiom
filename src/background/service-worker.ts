import { chatCompletion, testApiKey } from "./ai-client";
import { fetchGitHubProfile, fetchPortfolioWebsite } from "./portfolio-fetcher";
import {
  buildScoreJobsPrompt,
  buildProposalPrompt,
  buildProfileAnalysisPrompt,
  buildProfileImprovementPrompt,
  buildChatRepliesPrompt,
  buildMeetingPrepPrompt,
  buildPortfolioAnalysisPrompt,
} from "../shared/prompts";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "../shared/constants";
import type { PanelMessage, ContentMessage } from "../shared/messages";
import type { ExtensionSettings, JobScore, ProfileAnalysis, ChatReply, MeetingPrep, FetchedPortfolioData, PortfolioSuggestions } from "../shared/types";

// Open side panel when extension icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);

// Listen for content script messages (page data)
chrome.runtime.onMessage.addListener((message: ContentMessage | PanelMessage, _sender, sendResponse) => {
  if (message.type === "PAGE_DATA" || message.type === "PAGE_CHANGED") {
    // Store page data in session storage for the side panel to read
    if (message.type === "PAGE_DATA") {
      chrome.storage.session.set({ [STORAGE_KEYS.CURRENT_PAGE]: message.data });
    }
    // Forward to side panel (it listens via storage.onChanged)
    return false;
  }

  // Handle panel messages (AI requests)
  handlePanelMessage(message as PanelMessage)
    .then((result) => sendResponse({ success: true, data: result }))
    .catch((error) => sendResponse({ success: false, error: error.message }));

  return true; // Keep message channel open for async response
});

async function getSettings(): Promise<ExtensionSettings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...result[STORAGE_KEYS.SETTINGS] };
}

async function handlePanelMessage(message: PanelMessage): Promise<unknown> {
  const settings = await getSettings();

  switch (message.type) {
    case "TEST_API_KEY":
      return testApiKey(message.apiKey);

    case "GET_SETTINGS":
      return settings;

    case "SAVE_SETTINGS": {
      const updated = { ...settings, ...message.settings };
      await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated });
      return updated;
    }

    case "GET_PROFILE": {
      const result = await chrome.storage.local.get(STORAGE_KEYS.PROFILE);
      return result[STORAGE_KEYS.PROFILE] || null;
    }

    case "SAVE_PROFILE": {
      await chrome.storage.local.set({ [STORAGE_KEYS.PROFILE]: message.profile });
      return true;
    }

    case "AI_SCORE_JOBS": {
      const prompt = buildScoreJobsPrompt(message.jobs, message.profile);
      const text = await chatCompletion(prompt, settings.openrouterApiKey, settings.aiModel);
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return message.jobs.map((j) => ({ id: j.id, score: 50, reason: "Could not parse" }));
      try {
        const scores: JobScore[] = JSON.parse(jsonMatch[0]);
        // Cache scores
        const cacheResult = await chrome.storage.local.get(STORAGE_KEYS.CACHED_SCORES);
        const cache = cacheResult[STORAGE_KEYS.CACHED_SCORES] || {};
        for (const s of scores) {
          cache[s.id] = { score: s.score, reason: s.reason, timestamp: Date.now() };
        }
        await chrome.storage.local.set({ [STORAGE_KEYS.CACHED_SCORES]: cache });
        return scores;
      } catch {
        return message.jobs.map((j) => ({ id: j.id, score: 50, reason: "Parse error" }));
      }
    }

    case "AI_GENERATE_PROPOSAL": {
      const prompt = buildProposalPrompt(message.job, message.profile, message.portfolioContext);
      const text = await chatCompletion(prompt, settings.openrouterApiKey, settings.aiModel);
      // Save proposal
      const proposalsResult = await chrome.storage.local.get(STORAGE_KEYS.PROPOSALS);
      const proposals = proposalsResult[STORAGE_KEYS.PROPOSALS] || [];
      proposals.unshift({
        id: Date.now().toString(36),
        jobId: message.job.id || "",
        jobTitle: message.job.title,
        text,
        createdAt: new Date().toISOString(),
        status: "draft",
      });
      // Keep only last 50
      await chrome.storage.local.set({ [STORAGE_KEYS.PROPOSALS]: proposals.slice(0, 50) });
      return text;
    }

    case "AI_ANALYZE_PROFILE": {
      const prompt = buildProfileAnalysisPrompt(message.profile, message.userProfile);
      const text = await chatCompletion(prompt, settings.openrouterApiKey, settings.aiModel);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to parse profile analysis");
      return JSON.parse(jsonMatch[0]) as ProfileAnalysis;
    }

    case "AI_IMPROVE_PROFILE": {
      const prompt = buildProfileImprovementPrompt(message.job, message.profile);
      const text = await chatCompletion(prompt, settings.openrouterApiKey, settings.aiModel);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to parse improvement suggestions");
      return JSON.parse(jsonMatch[0]);
    }

    case "AI_CHAT_REPLIES": {
      const prompt = buildChatRepliesPrompt(message.chat, message.profile);
      const text = await chatCompletion(prompt, settings.openrouterApiKey, settings.aiModel);
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Failed to parse chat replies");
      return JSON.parse(jsonMatch[0]) as ChatReply[];
    }

    case "AI_MEETING_PREP": {
      const prompt = buildMeetingPrepPrompt(message.jobContext, message.chatContext, message.profile);
      const text = await chatCompletion(prompt, settings.openrouterApiKey, settings.aiModel);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to parse meeting prep");
      return JSON.parse(jsonMatch[0]) as MeetingPrep;
    }

    case "SAVE_PORTFOLIO_SOURCES": {
      await chrome.storage.local.set({ [STORAGE_KEYS.PORTFOLIO_SOURCES]: message.sources });
      return true;
    }

    case "FETCH_PORTFOLIO": {
      const result: FetchedPortfolioData = { fetchedAt: new Date().toISOString() };

      if (message.sources.githubUrl) {
        result.github = await fetchGitHubProfile(message.sources.githubUrl);
      }
      if (message.sources.portfolioUrl) {
        result.website = await fetchPortfolioWebsite(message.sources.portfolioUrl);
      }

      await chrome.storage.local.set({
        [STORAGE_KEYS.PORTFOLIO_SOURCES]: message.sources,
        [STORAGE_KEYS.PORTFOLIO_DATA]: result,
      });
      return result;
    }

    case "AI_ANALYZE_PORTFOLIO": {
      const prompt = buildPortfolioAnalysisPrompt(message.data, message.currentProfile);
      const text = await chatCompletion(prompt, settings.openrouterApiKey, settings.aiModel);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Failed to parse portfolio analysis");
      const suggestions: PortfolioSuggestions = {
        ...JSON.parse(jsonMatch[0]),
        generatedAt: new Date().toISOString(),
      };
      await chrome.storage.local.set({ [STORAGE_KEYS.PORTFOLIO_SUGGESTIONS]: suggestions });
      return suggestions;
    }

    case "GET_PORTFOLIO_DATA": {
      const stored = await chrome.storage.local.get([
        STORAGE_KEYS.PORTFOLIO_SOURCES,
        STORAGE_KEYS.PORTFOLIO_DATA,
        STORAGE_KEYS.PORTFOLIO_SUGGESTIONS,
      ]);
      return {
        sources: stored[STORAGE_KEYS.PORTFOLIO_SOURCES] || null,
        data: stored[STORAGE_KEYS.PORTFOLIO_DATA] || null,
        suggestions: stored[STORAGE_KEYS.PORTFOLIO_SUGGESTIONS] || null,
      };
    }

    default:
      throw new Error(`Unknown message type: ${(message as { type: string }).type}`);
  }
}

// Migrate stale model IDs (hyphens → dots) on startup
chrome.runtime.onInstalled.addListener(async () => {
  const MODEL_RENAMES: Record<string, string> = {
    "anthropic/claude-opus-4-6": "anthropic/claude-opus-4.6",
    "anthropic/claude-sonnet-4-6": "anthropic/claude-sonnet-4.6",
  };
  const settingsResult = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  const saved = settingsResult[STORAGE_KEYS.SETTINGS];
  if (saved?.aiModel && MODEL_RENAMES[saved.aiModel]) {
    saved.aiModel = MODEL_RENAMES[saved.aiModel];
    await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: saved });
  }
});

// Cleanup old score cache on startup
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get(STORAGE_KEYS.CACHED_SCORES);
  const cache = result[STORAGE_KEYS.CACHED_SCORES] || {};
  const now = Date.now();
  const ttl = 24 * 60 * 60 * 1000;
  let changed = false;
  for (const key of Object.keys(cache)) {
    if (cache[key].timestamp && now - cache[key].timestamp > ttl) {
      delete cache[key];
      changed = true;
    }
  }
  if (changed) {
    await chrome.storage.local.set({ [STORAGE_KEYS.CACHED_SCORES]: cache });
  }
});
