import React, { useState } from "react";
import { useUIStore } from "../store";
import { useAI } from "../hooks/useAI";
import type { ProfileAnalysis, ProfileData } from "../../shared/types";

export default function ProfileScanner() {
  const pageData = useUIStore((s) => s.pageData);
  const profile = useUIStore((s) => s.profile);
  const loading = useUIStore((s) => s.loading["profile-analysis"]);
  const error = useUIStore((s) => s.errors["profile-analysis"]);
  const { sendMessage } = useAI();
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);

  const profileData = pageData?.type === "profile" ? (pageData.data as ProfileData) : null;

  const handleAnalyze = async () => {
    if (!profileData) return;
    const result = await sendMessage<ProfileAnalysis>(
      {
        type: "AI_ANALYZE_PROFILE",
        profile: profileData,
        userProfile: profile || undefined,
      },
      "profile-analysis"
    );
    if (result) setAnalysis(result);
  };

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">👤</div>
        <h3 className="text-lg font-bold text-gray-300 mb-2">Profile Scanner</h3>
        <p className="text-sm text-gray-500">
          Navigate to an Upwork profile page to scan and analyze it.
        </p>
        <p className="text-xs text-gray-600 mt-2">
          Visit: upwork.com/freelancers/~yourprofile
        </p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "score-high";
    if (score >= 50) return "score-medium";
    return "score-low";
  };

  return (
    <div className="space-y-4">
      {/* Profile Summary */}
      <div className="neo-card">
        <h3 className="font-bold text-brand-400 mb-2">{profileData.name || "Profile"}</h3>
        <p className="text-sm text-gray-400">{profileData.title}</p>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          {profileData.hourlyRate && <span>💰 {profileData.hourlyRate}</span>}
          {profileData.jobSuccessScore && <span>⭐ {profileData.jobSuccessScore}</span>}
          {profileData.totalJobs && <span>💼 {profileData.totalJobs} jobs</span>}
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          {profileData.skills.slice(0, 10).map((skill) => (
            <span key={skill} className="neo-badge bg-gray-800 border-gray-600 text-gray-300">
              {skill}
            </span>
          ))}
        </div>
        <div className="mt-3 bg-gray-800 rounded-lg overflow-hidden h-2">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${profileData.completeness}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Profile completeness: {profileData.completeness}%
        </p>
      </div>

      {/* Analyze Button */}
      {!analysis && (
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="neo-btn-primary w-full"
        >
          {loading ? "Analyzing..." : "🔍 Analyze Profile with AI"}
        </button>
      )}

      {error && (
        <div className="neo-card border-red-600 bg-red-900/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-3">
          <div className="neo-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-200">Overall Score</h3>
              <span className={`neo-badge text-lg ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}/100
              </span>
            </div>
            <p className="text-sm text-gray-400">{analysis.summary}</p>
          </div>

          {analysis.sections.map((section) => (
            <div key={section.name} className="neo-card">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-300">{section.name}</h4>
                <span className={`neo-badge text-xs ${getScoreColor(section.score)}`}>
                  {section.score}
                </span>
              </div>
              <ul className="space-y-1">
                {section.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-xs text-gray-400 flex gap-2">
                    <span className="text-brand-400 mt-0.5">→</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <button
            onClick={handleAnalyze}
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
