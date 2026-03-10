import React, { useState } from "react";
import { useUIStore } from "../store";
import { useAI } from "../hooks/useAI";
import type { JobDetailData, ScrapedJob, JobSearchData, FetchedPortfolioData, PortfolioSuggestions } from "../../shared/types";

export default function ProposalGenerator() {
  const pageData = useUIStore((s) => s.pageData);
  const profile = useUIStore((s) => s.profile);
  const loading = useUIStore((s) => s.loading["generate-proposal"]);
  const error = useUIStore((s) => s.errors["generate-proposal"]);
  const portfolioData = useUIStore((s) => s.portfolioData);
  const portfolioSuggestions = useUIStore((s) => s.portfolioSuggestions);
  const { sendMessage } = useAI();
  const [proposal, setProposal] = useState("");
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);

  // Get job data from either detail or search page
  let job: JobDetailData | ScrapedJob | null = null;
  if (pageData?.type === "job-detail") {
    job = pageData.data as JobDetailData;
  } else if (pageData?.type === "job-search") {
    const searchData = pageData.data as JobSearchData;
    if (searchData.jobs.length > 0) job = searchData.jobs[0];
  }

  const handleGenerate = async () => {
    if (!job || !profile) return;

    // Build portfolio context from fetched data
    let portfolioContext: string | undefined;
    if (portfolioSuggestions?.portfolioHighlights?.length) {
      portfolioContext = portfolioSuggestions.portfolioHighlights
        .map((p) => `Project: ${p.projectName}\nDescription: ${p.description}\nSkills: ${p.relevantSkills.join(", ")}`)
        .join("\n\n");
    } else if (portfolioData?.github?.repos?.length) {
      portfolioContext = portfolioData.github.repos
        .slice(0, 5)
        .map((r) => `Project: ${r.name}\nDescription: ${r.description || "N/A"}\nLanguage: ${r.language || "N/A"}`)
        .join("\n\n");
    }

    const result = await sendMessage<string>(
      { type: "AI_GENERATE_PROPOSAL", job, profile, portfolioContext },
      "generate-proposal"
    );
    if (result) {
      setProposal(result);
      setEditing(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(proposal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-bold text-gray-300 mb-2">Proposal Generator</h3>
        <p className="text-sm text-gray-500">
          Set up your profile in Settings first to generate proposals.
        </p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-bold text-gray-300 mb-2">Proposal Generator</h3>
        <p className="text-sm text-gray-500">
          Navigate to an Upwork job posting to generate a proposal.
        </p>
        <p className="text-xs text-gray-600 mt-2">Visit: upwork.com/jobs/~jobid</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Job Summary */}
      <div className="neo-card">
        <h3 className="font-bold text-sm text-brand-400 line-clamp-2">{job.title}</h3>
        <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
          {job.budget && <span>💰 {job.budget}</span>}
          {job.experienceLevel && <span>📈 {job.experienceLevel}</span>}
          {job.skills.length > 0 && <span>🔧 {job.skills.slice(0, 3).join(", ")}</span>}
        </div>
      </div>

      {/* Generate Button */}
      {!proposal && (
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="neo-btn-primary w-full"
        >
          {loading ? "Generating..." : "📝 Generate Proposal"}
        </button>
      )}

      {error && (
        <div className="neo-card border-red-600 bg-red-900/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Proposal */}
      {proposal && (
        <div className="space-y-3">
          <div className="neo-card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-300 text-sm">Generated Proposal</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-xs text-gray-400 hover:text-gray-200"
                >
                  {editing ? "Preview" : "✏️ Edit"}
                </button>
                <button
                  onClick={handleCopy}
                  className="text-xs text-brand-400 hover:text-brand-300"
                >
                  {copied ? "✓ Copied!" : "📋 Copy"}
                </button>
              </div>
            </div>
            {editing ? (
              <textarea
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                className="neo-input min-h-[300px] text-sm font-mono"
                rows={15}
              />
            ) : (
              <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {proposal}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="neo-btn-secondary flex-1 text-sm"
            >
              {loading ? "Regenerating..." : "🔄 Regenerate"}
            </button>
            <button onClick={handleCopy} className="neo-btn-primary flex-1 text-sm">
              {copied ? "✓ Copied!" : "📋 Copy to Clipboard"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
