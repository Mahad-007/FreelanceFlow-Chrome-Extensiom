import React, { useEffect, useState } from "react";
import { useUIStore } from "./store";
import { usePageData } from "./hooks/usePageData";
import Settings from "./components/Settings";
import ProfileScanner from "./components/ProfileScanner";
import JobHunter from "./components/JobHunter";
import ProposalGenerator from "./components/ProposalGenerator";
import ProfileImprover from "./components/ProfileImprover";
import ChatAssistant from "./components/ChatAssistant";
import MeetingPrep from "./components/MeetingPrep";
import PortfolioBuilder from "./components/PortfolioBuilder";
import Icon from "./components/Icon";

const TABS = [
  { id: "profile-scanner", label: "Profile" },
  { id: "job-hunter", label: "Jobs" },
  { id: "proposal", label: "Proposal" },
  { id: "chat", label: "Chat" },
  { id: "meeting", label: "Meeting" },
];

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const initialize = useUIStore((s) => s.initialize);
  const settings = useUIStore((s) => s.settings);
  const setSettings = useUIStore((s) => s.setSettings);
  const { pageType } = usePageData();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Sync theme to DOM
  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
  }, [settings.theme]);

  const toggleTheme = async () => {
    const newTheme: "light" | "dark" = settings.theme === "dark" ? "light" : "dark";
    const updated = { ...settings, theme: newTheme };
    await chrome.runtime.sendMessage({ type: "SAVE_SETTINGS", settings: updated });
    setSettings(updated);
  };

  // Show settings if no API key configured
  const needsSetup = !settings.openrouterApiKey;

  if (needsSetup || showSettings) {
    return (
      <div className="p-4 overflow-y-auto max-h-screen">
        <Settings onClose={needsSetup ? undefined : () => setShowSettings(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-skin-subtle bg-surface">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 12.5l4-5.5h3L7 12.5h4.5L13 11l-2-3h-1l2.5-3.5L11 3 6.5 9H4l3.5-5L6 3 2 9h3L3 12.5z" />
            </svg>
          </div>
          <span className="text-sm font-extrabold text-skin-primary tracking-tight-sm">
            FreelanceFlow
          </span>
        </div>
        <div className="flex items-center gap-1">
          {pageType !== "unknown" && (
            <span className="text-2xs text-skin-faint bg-elevated px-2 py-0.5 rounded-full">
              {pageType}
            </span>
          )}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-elevated text-skin-muted hover:text-skin-primary transition-colors"
            title="Toggle theme"
          >
            <Icon name={settings.theme === "dark" ? "sun" : "moon"} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-lg hover:bg-elevated text-skin-muted hover:text-skin-primary transition-colors"
            title="Settings"
          >
            <Icon name="settings" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-skin-subtle bg-surface">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-0 py-2.5 text-xs font-medium tracking-wide-sm transition-colors relative ${
              activeTab === tab.id ? "tab-active" : "tab-inactive"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-brand-400" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        {activeTab === "profile-scanner" && (
          <>
            <PortfolioBuilder />
            <div className="mt-6 pt-6 border-t border-skin-subtle">
              <ProfileScanner />
            </div>
          </>
        )}
        {activeTab === "job-hunter" && <JobHunter />}
        {activeTab === "proposal" && (
          <>
            <ProposalGenerator />
            <div className="mt-6 pt-6 border-t border-skin-subtle">
              <ProfileImprover />
            </div>
          </>
        )}
        {activeTab === "chat" && <ChatAssistant />}
        {activeTab === "meeting" && <MeetingPrep />}
      </div>
    </div>
  );
}
