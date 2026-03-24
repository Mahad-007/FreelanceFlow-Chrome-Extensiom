# FreelanceFlow Privacy Policy

**Last updated: March 24, 2026**

## Overview

FreelanceFlow is a Chrome extension that helps freelancers on Upwork with AI-powered tools including job scoring, proposal generation, profile analysis, and chat suggestions. This policy explains what data the extension accesses, how it is used, and how it is stored.

## Data Collection and Usage

### Data Stored Locally

All user data is stored locally in your browser using Chrome's storage APIs (`chrome.storage.local` and `chrome.storage.session`). This includes:

- Your profile information (name, title, bio, skills, hourly rate, experience)
- Your OpenRouter API key
- GitHub and portfolio website URLs you provide
- Cached job scores (auto-expire after 24 hours)
- Generated proposals (up to 50 most recent)
- Extension settings (AI model preference, theme, toggles)

### Data Read from Web Pages

When you visit Upwork (upwork.com), the extension reads page content to provide contextual features:

- Job listings and job details
- Your Upwork profile page content
- Chat and message threads

This data is processed locally and is not transmitted to any server operated by the developer.

### Data Sent to Third-Party Services

- **OpenRouter API** (openrouter.ai): Job data and your profile information are sent to the OpenRouter API for AI processing (scoring jobs, generating proposals, analyzing profiles, providing chat suggestions). This requires your own API key. Data handling by OpenRouter is governed by their own privacy policy.
- **GitHub API** (api.github.com, raw.githubusercontent.com): If you provide a GitHub URL, the extension fetches your public GitHub profile and repository data.
- **Portfolio Websites**: If you provide a portfolio website URL, the extension fetches and parses that page to extract text content for AI analysis.

### Data NOT Collected

- No analytics or telemetry data is collected
- No data is sent to the extension developer's servers
- No personal information is sold, shared, or transferred to third parties
- No tracking cookies or identifiers are used

## Data Security

- Your API key is stored locally in Chrome's storage
- All network requests use HTTPS
- No data persists outside your browser

## Data Deletion

You can delete all extension data at any time by:

1. Removing the FreelanceFlow extension from Chrome
2. Clearing the extension's storage via Chrome's developer tools

## Changes to This Policy

We may update this privacy policy from time to time. Changes will be reflected in the "Last updated" date above.

## Contact

If you have questions about this privacy policy, please open an issue on our GitHub repository.
