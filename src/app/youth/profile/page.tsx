"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  GraduationCap,
  Building2,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Mail,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { YouthShell } from "@/components/youth/YouthShell";
import { getPhotoUrl } from "@/lib/photos";

interface Profile {
  id: string;
  full_name: string;
  email: string;
  goal: string;
  skills: string;
  district: string;
  sector: string;
  role: string;
  onboarding_completed: boolean;
  created_at: string;
}

interface Case {
  id: string;
  status: string;
  current_step: number;
  total_steps: number;
  created_at: string;
  officer: { full_name: string } | null;
}

const goalIcons: Record<string, typeof Briefcase> = {
  "Start a business": Briefcase,
  "Get vocational training": GraduationCap,
  "Find a job": Building2,
};

const goalLabels: Record<string, string> = {
  "Start a business": "Business",
  "Get vocational training": "Training",
  "Find a job": "Employment",
};

export default function YouthProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [youthCase, setYouthCase] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editGoal, setEditGoal] = useState("");
  const [editSkills, setEditSkills] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editSector, setEditSector] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data);
          setEditGoal(data.goal || "");
          setEditSkills(data.skills || "");
          setEditDistrict(data.district || "");
          setEditSector(data.sector || "");
        }

        const casesRes = await fetch("/api/cases");
        if (casesRes.ok) {
          const casesData = await casesRes.json();
          if (casesData.length > 0) {
            setYouthCase(casesData[0]);
          }
        }
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: editGoal,
          skills: editSkills,
          district: editDistrict,
          sector: editSector,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // Handle error silently
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditGoal(profile?.goal || "");
    setEditSkills(profile?.skills || "");
    setEditDistrict(profile?.district || "");
    setEditSector(profile?.sector || "");
    setEditing(false);
  }

  if (loading) {
    return (
      <YouthShell active="My Profile">
        <div className="youth-page-wrap">
          <div className="yd-loading">
            <div className="yd-loading-spinner" />
            <p>Loading your profile…</p>
          </div>
        </div>
      </YouthShell>
    );
  }

  if (!profile) {
    return (
      <YouthShell active="My Profile">
        <div className="youth-page-wrap">
          <div className="profile-empty">
            <User size={48} />
            <h2>Profile not found</h2>
            <p>Please complete onboarding to set up your profile.</p>
          </div>
        </div>
      </YouthShell>
    );
  }

  const initials = profile.full_name
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const photoUrl = getPhotoUrl(profile.email);
  const goalIcon = goalIcons[profile.goal] || Briefcase;
  const GoalIcon = goalIcon;
  const completedSteps = youthCase
    ? youthCase.current_step
    : 0;
  const totalSteps = youthCase ? youthCase.total_steps : 0;
  const progressPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <YouthShell active="My Profile">
      <div className="youth-page-wrap">
        {/* Header */}
        <div className="profile-header">
          <div className="profile-header-top">
            <div className="profile-avatar-section">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={profile.full_name}
                  className="profile-photo"
                />
              ) : (
                <div className="profile-initials">{initials}</div>
              )}
              <div className="profile-header-info">
                <h1>{profile.full_name}</h1>
                <p>{profile.email}</p>
              </div>
            </div>
            {!editing && (
              <button
                className="profile-edit-btn"
                type="button"
                onClick={() => setEditing(true)}
              >
                <Pencil size={14} />
                Edit profile
              </button>
            )}
          </div>
          {saved && (
            <div className="profile-saved-banner">
              <CheckCircle2 size={16} />
              Profile updated successfully
            </div>
          )}
        </div>

        {/* Personal Info Card */}
        <section className="profile-card">
          <div className="profile-card-header">
            <h2>
              <User size={16} />
              Personal Information
            </h2>
          </div>
          <div className="profile-info-grid">
            <div className="profile-info-row">
              <span className="profile-info-label">
                <Mail size={14} />
                Email
              </span>
              <span className="profile-info-value">{profile.email}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">
                <User size={14} />
                Full name
              </span>
              <span className="profile-info-value">{profile.full_name}</span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">
                <ShieldCheck size={14} />
                Account type
              </span>
              <span className="profile-info-value profile-role-badge">
                Youth
              </span>
            </div>
            <div className="profile-info-row">
              <span className="profile-info-label">
                <Clock size={14} />
                Member since
              </span>
              <span className="profile-info-value">
                {profile.created_at
                  ? new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "—"}
              </span>
            </div>
          </div>
        </section>

        {/* Goals & Location Card */}
        <section className="profile-card">
          <div className="profile-card-header">
            <h2>
              <Briefcase size={16} />
              Goals &amp; Location
            </h2>
          </div>
          {editing ? (
            <div className="profile-edit-form">
              <div className="profile-field">
                <label htmlFor="profile-goal">Primary goal</label>
                <select
                  id="profile-goal"
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                >
                  <option value="Start a business">Start a business</option>
                  <option value="Get vocational training">
                    Get vocational training
                  </option>
                  <option value="Find a job">Find a job</option>
                </select>
              </div>
              <div className="profile-field">
                <label htmlFor="profile-skills">Skills &amp; background</label>
                <textarea
                  id="profile-skills"
                  rows={3}
                  maxLength={300}
                  placeholder="Describe your skills, experience, or background…"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                />
                <span className="profile-char-count">
                  {editSkills.length}/300
                </span>
              </div>
              <div className="profile-field-row">
                <div className="profile-field">
                  <label htmlFor="profile-district">District</label>
                  <input
                    id="profile-district"
                    type="text"
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
                    placeholder="e.g. Kicukiro"
                  />
                </div>
                <div className="profile-field">
                  <label htmlFor="profile-sector">Sector</label>
                  <input
                    id="profile-sector"
                    type="text"
                    value={editSector}
                    onChange={(e) => setEditSector(e.target.value)}
                    placeholder="e.g. Kimironko"
                  />
                </div>
              </div>
              <div className="profile-edit-actions">
                <button
                  className="profile-btn outline"
                  type="button"
                  onClick={handleCancel}
                >
                  <X size={14} />
                  Cancel
                </button>
                <button
                  className="profile-btn primary"
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  <Save size={14} />
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-info-grid">
              <div className="profile-info-row">
                <span className="profile-info-label">
                  <GoalIcon size={14} />
                  Goal
                </span>
                <span className="profile-info-value">
                  {profile.goal || (
                    <span className="profile-undefined">Not set</span>
                  )}
                  {profile.goal && (
                    <span className="profile-tag">
                      {goalLabels[profile.goal] || profile.goal}
                    </span>
                  )}
                </span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">
                  <Pencil size={14} />
                  Skills
                </span>
                <span className="profile-info-value">
                  {profile.skills || (
                    <span className="profile-undefined">
                      No skills added yet
                    </span>
                  )}
                </span>
              </div>
              <div className="profile-info-row">
                <span className="profile-info-label">
                  <MapPin size={14} />
                  Location
                </span>
                <span className="profile-info-value">
                  {profile.district ? (
                    <>
                      {profile.district}
                      {profile.sector ? `, ${profile.sector}` : ""}
                    </>
                  ) : (
                    <span className="profile-undefined">Not set</span>
                  )}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Case Status Card */}
        <section className="profile-card">
          <div className="profile-card-header">
            <h2>
              <CheckCircle2 size={16} />
              My Case
            </h2>
          </div>
          {youthCase ? (
            <div className="profile-case-section">
              <div className="profile-case-stats">
                <div className="profile-case-stat">
                  <span>Status</span>
                  <strong className={`profile-status ${youthCase.status}`}>
                    {youthCase.status.charAt(0).toUpperCase() +
                      youthCase.status.slice(1)}
                  </strong>
                </div>
                <div className="profile-case-stat">
                  <span>Progress</span>
                  <strong>
                    {completedSteps} / {totalSteps} steps
                  </strong>
                </div>
                <div className="profile-case-stat">
                  <span>Assigned officer</span>
                  <strong>
                    {youthCase.officer?.full_name || (
                      <span className="profile-undefined">Not assigned</span>
                    )}
                  </strong>
                </div>
              </div>
              <div className="profile-progress-bar">
                <div className="profile-progress-header">
                  <span>Roadmap progress</span>
                  <strong>{progressPercent}%</strong>
                </div>
                <div className="meter-track">
                  <span style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="profile-case-empty">
              <Clock size={32} />
              <p>No case yet. Complete onboarding and your officer will create a roadmap for you.</p>
            </div>
          )}
        </section>
      </div>
    </YouthShell>
  );
}
