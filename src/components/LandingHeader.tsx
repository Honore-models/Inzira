"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "#problem", label: "The problem" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#officers", label: "For officers" },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("hashchange", close);
    return () => window.removeEventListener("hashchange", close);
  }, []);

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Inzira home">
        <img src="/inzira_logo.png" alt="Inzira" />
      </a>
      <nav className="nav" aria-label="Primary navigation">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <div className="header-right">
        <a className="header-signin" href="/auth/signin">
          Sign in
        </a>
        <a className="header-action" href="/auth/signup?role=youth">
          Get started
        </a>
        <button
          className="header-menu-btn"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open ? (
        <nav id="mobile-nav" className="landing-mobile-nav" aria-label="Mobile navigation">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="/auth/signin">Sign in</a>
        </nav>
      ) : null}
    </header>
  );
}
