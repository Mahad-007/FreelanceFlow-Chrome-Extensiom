# FreelanceFlow - AI-Powered Upwork Assistant

A Chrome extension that supercharges your Upwork freelancing workflow with AI. FreelanceFlow lives in your browser's side panel and automatically detects what page you're on -- whether it's a job listing, a client chat, or your profile -- then provides contextual AI-powered tools to help you win more projects.

## Features

### Job Hunter
- **Smart Job Scoring** -- Automatically scores jobs 0-100 based on how well they match your skills, rate, and experience
- **Sort by Fit** -- Reorder job listings by match score to focus on the best opportunities first
- **Auto-Score** -- Optionally score jobs automatically as soon as a search page loads
- Displays budget, job type, experience level, client country, rating, and proposal count for each listing

### Proposal Generator
- **AI-Generated Cover Letters** -- Creates personalized, Upwork-optimized proposals tailored to each job posting
- **Portfolio-Aware** -- Automatically references your GitHub projects and portfolio highlights in proposals
- **Edit & Copy** -- Inline editing with one-click copy to clipboard
- Follows Upwork best practices: hook opening, specific experience, proposed approach, and call to action

### Profile Scanner
- **Profile Analysis** -- Scrapes any Upwork profile page and scores it across Title, Bio, Skills, Portfolio, Rate, and Completeness
- **Actionable Suggestions** -- Section-by-section improvement recommendations backed by scores
- **Completeness Tracking** -- Visual progress bar showing profile completeness percentage

### Profile Improver
- **Job-Targeted Optimization** -- Compares your profile against a specific job posting and suggests targeted improvements
- **Keyword & Skill Gaps** -- Identifies missing keywords and skills to add
- **Bio & Portfolio Tips** -- Specific edits to make your profile more competitive for the job

### Chat Assistant
- **Smart Reply Suggestions** -- Generates 3 reply options in different tones: Brief, Detailed, and Friendly
- **Conversation-Aware** -- Reads the last messages in the thread to generate contextually relevant replies
- **One-Click Copy** -- Copy any suggestion directly to your clipboard

### Meeting Prep
- **Talking Points** -- AI-generated checklist of key points to cover in client calls
- **Likely Questions** -- Predicts what the client will ask based on the job and conversation history
- **Preparation Tips** -- Actionable advice to make a great impression
- **Manual Context** -- Add context manually if no active conversation is detected

### Portfolio Builder
- **GitHub Integration** -- Fetches your GitHub profile, repos (sorted by stars), languages, and README content
- **Website Scraping** -- Extracts text from your portfolio website
- **AI Profile Suggestions** -- Generates optimized Upwork titles, bio, skills (with proficiency levels), and rate recommendations
- **One-Click Apply** -- Apply any suggestion directly to your stored profile
- **Completeness Assessment** -- Scores your portfolio data with strengths, gaps, and recommendations

### Settings
- **Multi-Model Support** -- Choose from Claude Opus 4.6, Sonnet 4.6/4.5, Haiku 4.5, GPT-4o, GPT-4o Mini, or Gemini 2.0 Flash
- **API Key Validation** -- Test your OpenRouter key before saving
- **Auto-Score Toggle** -- Enable/disable automatic job scoring on page load
- **Auto-Switch Tabs** -- Automatically switch to the relevant tab based on the current Upwork page

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 with TypeScript |
| **State Management** | Zustand |
| **Styling** | Tailwind CSS 3 (dark mode, custom neo-brutalist design system) |
| **Build Tool** | Vite 5 with multi-entry rollup config |
| **AI Backend** | OpenRouter API (multi-model router) |
| **Extension API** | Chrome Manifest V3 (service worker, side panel, content scripts) |
| **Data Fetching** | GitHub REST API v3, raw HTML scraping |

## Architecture

