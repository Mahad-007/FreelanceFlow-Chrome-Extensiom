import React, { useState, useEffect } from "react";
import { useUIStore } from "../store";
import { useAI } from "../hooks/useAI";
import { STORAGE_KEYS, SCORE_CACHE_TTL } from "../../shared/constants";
import { getScoreClass } from "../utils/score";
import type { JobScore, JobSearchData, ScrapedJob, SearchRecommendations } from "../../shared/types";
import EmptyState from "./EmptyState";
import Icon from "./Icon";

export default function JobHunter() {
  const pageData = useUIStore((s) => s.pageData);
  const profile = useUIStore((s) => s.profile);
  const loading = useUIStore((s) => s.loading["score-jobs"]);
  const error = useUIStore((s) => s.errors["score-jobs"]);
  const settings = useUIStore((s) => s.settings);
  const portfolioData = useUIStore((s) => s.portfolioData);
  const { sendMessage } = useAI();
  const [scores, setScores] = useState<Record<string, JobScore>>({});
  const [sortByScore, setSortByScore] = useState(true);
  const [recommendations, setRecommendations] = useState<SearchRecommendations | null>(null);
  const loadingRecs = useUIStore((s) => s.loading["search-recommendations"]);
  const errorRecs = useUIStore((s) => s.errors["search-recommendations"]);

  const jobData = pageData?.type === "job-search" ? (pageData.data as JobSearchData) : null;
  const jobs = jobData?.jobs || [];

  // Load cached scores then auto-score if needed
  useEffect(() => {
    if (jobs.length === 0) return;

    let cancelled = false;
    chrome.storage.local.get(STORAGE_KEYS.CACHED_SCORES).then((result) => {
      if (cancelled) return;
      const cache = result[STORAGE_KEYS.CACHED_SCORES] || {};
      const now = Date.now();
      const validScores: Record<string, JobScore> = {};
      for (const j of jobs) {
        const cached = cache[j.id];
        if (cached && now - cached.timestamp < SCORE_CACHE_TTL) {
          validScores[j.id] = { id: j.id, score: cached.score, reason: cached.reason };
        }
      }
      if (Object.keys(validScores).length > 0) {
        setScores(validScores);
      }
      // Auto-score if enabled and not all jobs have cached scores
      if (profile && settings.autoScore && !jobs.every((j) => validScores[j.id])) {
        handleScore();
      }
    });

    return () => { cancelled = true; };
  }, [jobs.length, profile?.name]);

  const handleScore = async () => {
    if (!profile || jobs.length === 0) return;
    const result = await sendMessage<JobScore[]>(
      { type: "AI_SCORE_JOBS", jobs, profile, portfolioData: portfolioData || undefined },
      "score-jobs"
    );
    if (result) {
      const scoreMap: Record<string, JobScore> = {};
      result.forEach((s) => { scoreMap[s.id] = s; });
      setScores(scoreMap);
    }
  };

  const handleGetRecommendations = async () => {
    if (!profile) return;
    const result = await sendMessage<SearchRecommendations>(
      { type: "AI_SEARCH_RECOMMENDATIONS", profile, portfolioData: portfolioData || undefined },
      "search-recommendations"
    );
    if (result) setRecommendations(result);
  };

  const getCompetitionColor = (level: string) => {
    if (level === "low") return "text-skin-success";
    if (level === "medium") return "text-skin-warning";
    return "text-skin-error";
  };

  const sortedJobs = sortByScore
    ? [...jobs].sort((a, b) => (scores[b.id]?.score || 0) - (scores[a.id]?.score || 0))
    : jobs;

  if (!profile) {
    return (
      <EmptyState
        title="Job Hunter"
        description="Set up your profile in Settings first to enable job scoring."
      />
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="Job Hunter"
          description="Navigate to Upwork job search to see and score jobs."
          hint="upwork.com/nx/search/jobs"
        />

        {/* Search Recommendations */}
        <button
          onClick={handleGetRecommendations}
          disabled={loadingRecs}
          className="neo-btn-secondary w-full text-sm"
        >
          {loadingRecs ? "Generating..." : "Get Recommendations"}
        </button>

        {errorRecs && (
          <div className="neo-alert-error">
            <p className="text-sm text-skin-error">{errorRecs}</p>
          </div>
        )}

        {recommendations && (
          <div className="space-y-3">
            <h4 className="font-bold text-skin-primary text-sm">Recommended Searches</h4>
            {recommendations.searchQueries.map((sq, i) => (
              <div key={i} className="neo-card">
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={`https://www.upwork.com/nx/search/jobs/?q=${encodeURIComponent(sq.query)}`}
                    target="_blank"
                    rel="noopener"
                    className="text-sm font-medium text-skin-soft hover:text-skin-accent"
                  >
                    {sq.query}
                  </a>
                  <span className={`text-[10px] font-bold whitespace-nowrap ${getCompetitionColor(sq.estimatedCompetition)}`}>
                    {sq.estimatedCompetition}
                  </span>
                </div>
                <p className="text-[10px] text-skin-faint mt-0.5">{sq.category}</p>
                <p className="text-xs text-skin-muted mt-1">{sq.reasoning}</p>
              </div>
            ))}
            {recommendations.nicheKeywords.length > 0 && (
              <div className="neo-card">
                <h4 className="font-medium text-skin-secondary text-xs mb-1">Niche Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {recommendations.nicheKeywords.map((kw) => (
                    <span key={kw} className="text-[10px] px-1.5 py-0.5 bg-brand-subtle rounded text-skin-soft">{kw}</span>
                  ))}
                </div>
              </div>
            )}
            {recommendations.searchTips.length > 0 && (
              <div className="neo-card">
                <h4 className="font-medium text-skin-secondary text-xs mb-1">Search Tips</h4>
                <ul className="space-y-0.5">
                  {recommendations.searchTips.map((tip, i) => (
                    <li key={i} className="text-xs text-skin-tertiary flex gap-1.5">
                      <span className="text-skin-accent">-&gt;</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-skin-tertiary">{jobs.length} jobs found</span>
        <div className="flex gap-2">
          <button
            onClick={() => setSortByScore(!sortByScore)}
            className="neo-btn-secondary text-xs"
          >
            {sortByScore ? "By Score" : "By Order"}
          </button>
          <button
            onClick={handleScore}
            disabled={loading}
            className="neo-btn-primary text-xs"
          >
            {loading ? "Scoring..." : "Score All"}
          </button>
        </div>
      </div>

      {/* Search Recommendations Button */}
      <button
        onClick={handleGetRecommendations}
        disabled={loadingRecs}
        className="neo-btn-secondary w-full text-xs"
      >
        {loadingRecs ? "Generating..." : "Get Recommendations"}
      </button>

      {error && (
        <div className="neo-alert-error">
          <p className="text-sm text-skin-error">{error}</p>
        </div>
      )}

      {/* Job List */}
      <div className="space-y-3">
        {sortedJobs.map((job) => {
          const score = scores[job.id];
          return (
            <div key={job.id} className="neo-card-compact">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener"
                    className="font-medium text-sm text-skin-soft hover:text-skin-accent line-clamp-2"
                  >
                    {job.title}
                  </a>
                  <div className="meta-row mt-1 text-xs text-skin-muted">
                    {job.budget && <span>{job.budget}</span>}
                    {job.jobType && <span>{job.jobType}</span>}
                    {job.experienceLevel && <span>{job.experienceLevel}</span>}
                    {job.postedTime && <span>{job.postedTime}</span>}
                  </div>
                </div>
                {score && (
                  <span className={`neo-badge text-sm flex-shrink-0 ${getScoreClass(score.score)}`}>
                    {score.score}
                  </span>
                )}
              </div>

              <p className="text-xs text-skin-muted mt-2 line-clamp-2">{job.description}</p>

              {job.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {job.skills.slice(0, 6).map((skill) => (
                    <span key={skill} className="text-[10px] px-1.5 py-0.5 bg-elevated rounded text-skin-tertiary">
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              {score?.reason && (
                <p className="text-xs text-skin-accent mt-2 italic">
                  {score.reason}
                </p>
              )}

              <div className="meta-row mt-2 text-xs text-skin-muted">
                {job.clientCountry && <span>{job.clientCountry}</span>}
                {job.clientRating && <span>{job.clientRating}</span>}
                {job.proposals && <span>{job.proposals}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
