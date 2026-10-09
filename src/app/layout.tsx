import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";
import "./officer.css";
import "./ui.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#1f6f4c",
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Inzira - Guided Path for Rwandan Youth Employment",
    template: "%s | Inzira",
  },
  description:
    "Inzira helps Rwandan youth discover, sequence, and access employment support programs. A guided path connecting youth with verified institutions like RDB, RRA, BRD and RTB.",
  keywords: [
    "Rwanda youth employment",
    "youth programs Rwanda",
    "business registration Rwanda",
    "vocational training Rwanda",
    "RDB registration",
    "BRD loan guarantee",
    "TVET Rwanda",
    "youth empowerment",
    "employment support",
    "guided roadmap",
  ],
  authors: [{ name: "Inzira" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Inzira",
    title: "Inzira — Guided Path for Rwandan Youth Employment",
    description:
      "Helping Rwandan youth discover, sequence, and access employment support programs with verified guidance.",
    images: [
      {
        url: "/og-image.svg",
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
    images: ["/og-image.svg"],
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
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Inzira",
  description:
    "A guided path connecting Rwandan youth with verified employment support programs.",
  url: SITE_URL,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "Inzira",
    url: SITE_URL,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <a className="visually-hidden" href="#main">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
