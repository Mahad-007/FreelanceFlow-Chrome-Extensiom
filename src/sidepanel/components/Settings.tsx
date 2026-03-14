import React, { useState } from "react";
import { useUIStore } from "../store";
import { AVAILABLE_MODELS, DEFAULT_SETTINGS } from "../../shared/constants";
import type { ExtensionSettings, UserProfile } from "../../shared/types";
import ProfileForm from "./ProfileForm";

interface Props {
  onClose?: () => void;
}

export default function Settings({ onClose }: Props) {
  const settings = useUIStore((s) => s.settings);
  const setSettings = useUIStore((s) => s.setSettings);
  const profile = useUIStore((s) => s.profile);
  const setProfile = useUIStore((s) => s.setProfile);
  const [apiKey, setApiKey] = useState(settings.openrouterApiKey);
  const [model, setModel] = useState(settings.aiModel);
  const [autoScore, setAutoScore] = useState(settings.autoScore);
  const [autoSwitch, setAutoSwitch] = useState(settings.autoSwitchTabs);
  const [theme, setTheme] = useState(settings.theme);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const save = async () => {
    const updated: ExtensionSettings = {
      ...settings,
      openrouterApiKey: apiKey,
      aiModel: model,
      autoScore,
      autoSwitchTabs: autoSwitch,
      theme,
    };
    await chrome.runtime.sendMessage({ type: "SAVE_SETTINGS", settings: updated });
    setSettings(updated);
    onClose?.();
  };

  const testKey = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await chrome.runtime.sendMessage({ type: "TEST_API_KEY", apiKey });
      setTestResult(res.data ? "success" : "error");
    } catch {
      setTestResult("error");
    }
    setTesting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-skin-accent">Settings</h2>
        {onClose && (
          <button onClick={onClose} className="text-skin-tertiary hover:text-skin-primary text-lg">
            ✕
          </button>
        )}
      </div>

      {!settings.openrouterApiKey && (
        <div className="neo-card border-skin-brand bg-brand-subtle">
          <p className="text-sm text-skin-soft">
            Welcome to FreelanceFlow! Enter your OpenRouter API key to get started.
            Get one at{" "}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener"
              className="underline text-skin-accent hover:text-skin-soft"
            >
              openrouter.ai/keys
            </a>
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-skin-secondary mb-1">
            OpenRouter API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="neo-input flex-1"
            />
            <button
              onClick={testKey}
              disabled={!apiKey || testing}
              className="neo-btn-secondary text-sm whitespace-nowrap"
            >
              {testing ? "..." : "Test"}
            </button>
          </div>
          {testResult === "success" && (
            <p className="text-skin-success text-xs mt-1">API key is valid!</p>
          )}
          {testResult === "error" && (
            <p className="text-skin-error text-xs mt-1">Invalid API key. Please check and try again.</p>
          )}
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-skin-secondary mb-1">AI Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="neo-input"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* Appearance */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm text-skin-secondary">Appearance</label>
            <p className="text-xs text-skin-muted">{theme === "dark" ? "Dark mode" : "Light mode"}</p>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`w-10 h-6 rounded-full transition-colors ${
              theme === "dark" ? "bg-brand-600" : "bg-[var(--toggle-off)]"
            } relative`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                theme === "dark" ? "left-[18px]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Auto Score */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-skin-secondary">Auto-score jobs on page load</label>
          <button
            onClick={() => setAutoScore(!autoScore)}
            className={`w-10 h-6 rounded-full transition-colors ${
              autoScore ? "bg-brand-600" : "bg-[var(--toggle-off)]"
            } relative`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                autoScore ? "left-[18px]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Auto Switch */}
        <div className="flex items-center justify-between">
          <label className="text-sm text-skin-secondary">Auto-switch tabs based on page</label>
          <button
            onClick={() => setAutoSwitch(!autoSwitch)}
            className={`w-10 h-6 rounded-full transition-colors ${
              autoSwitch ? "bg-brand-600" : "bg-[var(--toggle-off)]"
            } relative`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                autoSwitch ? "left-[18px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      <button onClick={save} disabled={!apiKey} className="neo-btn-primary w-full">
        Save Settings
      </button>

      {/* Profile Form */}
      <div className="border-t-2 border-skin mt-6 pt-6">
        <ProfileForm
          initialProfile={profile}
          onSave={async (p) => {
            await chrome.runtime.sendMessage({ type: "SAVE_PROFILE", profile: p });
            setProfile(p);
          }}
        />
      </div>
    </div>
  );
}
