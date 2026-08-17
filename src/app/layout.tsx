import type { Metadata } from "next";
import "./globals.css";
import "./officer.css";

export const metadata: Metadata = {
  title: "Inzira",
  description:
    "A guided path helping Rwandan youth discover, sequence, and access employment support programs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
