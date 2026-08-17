import Link from "next/link";
import { Plus } from "lucide-react";
import { OfficerShell } from "@/components/officer/OfficerShell";
import { YouthTable } from "@/components/officer/YouthTable";
import { officerYouthList, youthGoals, youthStatuses } from "@/data/officer";

export default function OfficerYouthList() {
  return (
    <OfficerShell active="Youth List">
      <div className="officer-page-wrap">
        <header className="officer-heading">
          <div>
            <h1>Youth List</h1>
            <p>All youth assigned to you.</p>
          </div>
          <div className="officer-heading-actions">
            <Link className="officer-button primary" href="/officer/intake">
              <Plus aria-hidden size={15} />
              Add new youth
            </Link>
          </div>
        </header>

        <YouthTable
          initialYouth={officerYouthList}
          goals={youthGoals}
          statuses={youthStatuses}
        />
      </div>
    </OfficerShell>
  );
}
