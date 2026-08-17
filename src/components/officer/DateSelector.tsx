"use client";

import { useState } from "react";
import { Calendar, ChevronDown } from "lucide-react";

const weeks = [
  "May 12 – May 18, 2025",
  "May 5 – May 11, 2025",
  "Apr 28 – May 4, 2025",
];

export function DateSelector() {
  const [index, setIndex] = useState(0);

  return (
    <button
      className="officer-date-select"
      type="button"
      onClick={() => setIndex((i) => (i + 1) % weeks.length)}
      title="Click to change week"
    >
      <Calendar aria-hidden size={15} />
      {weeks[index]}
      <ChevronDown aria-hidden size={14} />
    </button>
  );
}
