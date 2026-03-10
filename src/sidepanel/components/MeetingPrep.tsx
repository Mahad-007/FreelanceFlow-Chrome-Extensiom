import React, { useState } from "react";
import { useUIStore } from "../store";
import { useAI } from "../hooks/useAI";
import type { MeetingPrep as MeetingPrepType, ChatData } from "../../shared/types";

export default function MeetingPrep() {
  const pageData = useUIStore((s) => s.pageData);
  const profile = useUIStore((s) => s.profile);
  const loading = useUIStore((s) => s.loading["meeting-prep"]);
  const error = useUIStore((s) => s.errors["meeting-prep"]);
  const { sendMessage } = useAI();
  const [prep, setPrep] = useState<MeetingPrepType | null>(null);
  const [customContext, setCustomContext] = useState("");

  const chatData = pageData?.type === "messages" ? (pageData.data as ChatData) : null;

  const handlePrepare = async () => {
    if (!profile) return;

    const jobContext = chatData?.jobTitle || customContext || "General freelance discussion";
    const chatContext = chatData
      ? chatData.messages
          .slice(-10)
          .map((m) => `${m.sender}: ${m.text}`)
          .join("\n")
      : "No conversation history available.";

    const result = await sendMessage<MeetingPrepType>(
      { type: "AI_MEETING_PREP", jobContext, chatContext, profile },
      "meeting-prep"
    );
    if (result) setPrep(result);
  };

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📅</div>
        <h3 className="text-lg font-bold text-gray-300 mb-2">Meeting Prep</h3>
        <p className="text-sm text-gray-500">Set up your profile in Settings first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Context */}
      <div className="neo-card">
        <h3 className="font-bold text-sm text-brand-400 mb-2">📅 Meeting Preparation</h3>
        {chatData ? (
          <div>
            <p className="text-sm text-gray-400">
              Client: <span className="text-gray-300">{chatData.contactName}</span>
            </p>
            {chatData.jobTitle && (
              <p className="text-sm text-gray-400">
                Job: <span className="text-gray-300">{chatData.jobTitle}</span>
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-500 mb-2">
              No conversation detected. Add context manually:
            </p>
            <textarea
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder="Describe the meeting context (job title, client, topics...)"
              className="neo-input text-sm"
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Prepare Button */}
      {!prep && (
        <button
          onClick={handlePrepare}
          disabled={loading}
          className="neo-btn-primary w-full"
        >
          {loading ? "Preparing..." : "📅 Prepare for Meeting"}
        </button>
      )}

      {error && (
        <div className="neo-card border-red-600 bg-red-900/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Prep Results */}
      {prep && (
        <div className="space-y-3">
          {/* Talking Points */}
          <div className="neo-card">
            <h4 className="font-medium text-gray-300 text-sm mb-2">🎯 Talking Points</h4>
            <ul className="space-y-2">
              {prep.talkingPoints.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-400">
                  <input type="checkbox" className="mt-0.5 accent-brand-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Likely Questions */}
          <div className="neo-card">
            <h4 className="font-medium text-gray-300 text-sm mb-2">❓ Likely Client Questions</h4>
            <ul className="space-y-2">
              {prep.likelyQuestions.map((q, i) => (
                <li key={i} className="text-sm text-gray-400 flex gap-2">
                  <span className="text-yellow-400">Q:</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Preparation Tips */}
          <div className="neo-card">
            <h4 className="font-medium text-gray-300 text-sm mb-2">💡 Preparation Tips</h4>
            <ul className="space-y-1">
              {prep.preparationTips.map((tip, i) => (
                <li key={i} className="text-xs text-gray-400 flex gap-2">
                  <span className="text-brand-400">→</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={handlePrepare}
            disabled={loading}
            className="neo-btn-secondary w-full text-sm"
          >
            {loading ? "Regenerating..." : "🔄 Regenerate"}
          </button>
        </div>
      )}
    </div>
  );
}
