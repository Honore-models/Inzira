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

export default function YouthAsk() {
  return (
    <YouthShell active="Ask">
      <div className="youth-page-wrap ask-page">
        <header className="ask-page-heading">
          <div>
            <h1>Ask Inzira</h1>
            <p>Ask anything about programs, requirements, or next steps.</p>
          </div>
          <button className="ask-how-link" type="button">
            <Info aria-hidden size={16} />
            How it works
          </button>
        </header>

        <div className="ask-layout">
          <div className="ask-chat-column">
            <div className="chat-thread">
              <div className="user-message">{askSampleExchange.question}</div>

              <article className="ai-response-card">
                {('answerHeader' in askSampleExchange) && (
                  <p className="ai-response-intro">{(askSampleExchange as any).answerHeader}</p>
                )}
                <ul>
                  {askSampleExchange.answer.map((item) => (
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
                    <button aria-label="Yes, helpful" type="button">
                      <ThumbsUp aria-hidden size={16} />
                    </button>
                    <button aria-label="No, not helpful" type="button">
                      <ThumbsDown aria-hidden size={16} />
                    </button>
                  </div>
                </footer>
              </article>
            </div>

            <div className="ask-suggestions">
              {askSuggestions.map((item) => (
                <button type="button" key={item}>
                  {item}
                </button>
              ))}
            </div>

            <form className="ask-input">
              <input aria-label="Ask a question" placeholder="Ask a question..." />
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
              <button type="button">Notify my officer</button>
            </div>

            <div className="common-topics">
              <h2>Common topics</h2>
              <ul>
                {askCommonTopics.map((topic) => {
                  const Icon = topicIcons[topic.icon as keyof typeof topicIcons];
                  return (
                    <li key={topic.label}>
                      <button type="button">
                        <Icon aria-hidden size={16} />
                        {topic.label}
                      </button>
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
