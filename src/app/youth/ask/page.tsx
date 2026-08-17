import { HelpCircle, Send, ShieldCheck } from "lucide-react";
import { YouthShell } from "@/components/youth/YouthShell";

const suggestions = [
  "What documents do I need for RDB registration?",
  "Can I get training before I register a business?",
  "When should I talk to a youth officer?",
];

export default function YouthAsk() {
  return (
    <YouthShell active="Ask">
      <header className="page-heading">
        <h1>Ask</h1>
        <p>Get answers grounded in verified program information.</p>
      </header>

      <section className="ask-layout">
        <div className="content-card chat-card">
          <div className="assistant-intro">
            <HelpCircle aria-hidden size={34} />
            <div>
              <h2>How can I help with your roadmap?</h2>
              <p>
                Ask about steps, documents, offices, or requirements. Financial
                and legal decisions are sent to a real officer.
              </p>
            </div>
          </div>
          <div className="suggestions">
            {suggestions.map((item) => (
              <button type="button" key={item}>
                {item}
              </button>
            ))}
          </div>
          <form className="question-box">
            <input aria-label="Ask a question" placeholder="Type your question..." />
            <button type="submit">
              <Send aria-hidden size={17} />
              Send
            </button>
          </form>
        </div>

        <aside className="content-card guardrail-card">
          <ShieldCheck aria-hidden size={30} />
          <h2>Human review stays in the loop</h2>
          <p>
            Inzira answers from verified sources. If a question could affect
            money, legal status, or eligibility, your youth officer reviews it.
          </p>
        </aside>
      </section>
    </YouthShell>
  );
}
