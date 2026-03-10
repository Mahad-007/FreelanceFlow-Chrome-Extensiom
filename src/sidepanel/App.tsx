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

const TABS = [
  { id: "profile-scanner", label: "Profile", icon: "👤" },
  { id: "job-hunter", label: "Jobs", icon: "🎯" },
  { id: "proposal", label: "Proposal", icon: "📝" },
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "meeting", label: "Meeting", icon: "📅" },
];

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const initialize = useUIStore((s) => s.initialize);
  const settings = useUIStore((s) => s.settings);
  const { pageType } = usePageData();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show settings if no API key configured
  const needsSetup = !settings.openrouterApiKey;

  if (needsSetup || showSettings) {
    return (
      <div className="p-4">
        <Settings onClose={needsSetup ? undefined : () => setShowSettings(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-gray-700 bg-gray-900">
        <h1 className="text-lg font-bold text-brand-400">FreelanceFlow</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {pageType !== "unknown" ? `📍 ${pageType}` : ""}
          </span>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-colors"
            title="Settings"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-gray-700 bg-gray-900/50 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-0 px-2 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? "tab-active" : "tab-inactive"
            }`}
          >
            <span className="block text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "profile-scanner" && (
          <>
            <PortfolioBuilder />
            <div className="mt-6 pt-6 border-t-2 border-gray-800">
              <ProfileScanner />
            </div>
          </>
        )}
        {activeTab === "job-hunter" && <JobHunter />}
        {activeTab === "proposal" && (
          <>
            <ProposalGenerator />
            <div className="mt-6 pt-6 border-t-2 border-gray-800">
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
