import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: { default: "Incant — Cast your idea into an app", template: "%s — Incant" },
  description: "Speak or type your idea. Incant turns it into a shareable micro-app in seconds.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://incant.actvli.com"),
  keywords: ["micro app builder", "voice to app", "no code app", "PWA generator", "AI app builder"],
  authors: [{ name: "Äctvli Responsible Consulting", url: "https://www.actvli.com" }],
  creator: "Äctvli Responsible Consulting",
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: "https://incant.actvli.com",
    siteName: "Incant",
    title: "Incant — Cast your idea into an app",
    description: "Speak or type your idea. Incant turns it into a shareable micro-app in seconds.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Incant — Cast your idea into an app" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Incant — Cast your idea into an app",
    description: "Speak or type your idea. Incant turns it into a shareable micro-app in seconds.",
    images: ["/og-image.png"],
    creator: "@actvli",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Incant",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0f0a2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Incant",
  "url": "https://incant.actvli.com",
  "description": "Speak or type your idea. Incant turns it into a shareable micro-app in seconds.",
  "applicationCategory": "ProductivityApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": [
    { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "EUR" },
    { "@type": "Offer", "name": "Caster", "price": "7", "priceCurrency": "EUR", "billingIncrement": "P1M" },
    { "@type": "Offer", "name": "Wizard", "price": "14", "priceCurrency": "EUR", "billingIncrement": "P1M" },
  ],
  "author": {
    "@type": "Organization",
    "name": "Äctvli Responsible Consulting",
    "url": "https://www.actvli.com",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
