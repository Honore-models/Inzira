"use client";

import { useState } from "react";
import {
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

interface InstitutionData {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  initials: string;
  logo_bg: string;
  logo_url: string | null;
  details: {
    fullDescription: string;
    services: string[];
    phone: string;
    email: string;
    hours: string;
    address: string;
  };
}

export function InstitutionCard({ item }: { item: InstitutionData }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="institution-card">
      <div
        className="institution-logo"
        style={{ backgroundColor: item.logo_bg }}
      >
        {item.initials}
      </div>

      <div className="institution-body">
        <h2>{item.title}</h2>
        <p>{item.description}</p>
        <div className="institution-meta">
          <span>
            <MapPin aria-hidden size={14} />
            {item.location}
          </span>
        </div>
      </div>

      <div className="institution-actions">
        <span className="institution-tag">{item.category}</span>
        <button
          className={`institution-details ${open ? "open" : ""}`}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? "Hide details" : "View details"}
          <ChevronDown aria-hidden size={14} />
        </button>
      </div>

      {open && item.details ? (
        <div className="institution-details-panel">
          <p className="details-intro">{item.details.fullDescription}</p>
          <div className="details-grid">
            <div className="details-block services">
              <h3>Services</h3>
              <ul>
                {item.details.services?.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </div>
            <div className="details-block">
              <h3>Contact &amp; hours</h3>
              <ul className="details-contact">
                <li>
                  <Phone aria-hidden size={14} />
                  {item.details.phone}
                </li>
                <li>
                  <Mail aria-hidden size={14} />
                  {item.details.email}
                </li>
                <li>
                  <Clock aria-hidden size={14} />
                  {item.details.hours}
                </li>
                <li>
                  <MapPin aria-hidden size={14} />
                  {item.details.address}
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
