import Image from "next/image";
import { ArrowRight, Mail, MapPin, ShieldCheck, Briefcase, GraduationCap, FileText, Landmark } from "lucide-react";
import { LandingHeader } from "@/components/LandingHeader";

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
      <LandingHeader />

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
        <div className="button-row">
          <a className="button primary" href="/auth/signup?role=youth">
            Get my roadmap
          </a>
          <a className="button secondary" href="/auth/signup?role=officer">
            I&apos;m a youth officer
          </a>
        </div>

        <div className="stats" aria-label="Key platform context">
          <div>
            <strong>5</strong>
            <span>institutions brought into one path: RDB, RRA, BRD, RTB and the Ministry of Youth</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>of roadmaps reviewed and approved by a youth officer</span>
          </div>
          <div>
            <strong>Free</strong>
            <span>for young people, on any phone with a browser</span>
          </div>
        </div>
      </section>

      <section id="problem" className="problem section split">
        <div className="copy-block">
          <p className="eyebrow">The problem</p>
          <h2>Everything a youth needs already exists. Finding it is the problem.</h2>
          <p>
            RDB, RRA, BRD and RTB all offer real, funded support for training,
            registration and business growth. But each institution assumes you
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
          <FeatureList id="officers" title="For the officer" items={officerItems} />
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
        <a href="/auth/signup?role=youth" className="text-link">
          Start your journey <ArrowRight aria-hidden size={16} />
        </a>
      </section>

      <section className="cta section">
        <h2>Ready to find your path?</h2>
        <p>Create a free account in two minutes. Already registered? <a href="/auth/signin" style={{ color: "var(--green)", fontWeight: 700 }}>Sign in</a>.</p>
        <div className="button-row">
          <a className="button primary" href="/auth/signup?role=youth">
            Get my roadmap
          </a>
          <a className="button secondary" href="/auth/signup?role=officer">
            I&apos;m a youth officer
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
          </div>

          <div className="footer-links-col">
            <h4>Platform</h4>
            <ul className="platform-links">
              <li><a href="#how-it-works">How it works</a></li>
              <li><a href="#problem">The problem</a></li>
              <li><a href="/auth/signup?role=youth">Create an account</a></li>
              <li><a href="/auth/signin">Sign in</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Official resources</h4>
            <ul>
              <li><a href="https://rdb.rw" target="_blank" rel="noopener noreferrer"><Briefcase size={16} aria-hidden /> RDB — Business registration</a></li>
              <li><a href="https://www.rra.gov.rw" target="_blank" rel="noopener noreferrer"><FileText size={16} aria-hidden /> RRA — Tax registration</a></li>
              <li><a href="https://www.brd.rw" target="_blank" rel="noopener noreferrer"><Landmark size={16} aria-hidden /> BRD — Loan guarantees</a></li>
              <li><a href="https://www.rtb.gov.rw" target="_blank" rel="noopener noreferrer"><GraduationCap size={16} aria-hidden /> RTB — Vocational training</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:hello@inzira.rw"><Mail size={16} aria-hidden /> hello@inzira.rw</a></li>
              <li><span><MapPin size={16} aria-hidden /> Kigali, Rwanda</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-security">
            <ShieldCheck size={16} aria-hidden />
            <p>Your information is secure and used only to provide better support and guidance.</p>
          </div>
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} <strong>Inzira</strong>. All rights reserved.
          </p>
          <div className="footer-legal">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms of use</a>
          </div>
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
