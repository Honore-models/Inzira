"use client";

import { SessionProvider } from "next-auth/react";
import { SpeechReader } from "@/components/SpeechReader";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <SpeechReader />
    </SessionProvider>
  );
}
