import React, { useState } from "react";
import { useUIStore } from "../store";
import { useAI } from "../hooks/useAI";
import type { MeetingPrep as MeetingPrepType, ChatData, MeetingData } from "../../shared/types";

export default function MeetingPrep() {
  const pageData = useUIStore((s) => s.pageData);
  const profile = useUIStore((s) => s.profile);
  const loading = useUIStore((s) => s.loading["meeting-prep"]);
  const error = useUIStore((s) => s.errors["meeting-prep"]);
  const { sendMessage } = useAI();
  const [prep, setPrep] = useState<MeetingPrepType | null>(null);
  const [customContext, setCustomContext] = useState("");

  const chatData = pageData?.type === "messages" ? (pageData.data as ChatData) : null;
  const meetings = chatData?.meetings || [];

  const handlePrepare = async () => {
    if (!profile) return;

    const meetingInfo = meetings.length > 0
      ? ` | Upcoming: ${meetings.map((m) => `${m.title} (${m.scheduledTime})`).join(", ")}`
      : "";
    const jobContext = (chatData?.jobTitle || customContext || "General freelance discussion") + meetingInfo;
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
        <h3 className="text-lg font-bold text-skin-secondary mb-2">Meeting Prep</h3>
        <p className="text-sm text-skin-muted">Set up your profile in Settings first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Context */}
      <div className="neo-card">
        <h3 className="font-bold text-sm text-skin-accent mb-2">📅 Meeting Preparation</h3>
        {chatData ? (
          <div>
            <p className="text-sm text-skin-tertiary">
              Client: <span className="text-skin-secondary">{chatData.contactName}</span>
            </p>
            {chatData.jobTitle && (
              <p className="text-sm text-skin-tertiary">
                Job: <span className="text-skin-secondary">{chatData.jobTitle}</span>
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-xs text-skin-muted mb-2">
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
        {meetings.length > 0 && (
          <div className="mt-3 pt-3 border-t border-skin">
            <h4 className="text-xs font-medium text-skin-tertiary mb-2">Detected Meetings</h4>
            <div className="space-y-2">
              {meetings.map((m, i) => (
                <div key={i} className="text-xs bg-elevated rounded p-2">
                  <span className="text-skin-soft">{m.title}</span>
                  {m.scheduledTime && (
                    <span className="text-skin-muted ml-2">at {m.scheduledTime}</span>
                  )}
                </div>
              ))}
            </div>
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
        <div className="neo-card border-skin-error bg-status-error">
          <p className="text-sm text-skin-error">{error}</p>
        </div>
      )}

      {/* Prep Results */}
      {prep && (
        <div className="space-y-3">
          {/* Talking Points */}
          <div className="neo-card">
            <h4 className="font-medium text-skin-secondary text-sm mb-2">🎯 Talking Points</h4>
            <ul className="space-y-2">
              {prep.talkingPoints.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm text-skin-tertiary">
                  <input type="checkbox" className="mt-0.5 accent-brand-500" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Likely Questions */}
          <div className="neo-card">
            <h4 className="font-medium text-skin-secondary text-sm mb-2">❓ Likely Client Questions</h4>
            <ul className="space-y-2">
              {prep.likelyQuestions.map((q, i) => (
                <li key={i} className="text-sm text-skin-tertiary flex gap-2">
                  <span className="text-skin-warning">Q:</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Preparation Tips */}
          <div className="neo-card">
            <h4 className="font-medium text-skin-secondary text-sm mb-2">💡 Preparation Tips</h4>
            <ul className="space-y-1">
              {prep.preparationTips.map((tip, i) => (
                <li key={i} className="text-xs text-skin-tertiary flex gap-2">
                  <span className="text-skin-accent">→</span>
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
