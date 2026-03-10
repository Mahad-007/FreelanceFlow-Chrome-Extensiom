import React, { useState } from "react";
import { useUIStore } from "../store";
import { useAI } from "../hooks/useAI";
import type { JobDetailData, ScrapedJob, JobSearchData } from "../../shared/types";

interface Improvements {
  titleSuggestion: string | null;
  keywordsToAdd: string[];
  skillsToAdd: string[];
  bioEdits: string;
  portfolioTips: string[];
  overallTip: string;
}

export default function ProfileImprover() {
  const pageData = useUIStore((s) => s.pageData);
  const profile = useUIStore((s) => s.profile);
  const loading = useUIStore((s) => s.loading["improve-profile"]);
  const error = useUIStore((s) => s.errors["improve-profile"]);
  const { sendMessage } = useAI();
  const [improvements, setImprovements] = useState<Improvements | null>(null);

  let job: JobDetailData | ScrapedJob | null = null;
  if (pageData?.type === "job-detail") {
    job = pageData.data as JobDetailData;
  } else if (pageData?.type === "job-search") {
    const searchData = pageData.data as JobSearchData;
    if (searchData.jobs.length > 0) job = searchData.jobs[0];
  }

  const handleImprove = async () => {
    if (!job || !profile) return;
    const result = await sendMessage<Improvements>(
      { type: "AI_IMPROVE_PROFILE", job, profile },
      "improve-profile"
    );
    if (result) setImprovements(result);
  };

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">Set up your profile in Settings first.</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">✨</div>
        <h3 className="text-lg font-bold text-gray-300 mb-2">Profile Improver</h3>
        <p className="text-sm text-gray-500">
          Navigate to a job posting to get profile improvement suggestions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="neo-card">
        <h3 className="font-bold text-sm text-brand-400">Improve Profile for:</h3>
        <p className="text-sm text-gray-400 mt-1 line-clamp-2">{job.title}</p>
      </div>

      {!improvements && (
        <button
          onClick={handleImprove}
          disabled={loading}
          className="neo-btn-primary w-full"
        >
          {loading ? "Analyzing..." : "✨ Get Improvement Tips"}
        </button>
      )}

      {error && (
        <div className="neo-card border-red-600 bg-red-900/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {improvements && (
        <div className="space-y-3">
          {/* Overall Tip */}
          <div className="neo-card border-brand-600 bg-brand-900/20">
            <p className="text-sm text-brand-300">💡 {improvements.overallTip}</p>
          </div>

          {/* Title Suggestion */}
          {improvements.titleSuggestion && (
            <div className="neo-card">
              <h4 className="font-medium text-gray-300 text-sm mb-1">📝 Title Suggestion</h4>
              <p className="text-sm text-gray-400">{improvements.titleSuggestion}</p>
            </div>
          )}

          {/* Keywords to Add */}
          {improvements.keywordsToAdd.length > 0 && (
            <div className="neo-card">
              <h4 className="font-medium text-gray-300 text-sm mb-2">🔑 Keywords to Add</h4>
              <div className="flex flex-wrap gap-1">
                {improvements.keywordsToAdd.map((kw) => (
                  <span key={kw} className="neo-badge bg-brand-900/30 border-brand-600 text-brand-300">
                    + {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills to Add */}
          {improvements.skillsToAdd.length > 0 && (
            <div className="neo-card">
              <h4 className="font-medium text-gray-300 text-sm mb-2">🔧 Skills to Add</h4>
              <div className="flex flex-wrap gap-1">
                {improvements.skillsToAdd.map((skill) => (
                  <span key={skill} className="neo-badge bg-green-900/30 border-green-600 text-green-300">
                    + {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio Edits */}
          {improvements.bioEdits && (
            <div className="neo-card">
              <h4 className="font-medium text-gray-300 text-sm mb-1">📄 Bio Improvements</h4>
              <p className="text-xs text-gray-400 whitespace-pre-wrap">{improvements.bioEdits}</p>
            </div>
          )}

          {/* Portfolio Tips */}
          {improvements.portfolioTips.length > 0 && (
            <div className="neo-card">
              <h4 className="font-medium text-gray-300 text-sm mb-2">🖼 Portfolio Tips</h4>
              <ul className="space-y-1">
                {improvements.portfolioTips.map((tip, i) => (
                  <li key={i} className="text-xs text-gray-400 flex gap-2">
                    <span className="text-brand-400">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={handleImprove}
            disabled={loading}
            className="neo-btn-secondary w-full text-sm"
          >
            {loading ? "Re-analyzing..." : "🔄 Re-analyze"}
          </button>
        </div>
      )}
    </div>
  );
}
