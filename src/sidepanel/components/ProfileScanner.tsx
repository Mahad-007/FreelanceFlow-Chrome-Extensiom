import React, { useState } from "react";
import { useUIStore } from "../store";
import { useAI } from "../hooks/useAI";
import type { ProfileAnalysis, ProfileData, UserProfile } from "../../shared/types";

export default function ProfileScanner() {
  const pageData = useUIStore((s) => s.pageData);
  const profile = useUIStore((s) => s.profile);
  const setProfile = useUIStore((s) => s.setProfile);
  const loading = useUIStore((s) => s.loading["profile-analysis"]);
  const error = useUIStore((s) => s.errors["profile-analysis"]);
  const { sendMessage } = useAI();
  const [analysis, setAnalysis] = useState<ProfileAnalysis | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

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

  const handleSaveAsProfile = async () => {
    if (!profileData) return;

    // Parse hourly rate: "$50.00/hr" -> 50
    const rateMatch = profileData.hourlyRate.match(/\$?([\d,.]+)/);
    const parsedRate = rateMatch ? parseFloat(rateMatch[1].replace(",", "")) : 0;

    // Parse job success score: "98%" -> 98
    const jssMatch = profileData.jobSuccessScore?.match(/([\d.]+)/);
    const parsedJSS = jssMatch ? parseFloat(jssMatch[1]) : undefined;

    const userProfile: UserProfile = {
      name: profileData.name || "",
      title: profileData.title || "",
      bio: profileData.bio || "",
      skills: profileData.skills.map((s) => ({ name: s, level: 3 })),
      hourlyRateMin: parsedRate,
      hourlyRateMax: parsedRate,
      experience: "Intermediate",
      categories: [],
      portfolioLinks: [],
      jobSuccessScore: parsedJSS,
      completeness: profileData.completeness,
    };

    await chrome.runtime.sendMessage({ type: "SAVE_PROFILE", profile: userProfile });
    setProfile(userProfile);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">👤</div>
        <h3 className="text-lg font-bold text-skin-secondary mb-2">Profile Scanner</h3>
        <p className="text-sm text-skin-muted">
          Navigate to an Upwork profile page to scan and analyze it.
        </p>
        <p className="text-xs text-skin-faint mt-2">
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
        <h3 className="font-bold text-skin-accent mb-2">{profileData.name || "Profile"}</h3>
        <p className="text-sm text-skin-tertiary">{profileData.title}</p>
        <div className="flex gap-4 mt-3 text-xs text-skin-muted">
          {profileData.hourlyRate && <span>💰 {profileData.hourlyRate}</span>}
          {profileData.jobSuccessScore && <span>⭐ {profileData.jobSuccessScore}</span>}
          {profileData.totalJobs && <span>💼 {profileData.totalJobs} jobs</span>}
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          {profileData.skills.slice(0, 10).map((skill) => (
            <span key={skill} className="neo-badge bg-elevated border-skin-strong text-skin-secondary">
              {skill}
            </span>
          ))}
        </div>
        <div className="mt-3 bg-elevated rounded-lg overflow-hidden h-2">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: `${profileData.completeness}%` }}
          />
        </div>
        <p className="text-xs text-skin-muted mt-1">
          Profile completeness: {profileData.completeness}%
        </p>
        <button
          onClick={handleSaveAsProfile}
          className="neo-btn-secondary w-full text-sm mt-3"
        >
          {profileSaved ? "Saved!" : profile ? "Update My Profile from This" : "Save as My Profile"}
        </button>
        {profileSaved && (
          <p className="text-xs text-skin-success text-center mt-1">
            Profile saved! You can fine-tune it in Settings.
          </p>
        )}
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
        <div className="neo-card border-skin-error bg-status-error">
          <p className="text-sm text-skin-error">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-3">
          <div className="neo-card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-skin-primary">Overall Score</h3>
              <span className={`neo-badge text-lg ${getScoreColor(analysis.overallScore)}`}>
                {analysis.overallScore}/100
              </span>
            </div>
            <p className="text-sm text-skin-tertiary">{analysis.summary}</p>
          </div>

          {analysis.sections.map((section) => (
            <div key={section.name} className="neo-card">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-skin-secondary">{section.name}</h4>
                <span className={`neo-badge text-xs ${getScoreColor(section.score)}`}>
                  {section.score}
                </span>
              </div>
              <ul className="space-y-1">
                {section.suggestions.map((suggestion, i) => (
                  <li key={i} className="text-xs text-skin-tertiary flex gap-2">
                    <span className="text-skin-accent mt-0.5">→</span>
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
