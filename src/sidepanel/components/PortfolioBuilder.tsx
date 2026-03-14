import React, { useState, useEffect } from "react";
import { useUIStore } from "../store";
import { useAI } from "../hooks/useAI";
import type { FetchedPortfolioData, PortfolioSuggestions } from "../../shared/types";

export default function PortfolioBuilder() {
  const profile = useUIStore((s) => s.profile);
  const portfolioSources = useUIStore((s) => s.portfolioSources);
  const portfolioData = useUIStore((s) => s.portfolioData);
  const portfolioSuggestions = useUIStore((s) => s.portfolioSuggestions);
  const setPortfolioSources = useUIStore((s) => s.setPortfolioSources);
  const setPortfolioData = useUIStore((s) => s.setPortfolioData);
  const setPortfolioSuggestions = useUIStore((s) => s.setPortfolioSuggestions);

  const loadingFetch = useUIStore((s) => s.loading["fetch-portfolio"]);
  const loadingAnalyze = useUIStore((s) => s.loading["analyze-portfolio"]);
  const errorFetch = useUIStore((s) => s.errors["fetch-portfolio"]);
  const errorAnalyze = useUIStore((s) => s.errors["analyze-portfolio"]);
  const { sendMessage } = useAI();

  const [githubUrl, setGithubUrl] = useState(portfolioSources?.githubUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(portfolioSources?.portfolioUrl || "");
  const [showData, setShowData] = useState(false);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  // Sync inputs from stored sources on mount
  useEffect(() => {
    if (portfolioSources) {
      setGithubUrl(portfolioSources.githubUrl || "");
      setPortfolioUrl(portfolioSources.portfolioUrl || "");
    }
  }, [portfolioSources]);

  const isValid = () => {
    const hasGithub = githubUrl.trim().length > 0;
    const hasPortfolio = portfolioUrl.trim().length > 0;
    if (!hasGithub && !hasPortfolio) return false;
    if (hasGithub && !githubUrl.match(/github\.com\/[^/?\s#]+/i)) return false;
    return true;
  };

  const handleFetchAndAnalyze = async () => {
    if (!isValid()) return;

    const sources = { githubUrl: githubUrl.trim(), portfolioUrl: portfolioUrl.trim() };

    // Step 1: Fetch
    const fetchedData = await sendMessage<FetchedPortfolioData>(
      { type: "FETCH_PORTFOLIO", sources },
      "fetch-portfolio"
    );
    if (!fetchedData) return;

    setPortfolioSources(sources);
    setPortfolioData(fetchedData);

    // Step 2: AI analysis
    const suggestions = await sendMessage<PortfolioSuggestions>(
      { type: "AI_ANALYZE_PORTFOLIO", data: fetchedData, currentProfile: profile || undefined },
      "analyze-portfolio"
    );
    if (suggestions) {
      setPortfolioSuggestions(suggestions);
    }
  };

  const handleCopy = async (field: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [field]: false })), 2000);
  };

  const loading = loadingFetch || loadingAnalyze;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "score-high";
    if (score >= 50) return "score-medium";
    return "score-low";
  };

  const getLevelLabel = (level: number) => {
    const labels = ["", "Beginner", "Familiar", "Proficient", "Advanced", "Expert"];
    return labels[level] || "";
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-skin-accent text-sm">Portfolio Builder</h3>
      <p className="text-xs text-skin-muted">
        Enter your GitHub and/or portfolio website to generate AI-powered profile suggestions.
      </p>

      {/* URL Inputs */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-skin-tertiary mb-1">GitHub Profile URL</label>
          <input
            type="url"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/username"
            className="neo-input text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-skin-tertiary mb-1">Portfolio Website URL</label>
          <input
            type="url"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            placeholder="https://yoursite.com"
            className="neo-input text-sm"
          />
        </div>
        <p className="text-[10px] text-skin-faint">At least one URL is required.</p>

        <button
          onClick={handleFetchAndAnalyze}
          disabled={loading || !isValid()}
          className="neo-btn-primary w-full text-sm"
        >
          {loadingFetch
            ? "Fetching data..."
            : loadingAnalyze
            ? "Analyzing with AI..."
            : portfolioData
            ? "Re-fetch & Analyze"
            : "Fetch & Analyze"}
        </button>

        {portfolioData && (
          <p className="text-[10px] text-skin-faint text-center">
            Last fetched: {new Date(portfolioData.fetchedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Errors */}
      {errorFetch && (
        <div className="neo-card border-skin-error bg-status-error">
          <p className="text-sm text-skin-error">{errorFetch}</p>
        </div>
      )}
      {errorAnalyze && (
        <div className="neo-card border-skin-error bg-status-error">
          <p className="text-sm text-skin-error">{errorAnalyze}</p>
        </div>
      )}

      {/* Fetched Data Summary */}
      {portfolioData && (
        <div className="neo-card">
          <button
            onClick={() => setShowData(!showData)}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-skin-secondary text-sm">Fetched Data</h4>
            <span className="text-skin-muted text-xs">{showData ? "Hide" : "Show"}</span>
          </button>
          {showData && (
            <div className="mt-3 space-y-2 text-xs text-skin-tertiary">
              {portfolioData.github && (
                <div>
                  <p className="text-skin-secondary font-medium">
                    GitHub: {portfolioData.github.name || portfolioData.github.username}
                  </p>
                  {portfolioData.github.bio && <p className="italic">{portfolioData.github.bio}</p>}
                  <p>
                    {portfolioData.github.publicRepos} repos &middot; {portfolioData.github.followers} followers
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[...new Set(portfolioData.github.repos.map((r) => r.language).filter(Boolean))]
                      .slice(0, 8)
                      .map((lang) => (
                        <span key={lang} className="px-1.5 py-0.5 bg-elevated rounded text-[10px]">
                          {lang}
                        </span>
                      ))}
                  </div>
                </div>
              )}
              {portfolioData.website && (
                <div>
                  <p className="text-skin-secondary font-medium">Website: {portfolioData.website.title || portfolioData.website.url}</p>
                  <p className="line-clamp-3">{portfolioData.website.extractedText.slice(0, 200)}...</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AI Suggestions */}
      {portfolioSuggestions && (
        <div className="space-y-3">
          <h4 className="font-bold text-skin-primary text-sm">AI Suggestions</h4>

          {/* Suggested Titles */}
          <div className="neo-card">
            <h4 className="font-medium text-skin-secondary text-sm mb-2">Suggested Titles</h4>
            <div className="space-y-2">
              {portfolioSuggestions.suggestedTitles.map((title, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <p className="text-sm text-skin-tertiary flex-1">{title}</p>
                  <button
                    onClick={() => handleCopy(`title-${i}`, title)}
                    className="text-xs text-skin-accent hover:text-skin-soft whitespace-nowrap"
                  >
                    {copied[`title-${i}`] ? "Copied!" : "Copy"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Bio */}
          <div className="neo-card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-skin-secondary text-sm">Suggested Bio</h4>
              <button
                onClick={() => handleCopy("bio", portfolioSuggestions.suggestedBio)}
                className="text-xs text-skin-accent hover:text-skin-soft"
              >
                {copied.bio ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-skin-tertiary whitespace-pre-wrap leading-relaxed">
              {portfolioSuggestions.suggestedBio}
            </p>
          </div>

          {/* Suggested Skills */}
          <div className="neo-card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-skin-secondary text-sm">Suggested Skills</h4>
              <button
                onClick={() =>
                  handleCopy(
                    "skills",
                    portfolioSuggestions.suggestedSkills.map((s) => s.name).join(", ")
                  )
                }
                className="text-xs text-skin-accent hover:text-skin-soft"
              >
                {copied.skills ? "Copied!" : "Copy All"}
              </button>
            </div>
            <div className="space-y-1.5">
              {portfolioSuggestions.suggestedSkills.map((skill, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-skin-secondary">{skill.name}</span>
                    <span className="text-[10px] text-skin-faint">{getLevelLabel(skill.level)}</span>
                  </div>
                  <span className="text-[10px] text-skin-faint italic">{skill.source}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rate Recommendation */}
          <div className="neo-card">
            <h4 className="font-medium text-skin-secondary text-sm mb-2">Rate Recommendation</h4>
            <div className="flex items-center justify-between mb-1">
              <span className="text-skin-accent font-bold">
                ${portfolioSuggestions.rateRecommendation.min} - ${portfolioSuggestions.rateRecommendation.max}/hr
              </span>
              <button
                onClick={() =>
                  handleCopy(
                    "rate",
                    `$${portfolioSuggestions.rateRecommendation.min} - $${portfolioSuggestions.rateRecommendation.max}/hr`
                  )
                }
                className="text-xs text-skin-accent hover:text-skin-soft"
              >
                {copied.rate ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-skin-muted">{portfolioSuggestions.rateRecommendation.reasoning}</p>
          </div>

          {/* Portfolio Highlights */}
          {portfolioSuggestions.portfolioHighlights.length > 0 && (
            <div className="neo-card">
              <h4 className="font-medium text-skin-secondary text-sm mb-2">Portfolio Highlights</h4>
              <div className="space-y-3">
                {portfolioSuggestions.portfolioHighlights.map((project, i) => (
                  <div key={i} className="border-l-2 border-skin pl-3">
                    <p className="text-sm text-skin-secondary font-medium">{project.projectName}</p>
                    <p className="text-xs text-skin-tertiary mt-1">{project.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {project.relevantSkills.map((skill) => (
                        <span key={skill} className="text-[10px] px-1.5 py-0.5 bg-elevated rounded text-skin-tertiary">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completeness Assessment */}
          <div className="neo-card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-skin-secondary text-sm">Completeness Assessment</h4>
              <span className={`neo-badge text-xs ${getScoreColor(portfolioSuggestions.completenessAssessment.score)}`}>
                {portfolioSuggestions.completenessAssessment.score}/100
              </span>
            </div>

            {portfolioSuggestions.completenessAssessment.strengths.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-medium text-skin-success mb-1">Strengths</p>
                <ul className="space-y-0.5">
                  {portfolioSuggestions.completenessAssessment.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-skin-tertiary flex gap-1.5">
                      <span className="text-skin-success">+</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {portfolioSuggestions.completenessAssessment.gaps.length > 0 && (
              <div className="mb-2">
                <p className="text-[10px] font-medium text-skin-warning mb-1">Gaps</p>
                <ul className="space-y-0.5">
                  {portfolioSuggestions.completenessAssessment.gaps.map((g, i) => (
                    <li key={i} className="text-xs text-skin-tertiary flex gap-1.5">
                      <span className="text-skin-warning">-</span> {g}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {portfolioSuggestions.completenessAssessment.recommendations.length > 0 && (
              <div>
                <p className="text-[10px] font-medium text-skin-accent mb-1">Recommendations</p>
                <ul className="space-y-0.5">
                  {portfolioSuggestions.completenessAssessment.recommendations.map((r, i) => (
                    <li key={i} className="text-xs text-skin-tertiary flex gap-1.5">
                      <span className="text-skin-accent">-&gt;</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <p className="text-[10px] text-skin-faint text-center">
            Generated: {new Date(portfolioSuggestions.generatedAt).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