```
src/
  background/
    service-worker.ts    # Message router, AI orchestration, storage management
    ai-client.ts         # OpenRouter API client with rate limiting
    portfolio-fetcher.ts # GitHub API + website scraper
  content/
    index.ts             # Page detection, scraping dispatcher, SPA observer
    page-observer.ts     # MutationObserver + History API intercepts for SPA nav
    scrapers/
      profile-scraper.ts # Upwork profile data extraction
      job-scraper.ts     # Job search + job detail page extraction
      chat-scraper.ts    # Message thread extraction + live observer
      meeting-scraper.ts # Meeting/call detection from messages
  shared/
    types.ts             # TypeScript interfaces for all data models
    constants.ts         # API URLs, models, rate limits, storage keys
    messages.ts          # Typed message protocol (content <-> service worker <-> panel)
    prompts.ts           # All AI prompt templates
  sidepanel/
    index.tsx            # React entry point
    App.tsx              # Tab router, settings gate, page-aware navigation
    store.ts             # Zustand store (UI state, settings, page data, portfolio)
    styles.css           # Tailwind + custom neo-brutalist component classes
    hooks/
      useAI.ts           # Generic message sender with loading/error state
      usePageData.ts     # Session storage listener for scraped page data
      useStorage.ts      # Chrome storage hooks (local + session)
    components/
      Settings.tsx       # API key, model picker, toggle switches
      ProfileScanner.tsx # Profile analysis UI with section scores
      JobHunter.tsx      # Job list with scoring, sorting, auto-score
      ProposalGenerator.tsx # Proposal generation, editing, copy
      ProfileImprover.tsx   # Job-targeted profile improvement tips
      ChatAssistant.tsx     # Reply suggestions with tone options
      MeetingPrep.tsx       # Meeting preparation checklist
      PortfolioBuilder.tsx  # GitHub/website fetch + AI suggestions + apply
  popup/
    index.html           # Compact popup with status indicator
    popup.ts             # API key status check, side panel opener
  assets/
    icons/               # Extension icons (16, 48, 128px in PNG + SVG)
```

### Data Flow

1. **Content Script** runs on all `upwork.com` pages. It detects the page type (profile, job search, job detail, messages) and scrapes structured data from the DOM.
2. **Page Observer** watches for SPA navigation by intercepting `pushState`/`replaceState` and using `MutationObserver`, triggering re-scrapes on URL changes.
3. **Service Worker** receives scraped data and stores it in `chrome.storage.session`. It also handles all AI requests by building prompts, calling OpenRouter, parsing JSON responses, and caching results.
4. **Side Panel** reads page data from session storage via Zustand, automatically switching tabs based on page type. Components send typed messages to the service worker for AI operations.
5. **Popup** provides a quick status check (API key configured?) and a button to open the side panel.

### Message Protocol

All communication uses Chrome's `runtime.sendMessage` with a typed union:

- **Content -> Service Worker**: `PAGE_DATA`, `PAGE_CHANGED`
- **Panel -> Service Worker**: `AI_SCORE_JOBS`, `AI_GENERATE_PROPOSAL`, `AI_ANALYZE_PROFILE`, `AI_IMPROVE_PROFILE`, `AI_CHAT_REPLIES`, `AI_MEETING_PREP`, `FETCH_PORTFOLIO`, `AI_ANALYZE_PORTFOLIO`, `TEST_API_KEY`, `GET_SETTINGS`, `SAVE_SETTINGS`, `GET_PROFILE`, `SAVE_PROFILE`, etc.
- **Service Worker -> Panel**: `{ success: true, data } | { success: false, error }`

## Getting Started

### Prerequisites

- Node.js 18+
- An [OpenRouter API key](https://openrouter.ai/keys)

### Installation

```bash
# Clone the repository
git clone https://github.com/Mahad-007/FreelanceFlow-Chrome-Extensiom.git
cd FreelanceFlow-Chrome-Extensiom

# Install dependencies
npm install

# Build the extension
npm run build
```

### Load in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select the `dist/` folder
5. Pin the FreelanceFlow extension and click it to open the side panel
6. Enter your OpenRouter API key in Settings

### Development

```bash
# Watch mode -- rebuilds on file changes
npm run dev
```

After rebuilding, go to `chrome://extensions/` and click the refresh icon on the FreelanceFlow card.

## Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| **OpenRouter API Key** | Required. Get one at [openrouter.ai/keys](https://openrouter.ai/keys) | -- |
| **AI Model** | Choose which LLM powers the extension | Claude Opus 4.6 |
| **Auto-Score Jobs** | Automatically score jobs when a search page loads | On |
| **Auto-Switch Tabs** | Switch to the relevant tab based on the current Upwork page | On |

## Rate Limiting

The extension enforces a client-side rate limit of **10 requests per 60 seconds** to avoid hitting OpenRouter's limits. If exceeded, you'll see a "Rate limit exceeded" message -- wait a moment and try again.

## Supported Upwork Pages

| Page | URL Pattern | Features Available |
|------|------------|-------------------|
| Profile | `/freelancers/~...`, `/fl/...` | Profile Scanner, Portfolio Builder |
| Job Search | `/nx/search/jobs`, `/ab/jobs/search` | Job Hunter (scoring + sorting) |
| Job Detail | `/jobs/~...`, `/nx/proposals/job/~...` | Proposal Generator, Profile Improver |
| Messages | `/ab/messages`, `/nx/messages` | Chat Assistant, Meeting Prep |

## License

This project is unlicensed. All rights reserved.
