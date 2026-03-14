import React, { useState, useEffect } from "react";
import type { UserProfile } from "../../shared/types";

interface Props {
  initialProfile?: UserProfile | null;
  onSave: (profile: UserProfile) => void;
}

const EXPERIENCE_LEVELS = ["Entry", "Intermediate", "Expert"];
const SKILL_LEVELS = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Familiar" },
  { value: 3, label: "Proficient" },
  { value: 4, label: "Advanced" },
  { value: 5, label: "Expert" },
];

export default function ProfileForm({ initialProfile, onSave }: Props) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState<{ name: string; level: number }[]>([]);
  const [hourlyRateMin, setHourlyRateMin] = useState(0);
  const [hourlyRateMax, setHourlyRateMax] = useState(0);
  const [experience, setExperience] = useState("Intermediate");
  const [categories, setCategories] = useState<string[]>([]);
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>([]);

  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(3);
  const [newCategory, setNewCategory] = useState("");
  const [newLink, setNewLink] = useState("");

  const [validationError, setValidationError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name || "");
      setTitle(initialProfile.title || "");
      setBio(initialProfile.bio || "");
      setSkills(initialProfile.skills || []);
      setHourlyRateMin(initialProfile.hourlyRateMin || 0);
      setHourlyRateMax(initialProfile.hourlyRateMax || 0);
      setExperience(initialProfile.experience || "Intermediate");
      setCategories(initialProfile.categories || []);
      setPortfolioLinks(initialProfile.portfolioLinks || []);
    }
  }, [initialProfile]);

  const addSkill = () => {
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    setSkills([...skills, { name: trimmed, level: newSkillLevel }]);
    setNewSkillName("");
    setNewSkillLevel(3);
  };

  const removeSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) return;
    setCategories([...categories, trimmed]);
    setNewCategory("");
  };

  const removeCategory = (idx: number) => {
    setCategories(categories.filter((_, i) => i !== idx));
  };

  const addLink = () => {
    const trimmed = newLink.trim();
    if (!trimmed) return;
    setPortfolioLinks([...portfolioLinks, trimmed]);
    setNewLink("");
  };

  const removeLink = (idx: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!name.trim() || !title.trim()) {
      setValidationError("Name and title are required.");
      return;
    }
    setValidationError("");
    onSave({
      name: name.trim(),
      title: title.trim(),
      bio: bio.trim(),
      skills,
      hourlyRateMin: hourlyRateMin || 0,
      hourlyRateMax: hourlyRateMax || 0,
      experience,
      categories,
      portfolioLinks,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-skin-accent">Your Profile</h3>
      <p className="text-xs text-skin-muted">
        This info powers job scoring, proposals, and all AI features.
      </p>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-skin-secondary mb-1">
          Name <span className="text-skin-error">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className="neo-input"
        />
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-skin-secondary mb-1">
          Professional Title <span className="text-skin-error">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Full Stack Developer | React & Node.js"
          className="neo-input"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-skin-secondary mb-1">Bio / Overview</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Brief professional overview..."
          className="neo-input"
          rows={4}
        />
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-skin-secondary mb-1">Experience Level</label>
        <select
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          className="neo-input"
        >
          {EXPERIENCE_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>

      {/* Hourly Rate */}
      <div>
        <label className="block text-sm font-medium text-skin-secondary mb-1">Hourly Rate (USD)</label>
        <div className="flex items-center gap-2">
          <span className="text-skin-muted text-sm">$</span>
          <input
            type="number"
            value={hourlyRateMin || ""}
            onChange={(e) => setHourlyRateMin(Number(e.target.value))}
            placeholder="Min"
            className="neo-input w-24"
            min={0}
          />
          <span className="text-skin-muted text-sm">-</span>
          <input
            type="number"
            value={hourlyRateMax || ""}
            onChange={(e) => setHourlyRateMax(Number(e.target.value))}
            placeholder="Max"
            className="neo-input w-24"
            min={0}
          />
          <span className="text-skin-muted text-sm">/hr</span>
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-skin-secondary mb-1">Skills</label>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {skills.map((skill, i) => (
              <span
                key={i}
                className="neo-badge bg-elevated border-skin-strong text-skin-secondary gap-1"
              >
                {skill.name}
                <span className="text-[10px] text-skin-muted">
                  ({SKILL_LEVELS.find((l) => l.value === skill.level)?.label || skill.level})
                </span>
                <button
                  onClick={() => removeSkill(i)}
                  className="text-skin-muted hover:text-skin-error ml-0.5"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, addSkill)}
            placeholder="Skill name"
            className="neo-input flex-1"
          />
          <select
            value={newSkillLevel}
            onChange={(e) => setNewSkillLevel(Number(e.target.value))}
            className="neo-input w-28"
          >
            {SKILL_LEVELS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <button onClick={addSkill} className="neo-btn-secondary text-sm whitespace-nowrap">
            Add
          </button>
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-skin-secondary mb-1">Categories</label>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {categories.map((cat, i) => (
              <span key={i} className="neo-badge bg-elevated border-skin-strong text-skin-secondary gap-1">
                {cat}
                <button
                  onClick={() => removeCategory(i)}
                  className="text-skin-muted hover:text-skin-error ml-0.5"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, addCategory)}
            placeholder="e.g. Web Development"
            className="neo-input flex-1"
          />
          <button onClick={addCategory} className="neo-btn-secondary text-sm whitespace-nowrap">
            Add
          </button>
        </div>
      </div>

      {/* Portfolio Links */}
      <div>
        <label className="block text-sm font-medium text-skin-secondary mb-1">Portfolio Links</label>
        {portfolioLinks.length > 0 && (
          <div className="space-y-1 mb-2">
            {portfolioLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-skin-soft truncate flex-1">{link}</span>
                <button
                  onClick={() => removeLink(i)}
                  className="text-skin-muted hover:text-skin-error"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="url"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, addLink)}
            placeholder="https://..."
            className="neo-input flex-1"
          />
          <button onClick={addLink} className="neo-btn-secondary text-sm whitespace-nowrap">
            Add
          </button>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <p className="text-sm text-skin-error">{validationError}</p>
      )}

      {/* Save */}
      <button onClick={handleSave} className="neo-btn-primary w-full">
        {saved ? "Profile Saved!" : initialProfile ? "Update Profile" : "Save Profile"}
      </button>

      {saved && (
        <p className="text-xs text-skin-success text-center">
          Profile saved successfully. All AI features are now enabled.
        </p>
      )}
    </div>
  );
}
