import React, { useState, useEffect } from "react";
import { useUIStore } from "../store";
import { useAI } from "../hooks/useAI";
import { STORAGE_KEYS, SCORE_CACHE_TTL } from "../../shared/constants";
import type { JobScore, JobSearchData, ScrapedJob } from "../../shared/types";

export default function JobHunter() {
  const pageData = useUIStore((s) => s.pageData);
  const profile = useUIStore((s) => s.profile);
  const loading = useUIStore((s) => s.loading["score-jobs"]);
  const error = useUIStore((s) => s.errors["score-jobs"]);
  const settings = useUIStore((s) => s.settings);
  const { sendMessage } = useAI();
  const [scores, setScores] = useState<Record<string, JobScore>>({});
  const [sortByScore, setSortByScore] = useState(true);

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
      { type: "AI_SCORE_JOBS", jobs, profile },
      "score-jobs"
    );
    if (result) {
      const scoreMap: Record<string, JobScore> = {};
      result.forEach((s) => { scoreMap[s.id] = s; });
      setScores(scoreMap);
    }
  };

  const sortedJobs = sortByScore
    ? [...jobs].sort((a, b) => (scores[b.id]?.score || 0) - (scores[a.id]?.score || 0))
    : jobs;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "score-high";
    if (score >= 50) return "score-medium";
    return "score-low";
  };

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-lg font-bold text-skin-secondary mb-2">Job Hunter</h3>
        <p className="text-sm text-skin-muted">
          Set up your profile in Settings first to enable job scoring.
        </p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🎯</div>
        <h3 className="text-lg font-bold text-skin-secondary mb-2">Job Hunter</h3>
        <p className="text-sm text-skin-muted">
          Navigate to Upwork job search to see and score jobs.
        </p>
        <p className="text-xs text-skin-faint mt-2">
          Visit: upwork.com/nx/search/jobs
        </p>
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
            {sortByScore ? "📊 By Score" : "📅 By Order"}
          </button>
          <button
            onClick={handleScore}
            disabled={loading}
            className="neo-btn-primary text-xs"
          >
            {loading ? "Scoring..." : "🎯 Score All"}
          </button>
        </div>
      </div>

      {error && (
        <div className="neo-card border-skin-error bg-status-error">
          <p className="text-sm text-skin-error">{error}</p>
        </div>
      )}

      {/* Job List */}
      <div className="space-y-3">
        {sortedJobs.map((job) => {
          const score = scores[job.id];
          return (
            <div key={job.id} className="neo-card">
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
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-skin-muted">
                    {job.budget && <span>💰 {job.budget}</span>}
                    {job.jobType && <span>📋 {job.jobType}</span>}
                    {job.experienceLevel && <span>📈 {job.experienceLevel}</span>}
                    {job.postedTime && <span>🕐 {job.postedTime}</span>}
                  </div>
                </div>
                {score && (
                  <span className={`neo-badge text-sm flex-shrink-0 ${getScoreColor(score.score)}`}>
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
                <p className="text-xs text-skin-muted mt-2 italic">
                  💡 {score.reason}
                </p>
              )}

              <div className="flex gap-2 mt-2 text-xs text-skin-muted">
                {job.clientCountry && <span>🌍 {job.clientCountry}</span>}
                {job.clientRating && <span>⭐ {job.clientRating}</span>}
                {job.proposals && <span>📨 {job.proposals}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
