import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { OfficerAvatar, OfficerShell } from "@/components/officer/OfficerShell";
import { YouthDetailTabs } from "@/components/officer/YouthDetailTabs";
import { youthDetail } from "@/data/officer";

export function generateStaticParams() {
  return [{ id: "sandrine" }];
}

export default function OfficerYouthDetail() {
  const detail = youthDetail;

  return (
    <OfficerShell active="Youth List">
      <div className="officer-page-wrap">
        <Link className="officer-back-link" href="/officer/youth">
          <ArrowLeft aria-hidden size={15} />
          Back to list
        </Link>

        <header className="officer-profile-card">
          <OfficerAvatar avatar={detail.avatar} size="large" />
          <div className="officer-profile-copy">
            <div className="officer-profile-title">
              <h1>{detail.name}</h1>
              <span className="status-pill on-track">On track</span>
            </div>
            <p>
              {detail.goal} • {detail.location}
            </p>
          </div>
        </header>

        <YouthDetailTabs detail={detail} />

        <aside className="officer-banner">
          <span className="officer-banner-icon">
            <Check aria-hidden size={22} />
          </span>
          <div>
            <strong>This is exactly what the youth sees on their dashboard.</strong>
            <p>Any changes you make will be reflected after approval.</p>
          </div>
        </aside>
      </div>
    </OfficerShell>
  );
}
