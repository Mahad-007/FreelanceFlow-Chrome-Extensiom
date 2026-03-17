import React, { useState, useEffect } from "react";
import { useUIStore } from "../store";
import { useAI } from "../hooks/useAI";
import { STORAGE_KEYS } from "../../shared/constants";
import type { JobDetailData, ScrapedJob, JobSearchData, GeneratedProposal, SavedProposal } from "../../shared/types";

export default function ProposalGenerator() {
  const pageData = useUIStore((s) => s.pageData);
  const profile = useUIStore((s) => s.profile);
  const loading = useUIStore((s) => s.loading["generate-proposal"]);
  const error = useUIStore((s) => s.errors["generate-proposal"]);
  const portfolioData = useUIStore((s) => s.portfolioData);
  const portfolioSuggestions = useUIStore((s) => s.portfolioSuggestions);
  const { sendMessage } = useAI();
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null);
  const [editingCoverLetter, setEditingCoverLetter] = useState("");
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<SavedProposal[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [historyCopied, setHistoryCopied] = useState<string | null>(null);

  // Load proposal history
  useEffect(() => {
    chrome.storage.local.get(STORAGE_KEYS.PROPOSALS).then((result) => {
      setHistory(result[STORAGE_KEYS.PROPOSALS] || []);
    });
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      if (area === "local" && changes[STORAGE_KEYS.PROPOSALS]) {
        setHistory(changes[STORAGE_KEYS.PROPOSALS].newValue || []);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const handleCopy = async (field: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [field]: true }));
    setTimeout(() => setCopied((prev) => ({ ...prev, [field]: false })), 2000);
  };

  const handleHistoryCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setHistoryCopied(id);
    setTimeout(() => setHistoryCopied(null), 2000);
  };

  const handleLoadProposal = (item: SavedProposal) => {
    if (item.structured) {
      setProposal(item.structured);
      setEditingCoverLetter(item.structured.coverLetter);
    } else {
      // Backward compat: old proposals only have text
      setProposal({
        coverLetter: item.text,
        screeningAnswers: [],
        bidSuggestion: { amount: 0, type: "hourly", reasoning: "" },
        paymentTerms: "",
        attachmentRecommendations: [],
      });
      setEditingCoverLetter(item.text);
    }
    setEditing(false);
    setShowHistory(false);
  };

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

    const result = await sendMessage<GeneratedProposal>(
      { type: "AI_GENERATE_PROPOSAL", job, profile, portfolioContext },
      "generate-proposal"
    );
    if (result) {
      setProposal(result);
      setEditingCoverLetter(result.coverLetter);
      setEditing(false);
    }
  };

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-bold text-skin-secondary mb-2">Proposal Generator</h3>
        <p className="text-sm text-skin-muted">
          Set up your profile in Settings first to generate proposals.
        </p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📝</div>
        <h3 className="text-lg font-bold text-skin-secondary mb-2">Proposal Generator</h3>
        <p className="text-sm text-skin-muted">
          Navigate to an Upwork job posting to generate a proposal.
        </p>
        <p className="text-xs text-skin-faint mt-2">Visit: upwork.com/jobs/~jobid</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Job Summary */}
      <div className="neo-card">
        <h3 className="font-bold text-sm text-skin-accent line-clamp-2">{job.title}</h3>
        <div className="flex flex-wrap gap-2 mt-1 text-xs text-skin-muted">
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
        <div className="neo-card border-skin-error bg-status-error">
          <p className="text-sm text-skin-error">{error}</p>
        </div>
      )}

      {/* Structured Proposal */}
      {proposal && (
        <div className="space-y-3">
          {/* Cover Letter */}
          <div className="neo-card">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-skin-secondary text-sm">Cover Letter</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(!editing)}
                  className="text-xs text-skin-tertiary hover:text-skin-primary"
                >
                  {editing ? "Preview" : "Edit"}
                </button>
                <button
                  onClick={() => handleCopy("coverLetter", editing ? editingCoverLetter : proposal.coverLetter)}
                  className="text-xs text-skin-accent hover:text-skin-soft"
                >
                  {copied.coverLetter ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            {editing ? (
              <textarea
                value={editingCoverLetter}
                onChange={(e) => setEditingCoverLetter(e.target.value)}
                className="neo-input min-h-[250px] text-sm font-mono"
                rows={12}
              />
            ) : (
              <div className="text-sm text-skin-secondary whitespace-pre-wrap leading-relaxed">
                {proposal.coverLetter}
              </div>
            )}
          </div>

          {/* Screening Answers */}
          {proposal.screeningAnswers.length > 0 && (
            <div className="neo-card">
              <h4 className="font-medium text-skin-secondary text-sm mb-2">Screening Answers</h4>
              <div className="space-y-3">
                {proposal.screeningAnswers.map((qa, i) => (
                  <div key={i} className="border-l-2 border-skin pl-3">
                    <p className="text-xs text-skin-muted font-medium">{qa.question}</p>
                    <p className="text-sm text-skin-tertiary mt-1">{qa.answer}</p>
                    <button
                      onClick={() => handleCopy(`answer-${i}`, qa.answer)}
                      className="text-[10px] text-skin-accent hover:text-skin-soft mt-1"
                    >
                      {copied[`answer-${i}`] ? "Copied!" : "Copy answer"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bid Suggestion */}
          {proposal.bidSuggestion.amount > 0 && (
            <div className="neo-card">
              <h4 className="font-medium text-skin-secondary text-sm mb-2">Bid Suggestion</h4>
              <div className="flex items-center justify-between mb-1">
                <span className="text-skin-accent font-bold">
                  ${proposal.bidSuggestion.amount}{proposal.bidSuggestion.type === "hourly" ? "/hr" : " (fixed)"}
                </span>
                <button
                  onClick={() => handleCopy("bid", `$${proposal.bidSuggestion.amount}`)}
                  className="text-xs text-skin-accent hover:text-skin-soft"
                >
                  {copied.bid ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-skin-muted">{proposal.bidSuggestion.reasoning}</p>
            </div>
          )}

          {/* Payment Terms */}
          {proposal.paymentTerms && (
            <div className="neo-card">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-skin-secondary text-sm">Payment Terms</h4>
                <button
                  onClick={() => handleCopy("terms", proposal.paymentTerms)}
                  className="text-xs text-skin-accent hover:text-skin-soft"
                >
                  {copied.terms ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-skin-tertiary">{proposal.paymentTerms}</p>
            </div>
          )}

          {/* Attachment Recommendations */}
          {proposal.attachmentRecommendations.length > 0 && (
            <div className="neo-card">
              <h4 className="font-medium text-skin-secondary text-sm mb-2">Attachment Recommendations</h4>
              <ul className="space-y-1">
                {proposal.attachmentRecommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-skin-tertiary flex gap-1.5">
                    <span className="text-skin-accent">-&gt;</span> {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="neo-btn-secondary flex-1 text-sm"
            >
              {loading ? "Regenerating..." : "Regenerate"}
            </button>
            <button
              onClick={() => handleCopy("coverLetter", editing ? editingCoverLetter : proposal.coverLetter)}
              className="neo-btn-primary flex-1 text-sm"
            >
              {copied.coverLetter ? "Copied!" : "Copy Cover Letter"}
            </button>
          </div>
        </div>
      )}

      {/* Proposal History */}
      {history.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between text-sm text-skin-tertiary hover:text-skin-primary py-2"
          >
            <span>Recent Proposals ({history.length})</span>
            <span>{showHistory ? "▲" : "▼"}</span>
          </button>
          {showHistory && (
            <div className="space-y-2 mt-2">
              {history.slice(0, 10).map((item) => (
                <div key={item.id} className="neo-card text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-skin-secondary truncate">{item.jobTitle}</p>
                      <p className="text-skin-faint mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-skin-muted mt-1 line-clamp-2">{item.text}</p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleLoadProposal(item)}
                        className="text-skin-accent hover:text-skin-soft"
                        title="Load"
                      >
                        📄
                      </button>
                      <button
                        onClick={() => handleHistoryCopy(item.text, item.id)}
                        className="text-skin-tertiary hover:text-skin-primary"
                        title="Copy"
                      >
                        {historyCopied === item.id ? "✓" : "📋"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
