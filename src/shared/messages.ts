import type {
  ScrapedPageData,
  UserProfile,
  ExtensionSettings,
  JobScore,
  ProfileAnalysis,
  ChatReply,
  MeetingPrep,
  ScrapedJob,
  JobDetailData,
  ChatData,
  ProfileData,
  PortfolioSources,
  FetchedPortfolioData,
  PortfolioSuggestions,
} from "./types";

// Content script -> Service worker / Side panel
export type ContentMessage =
  | { type: "PAGE_DATA"; data: ScrapedPageData }
  | { type: "PAGE_CHANGED"; pageType: ScrapedPageData["type"]; url: string };

// Side panel -> Service worker
export type PanelMessage =
  | { type: "AI_SCORE_JOBS"; jobs: ScrapedJob[]; profile: UserProfile }
  | { type: "AI_GENERATE_PROPOSAL"; job: JobDetailData | ScrapedJob; profile: UserProfile; portfolioContext?: string }
  | { type: "AI_ANALYZE_PROFILE"; profile: ProfileData; userProfile?: UserProfile }
  | { type: "AI_IMPROVE_PROFILE"; job: JobDetailData | ScrapedJob; profile: UserProfile }
  | { type: "AI_CHAT_REPLIES"; chat: ChatData; profile: UserProfile }
  | { type: "AI_MEETING_PREP"; jobContext: string; chatContext: string; profile: UserProfile }
  | { type: "TEST_API_KEY"; apiKey: string }
  | { type: "GET_SETTINGS" }
  | { type: "SAVE_SETTINGS"; settings: Partial<ExtensionSettings> }
  | { type: "GET_PROFILE" }
  | { type: "SAVE_PROFILE"; profile: UserProfile }
  | { type: "SAVE_PORTFOLIO_SOURCES"; sources: PortfolioSources }
  | { type: "FETCH_PORTFOLIO"; sources: PortfolioSources }
  | { type: "AI_ANALYZE_PORTFOLIO"; data: FetchedPortfolioData; currentProfile?: UserProfile }
  | { type: "GET_PORTFOLIO_DATA" };

// Service worker -> Side panel responses
export type ServiceResponse =
  | { success: true; data: unknown }
  | { success: false; error: string };

export type JobScoreResponse = { success: true; data: JobScore[] } | { success: false; error: string };
export type ProposalResponse = { success: true; data: string } | { success: false; error: string };
export type ProfileAnalysisResponse = { success: true; data: ProfileAnalysis } | { success: false; error: string };
export type ChatReplyResponse = { success: true; data: ChatReply[] } | { success: false; error: string };
export type MeetingPrepResponse = { success: true; data: MeetingPrep } | { success: false; error: string };
