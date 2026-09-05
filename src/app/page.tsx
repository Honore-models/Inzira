import Image from "next/image";
import { ArrowRight } from "lucide-react";

const youthItems = [
  {
    title: "Getting started",
    text: "A personal, ordered roadmap that shows you what to do next.",
  },
  {
    title: "Ask",
    text: "Get answers to your questions, grounded in verified information with sources shown.",
  },
  {
    title: "Find help",
    text: "Discover verified programs, offices, and requirements in one place.",
  },
];

const officerItems = [
  {
    title: "Smart intake",
    text: "AI drafts the roadmap based on verified rules. The officer adds context and approves.",
  },
  {
    title: "Youth list",
    text: "See your full caseload and track progress at a glance.",
  },
  {
    title: "Roadmap review",
    text: "Every plan is checked by a human before it reaches the youth.",
  },
];

const stories = [
  {
    src: "/youth.webp",
    alt: "Young Rwandan person outdoors",
    quote: "I want skills that lead to a job, but I do not know where to start.",
    label: "Seeking vocational training",
  },
  {
    src: "/youth2.jpg",
    alt: "Young Rwandan man thinking",
    quote: "I have a business idea, but I need support to grow it.",
    label: "Building a small business",
  },
  {
    src: "/youth3.jpg",
    alt: "Young Rwandan person waiting for guidance",
    quote: "I do not qualify for loans, and I do not know why.",
    label: "Looking for financial support",
  },
  {
    src: "/youth4.jpg",
    alt: "Young Rwandan person in a community setting",
    quote: "I know support exists, but I need someone to show me the right order.",
    label: "Finding the right first step",
  },
];

const journey = [
  "Share your goal and situation",
  "Officer reviews and adds context",
  "Get your step-by-step roadmap",
  "Follow, unlock, and achieve",
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Inzira home">
          <img src="/inzira_logo.png" alt="Inzira" />
        </a>
        <nav className="nav" aria-label="Primary navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#problem">The problem</a>
          <a href="#demo">Live demo</a>
        </nav>
        <a className="header-action" href="/auth/signin">
          Sign in
        </a>
      </header>

      <section id="top" className="hero section">
        <p className="eyebrow">A guided path to real opportunity</p>
        <h1>
          The help was always there.
          <span>Now it has a direction.</span>
        </h1>
        <p className="hero-copy">
          Youth employment programs in Rwanda already exist. Inzira makes them
          findable, sequenced, and easy to follow.
        </p>
        <div className="button-row" id="demo">
          <a className="button primary" href="/auth/signup?role=youth">
            Enter as a youth
          </a>
          <a className="button secondary" href="/auth/signup?role=officer">
            Enter as an officer
          </a>
        </div>

        <div className="stats" aria-label="Key platform context">
          <div>
            <strong>60%+</strong>
            <span>of Rwandan youth are unemployed or underemployed</span>
          </div>
          <div>
            <strong>3</strong>
            <span>separate institutions youth must navigate alone</span>
          </div>
          <div>
            <strong>1</strong>
            <span>guided path connecting them</span>
          </div>
        </div>
        <p className="note">Figures illustrative for demonstration purposes</p>
      </section>

      <section id="problem" className="problem section split">
        <div className="copy-block">
          <p className="eyebrow">The problem</p>
          <h2>Everything a youth needs already exists. Finding it is the problem.</h2>
          <p>
            RDB, BDF, and RTB all offer real, funded support for education,
            training, and business growth. But each institution assumes you
            already know what to do and in what order.
          </p>
          <p>
            As a result, many young people give up navigating between offices,
            or never discover help that could have worked for them.
          </p>
          <p className="emphasis">
            Inzira brings clarity, order, and human guidance to a system that
            was never connected.
          </p>
        </div>
        <div className="image-frame">
          <Image
            src="/youth.webp"
            alt="Young Rwandan man seated in a crowd"
            width={764}
            height={572}
            priority
          />
        </div>
      </section>

      <section className="solution section" aria-labelledby="solution-title">
        <p className="eyebrow">The solution</p>
        <h2 id="solution-title">One path. Two sides. Built together.</h2>
        <div className="two-sides">
          <FeatureList id="youth" title="For the youth" items={youthItems} />
          <FeatureList id="officer" title="For the officer" items={officerItems} />
        </div>
        <div className="principle">
          <p className="eyebrow">Our principle</p>
          <strong>The AI drafts. The officer decides.</strong>
          <span>
            Every roadmap a youth sees has been reviewed by a real person first.
          </span>
        </div>
      </section>

      <section className="stories section split">
        <div className="copy-block compact">
          <p className="eyebrow">Real youth. Real challenges.</p>
          <h2>Different goals. Same obstacles.</h2>
          <p>
            Across Rwanda, thousands of young people are working hard and
            staying determined, but the path forward is not always clear.
          </p>
          <p className="emphasis">
            You are not alone. We will help you find your way.
          </p>
        </div>
        <div className="slideshow" aria-label="Youth challenge slideshow">
          {stories.map((story) => (
            <article className="slide" key={story.label}>
              <Image src={story.src} alt={story.alt} width={720} height={520} />
              <div className="slide-caption">
                <blockquote>{story.quote}</blockquote>
                <p>{story.label}</p>
              </div>
            </article>
          ))}
          <div className="dots" aria-hidden="true">
            <span className="active" />
            <span />
            <span />
            <span />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="journey section">
        <div>
          <p className="eyebrow">How it works</p>
          <h2>A simple, guided journey from start to success.</h2>
        </div>
        <ol>
          {journey.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
        <a href="#top" className="text-link">
          See how it works <ArrowRight aria-hidden size={16} />
        </a>
      </section>

      <section className="cta section">
        <h2>Ready to see it in action?</h2>
        <p>Choose your entrance and explore Inzira.</p>
        <div className="button-row">
          <a className="button primary" href="/auth/signup?role=youth">
            Enter as a youth
          </a>
          <a className="button secondary" href="/auth/signup?role=officer">
            Enter as an officer
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand-col">
            <a className="brand" href="#top" aria-label="Inzira home">
              <img src="/inzira_logo.png" alt="Inzira" />
            </a>
            <p className="footer-tagline">
              A guided path connecting Rwandan youth with verified employment
              support programs.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="#" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-links-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#problem">The problem</a></li>
              <li><a href="#demo">Live demo</a></li>
              <li><a href="/auth/signup?role=youth">Enter as a youth</a></li>
              <li><a href="/auth/signup?role=officer">Enter as an officer</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">RDB — Business support</a></li>
              <li><a href="#">BDF — Loan guarantees</a></li>
              <li><a href="#">RTB — Vocational training</a></li>
              <li><a href="#">RRA — Tax registration</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@inzira.rw">hello@inzira.rw</a></li>
              <li><span>Kigali, Rwanda</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            A demonstration project. All people, organizations, and data shown
            are fictional. Statistics cited are from public sources.
          </p>
          <p>
            &copy; {new Date().getFullYear()} Inzira. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}

function FeatureList({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: { title: string; text: string }[];
}) {
  return (
    <div className="feature-list" id={id}>
      <h3>{title}</h3>
      {items.map((item) => (
        <div className="feature-row" key={item.title}>
          <strong>{item.title}</strong>
          <p>{item.text}</p>
        </div>
      ))}
    </div>
  );
}
