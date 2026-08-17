"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ClipboardList,
  ExternalLink,
  GraduationCap,
  Info,
  Send,
  ThumbsDown,
  ThumbsUp,
  Wallet,
} from "lucide-react";
import { YouthShell } from "@/components/youth/YouthShell";
import {
  askCommonTopics,
  askSampleExchange,
  askSuggestions,
} from "@/data/youth";

const topicIcons = {
  building: Building2,
  wallet: Wallet,
  graduation: GraduationCap,
  clipboard: ClipboardList,
};

type Exchange = {
  question: string;
  answerHeader: string;
  answer: string[];
};

const cannedAnswers: Record<string, Exchange> = {
  "How much does it cost to register a business?":
    {
      question: "How much does it cost to register a business?",
      answerHeader: "Registering a business name with RDB is free.",
      answer: [
        "Business name registration is free of charge at RDB.",
        "Bring your National ID and two alternative business names.",
        "Licenses for certain activities may have fees — check with RDB.",
      ],
    },
  "Where is the closest RDB office?":
    {
      question: "Where is the closest RDB office?",
      answerHeader: "RDB has offices across Rwanda.",
      answer: [
        "Your nearest RDB office is in Nyarugenge, Kigali (Kigali City Tower).",
        "You can also register online through the RDB e-services portal.",
        "Some districts host RDB agents at the district offices.",
      ],
    },
  "What is a TIN and how do I get it?":
    {
      question: "What is a TIN and how do I get it?",
      answerHeader: "A TIN is your Tax Identification Number.",
      answer: [
        "The TIN is issued by RRA and is free to obtain.",
        "You need it to open a business bank account and pay taxes.",
        "Apply at any RRA office or online at rra.gov.rw with your National ID.",
      ],
    },
};

export default function YouthAsk() {
  const [input, setInput] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([
    {
      question: askSampleExchange.question,
      answerHeader: askSampleExchange.answerHeader,
      answer: askSampleExchange.answer,
    },
  ]);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  function submit(question: string) {
    const q = question.trim();
    if (!q) return;
    const answer =
      cannedAnswers[q] ??
      ({
        question: q,
        answerHeader: "Here's what I found from verified sources:",
        answer: [
          "Thank you for your question. This is a demonstration, so here is a general answer.",
          "For the most accurate details, your youth officer can confirm your next step.",
          "You can also check the Find Help page for the relevant institution.",
        ],
      } as Exchange);
    setExchanges((prev) => [...prev, answer]);
    setInput("");
  }

  function notifyOfficer() {
    window.alert(
      "Your youth officer has been notified and will follow up with you.",
    );
  }

  return (
    <YouthShell active="Ask">
      <div className="youth-page-wrap ask-page">
        <header className="ask-page-heading">
          <div>
            <h1>Ask Inzira</h1>
            <p>Ask anything about programs, requirements, or next steps.</p>
          </div>
          <button
            className="ask-how-link"
            type="button"
            onClick={() =>
              window.alert(
                "Inzira answers using verified official sources. You can ask about programs, requirements, documents, and next steps.",
              )
            }
          >
            <Info aria-hidden size={16} />
            How it works
          </button>
        </header>

        <div className="ask-layout">
          <div className="ask-chat-column">
            <div className="chat-thread">
              {exchanges.map((exchange) => (
                <div className="ask-exchange" key={exchange.question + exchange.answerHeader}>
                  <div className="user-message">{exchange.question}</div>

                  <article className="ai-response-card">
                    <p className="ai-response-intro">{exchange.answerHeader}</p>
                    <ul>
                      {exchange.answer.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>

                    <footer className="ai-response-footer">
                      <Link className="ai-source-link" href={askSampleExchange.source.href}>
                        Source: {askSampleExchange.source.label}
                        <ExternalLink aria-hidden size={14} />
                      </Link>

                      <div className="ai-feedback">
                        <span>Is this answer helpful?</span>
                        <button
                          aria-label="Yes, helpful"
                          type="button"
                          className={feedback[exchange.answerHeader] === "yes" ? "active" : ""}
                          onClick={() =>
                            setFeedback((f) => ({ ...f, [exchange.answerHeader]: "yes" }))
                          }
                        >
                          <ThumbsUp aria-hidden size={16} />
                        </button>
                        <button
                          aria-label="No, not helpful"
                          type="button"
                          className={feedback[exchange.answerHeader] === "no" ? "active" : ""}
                          onClick={() =>
                            setFeedback((f) => ({ ...f, [exchange.answerHeader]: "no" }))
                          }
                        >
                          <ThumbsDown aria-hidden size={16} />
                        </button>
                      </div>
                    </footer>
                  </article>
                </div>
              ))}
            </div>

            <div className="ask-suggestions">
              {askSuggestions.map((item) => (
                <button type="button" key={item} onClick={() => submit(item)}>
                  {item}
                </button>
              ))}
            </div>

            <form
              className="ask-input"
              onSubmit={(e) => {
                e.preventDefault();
                submit(input);
              }}
            >
              <input
                aria-label="Ask a question"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button aria-label="Send question" type="submit">
                <Send aria-hidden size={18} />
              </button>
            </form>

            <div className="ask-disclaimer">
              <Info aria-hidden size={16} />
              <p>
                Inzira gives answers based only on verified official sources. For
                financial, legal, or complex cases, we&apos;ll connect you to a real
                officer.
              </p>
            </div>
          </div>

          <aside className="ask-sidebar">
            <div className="officer-notify-card">
              <h2>Need to speak with a real person?</h2>
              <p>
                If your question needs a human review, we can notify your youth
                officer to follow up with you.
              </p>
              <button type="button" onClick={notifyOfficer}>
                Notify my officer
              </button>
            </div>

            <div className="common-topics">
              <h2>Common topics</h2>
              <ul>
                {askCommonTopics.map((topic) => {
                  const Icon = topicIcons[topic.icon as keyof typeof topicIcons];
                  return (
                    <li key={topic.label}>
                      <button type="button">{topic.label}</button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </YouthShell>
  );
}
