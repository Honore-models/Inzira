"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Mail,
  MapPin,
  ShieldCheck,
  Clock,
  Users,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { OfficerShell } from "@/components/officer/OfficerShell";
import { getPhotoUrl } from "@/lib/photos";

interface OfficerProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department: string;
  district_assigned: string;
  created_at: string;
}

interface CaseStats {
  total: number;
  active: number;
  completed: number;
  pending: number;
}

export default function OfficerProfile() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<OfficerProfile | null>(null);
  const [caseStats, setCaseStats] = useState<CaseStats>({
    total: 0,
    active: 0,
    completed: 0,
    pending: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch the officer's own profile via the profile API
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data);
        }

        // Fetch cases to compute stats
        const casesRes = await fetch("/api/cases");
        if (casesRes.ok) {
          const cases = await casesRes.json();
          setCaseStats({
            total: cases.length,
            active: cases.filter((c: { status: string }) => c.status === "active").length,
            completed: cases.filter((c: { status: string }) => c.status === "completed").length,
            pending: cases.filter(
              (c: { status: string }) => c.status === "pending"
            ).length,
          });
        }
      } catch {
        // Silently handle errors
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const userName = session?.user?.name || profile?.full_name || "Officer";
  const email = session?.user?.email || profile?.email || "";
  const initials = userName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const photoUrl = getPhotoUrl(email);

  if (loading) {
    return (
      <OfficerShell active="Profile">
        <div className="officer-page-wrap">
          <div className="yd-loading">
            <div className="yd-loading-spinner" />
            <p>Loading profile…</p>
          </div>
        </div>
      </OfficerShell>
    );
  }

  return (
    <OfficerShell active="Profile">
      <div className="officer-page-wrap">
        {/* Page header */}
        <header className="officer-heading">
          <div>
            <h1>My Profile</h1>
            <p>View your account details and caseload summary.</p>
          </div>
        </header>

        {/* Profile hero card */}
        <section className="officer-profile-hero">
          <div className="officer-profile-hero-inner">
            <div className="officer-profile-hero-left">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={userName}
                  className="officer-profile-hero-photo"
                />
              ) : (
                <div className="officer-profile-hero-initials">
                  {initials}
                </div>
              )}
              <div className="officer-profile-hero-info">
                <h2>{userName}</h2>
                <span className="officer-role-badge">
                  <ShieldCheck size={13} />
                  Youth Officer
                </span>
              </div>
            </div>
            <div className="officer-profile-hero-meta">
              <span>
                <Mail size={14} />
                {email}
              </span>
              {profile?.department && (
                <span>
                  <Briefcase size={14} />
                  {profile.department}
                </span>
              )}
              {profile?.district_assigned && (
                <span>
                  <MapPin size={14} />
                  {profile.district_assigned}
                </span>
              )}
              {profile?.created_at && (
                <span>
                  <Clock size={14} />
                  Joined{" "}
                  {new Date(profile.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Stats grid */}
        <section className="officer-profile-stats">
          <div className="officer-stat-card green">
            <div className="officer-stat-icon">
              <Users size={19} />
            </div>
            <div className="officer-stat-body">
              <span>Total cases</span>
              <strong>{caseStats.total}</strong>
            </div>
          </div>
          <div className="officer-stat-card blue">
            <div className="officer-stat-icon">
              <Clock size={19} />
            </div>
            <div className="officer-stat-body">
              <span>Active</span>
              <strong>{caseStats.active}</strong>
            </div>
          </div>
          <div className="officer-stat-card purple">
            <div className="officer-stat-icon">
              <CheckCircle2 size={19} />
            </div>
            <div className="officer-stat-body">
              <span>Completed</span>
              <strong>{caseStats.completed}</strong>
            </div>
          </div>
          <div className="officer-stat-card amber">
            <div className="officer-stat-icon">
              <Briefcase size={19} />
            </div>
            <div className="officer-stat-body">
              <span>Pending</span>
              <strong>{caseStats.pending}</strong>
            </div>
          </div>
        </section>

        {/* Details card */}
        <section className="officer-card">
          <header className="officer-card-header">
            <div>
              <h2>
                <User size={16} />
                Account Details
              </h2>
              <p>Your officer account information</p>
            </div>
          </header>
          <div className="officer-profile-details-grid">
            <div className="officer-profile-detail-row">
              <span className="officer-detail-label">Full name</span>
              <span className="officer-detail-value">{userName}</span>
            </div>
            <div className="officer-profile-detail-row">
              <span className="officer-detail-label">Email</span>
              <span className="officer-detail-value">{email}</span>
            </div>
            <div className="officer-profile-detail-row">
              <span className="officer-detail-label">Role</span>
              <span className="officer-detail-value officer-role-pill">
                Youth Officer
              </span>
            </div>
            <div className="officer-profile-detail-row">
              <span className="officer-detail-label">Department</span>
              <span className="officer-detail-value">
                {profile?.department || "—"}
              </span>
            </div>
            <div className="officer-profile-detail-row">
              <span className="officer-detail-label">District assigned</span>
              <span className="officer-detail-value">
                {profile?.district_assigned || "—"}
              </span>
            </div>
            <div className="officer-profile-detail-row">
              <span className="officer-detail-label">Member since</span>
              <span className="officer-detail-value">
                {profile?.created_at
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
      </div>
    </OfficerShell>
  );
}
