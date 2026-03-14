import React, { useState } from "react";
import { useUIStore } from "../store";
import { useAI } from "../hooks/useAI";
import type { ChatData, ChatReply } from "../../shared/types";

export default function ChatAssistant() {
  const pageData = useUIStore((s) => s.pageData);
  const profile = useUIStore((s) => s.profile);
  const loading = useUIStore((s) => s.loading["chat-replies"]);
  const error = useUIStore((s) => s.errors["chat-replies"]);
  const { sendMessage } = useAI();
  const [replies, setReplies] = useState<ChatReply[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const chatData = pageData?.type === "messages" ? (pageData.data as ChatData) : null;

  const handleSuggest = async () => {
    if (!chatData || !profile) return;
    const result = await sendMessage<ChatReply[]>(
      { type: "AI_CHAT_REPLIES", chat: chatData, profile },
      "chat-replies"
    );
    if (result) setReplies(result);
  };

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  if (!profile) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">💬</div>
        <h3 className="text-lg font-bold text-skin-secondary mb-2">Chat Assistant</h3>
        <p className="text-sm text-skin-muted">Set up your profile in Settings first.</p>
      </div>
    );
  }

  if (!chatData || chatData.messages.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">💬</div>
        <h3 className="text-lg font-bold text-skin-secondary mb-2">Chat Assistant</h3>
        <p className="text-sm text-skin-muted">
          Open an Upwork conversation to get reply suggestions.
        </p>
        <p className="text-xs text-skin-faint mt-2">Visit: upwork.com/ab/messages</p>
      </div>
    );
  }

  const toneLabels: Record<string, { label: string; icon: string; desc: string }> = {
    brief: { label: "Brief", icon: "⚡", desc: "Short & direct" },
    detailed: { label: "Detailed", icon: "📋", desc: "Thorough response" },
    custom: { label: "Friendly", icon: "😊", desc: "Personal & warm" },
  };

  return (
    <div className="space-y-4">
      {/* Chat Context */}
      <div className="neo-card">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm text-skin-accent">{chatData.contactName}</h3>
          {chatData.jobTitle && (
            <span className="text-xs text-skin-muted">{chatData.jobTitle}</span>
          )}
        </div>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {chatData.messages.slice(-5).map((msg, i) => (
            <div
              key={i}
              className={`text-xs p-2 rounded ${
                msg.sender === chatData.contactName
                  ? "bg-elevated text-skin-tertiary"
                  : "bg-brand-subtle text-skin-soft"
              }`}
            >
              <span className="font-medium">{msg.sender}: </span>
              <span className="line-clamp-2">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggest Button */}
      <button
        onClick={handleSuggest}
        disabled={loading}
        className="neo-btn-primary w-full"
      >
        {loading ? "Generating replies..." : "💬 Suggest Replies"}
      </button>

      {error && (
        <div className="neo-card border-skin-error bg-status-error">
          <p className="text-sm text-skin-error">{error}</p>
        </div>
      )}

      {/* Reply Options */}
      {replies.length > 0 && (
        <div className="space-y-3">
          {replies.map((reply, i) => {
            const meta = toneLabels[reply.tone] || toneLabels.custom;
            return (
              <div key={i} className="neo-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{meta.icon}</span>
                    <span className="font-medium text-sm text-skin-secondary">{meta.label}</span>
                    <span className="text-xs text-skin-muted">{meta.desc}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(reply.text, i)}
                    className="text-xs text-skin-accent hover:text-skin-soft"
                  >
                    {copiedIdx === i ? "✓ Copied!" : "📋 Copy"}
                  </button>
                </div>
                <p className="text-sm text-skin-tertiary whitespace-pre-wrap">{reply.text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
