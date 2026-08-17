import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";
import "./officer.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1f6f4c",
};

export const metadata: Metadata = {
  title: {
    default: "Inzira — Guided Path for Rwandan Youth Employment",
    template: "%s | Inzira",
  },
  description:
    "Inzira helps Rwandan youth discover, sequence, and access employment support programs. A guided path connecting youth with verified institutions like RDB, BDF, RTB, and RRA.",
  keywords: [
    "Rwanda youth employment",
    "youth programs Rwanda",
    "business registration Rwanda",
    "vocational training Rwanda",
    "RDB registration",
    "BDF loan guarantee",
    "TVET Rwanda",
    "youth empowerment",
    "employment support",
    "guided roadmap",
  ],
  authors: [{ name: "Inzira" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://inzira.rw",
    siteName: "Inzira",
    title: "Inzira — Guided Path for Rwandan Youth Employment",
    description:
      "Helping Rwandan youth discover, sequence, and access employment support programs with verified guidance.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Inzira — A guided path for Rwandan youth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inzira — Guided Path for Rwandan Youth Employment",
    description:
      "Helping Rwandan youth discover, sequence, and access employment support programs.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://inzira.rw",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/inzira_logo.png" />
        <link rel="apple-touch-icon" href="/inzira_logo.png" />
        <meta name="application-name" content="Inzira" />
        <meta name="msapplication-TileColor" content="#1f6f4c" />
      </head>
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
