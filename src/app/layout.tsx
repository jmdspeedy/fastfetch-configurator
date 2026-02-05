import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fastfetch.jameswu.me"),
  verification: {
    google: "RwKszzbo-RHE3U90kCA9-fh5-8qYCbCoQr1Cmu5n_Rk",
  },
  title: "Fastfetch Visual Configurator | GUI Preset Generator",
  description: "Visually create, customize, and config Fastfetch presets with an interactive builder and real-time terminal preview. Generate and deploy beautiful Fastfetch configurations.",
  keywords: ["fastfetch", "config", "configurator", "visual", "builder", "generator", "terminal", "linux", "customization", "cli", "dotfiles", "preset"],
  authors: [{ name: "James" }],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Fastfetch Visual Configurator",
    description: "The easiest way to configure Fastfetch. A visual, interactive builder with live preview.",
    type: "website",
    url: "https://fastfetch.jameswu.me",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fastfetch Visual Configurator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fastfetch Visual Configurator",
    description: "Build and config your perfect Fastfetch preset in seconds with a visual GUI.",
    images: ["/og-image.png"],
  }
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "url": "https://fastfetch.jameswu.me",
            "logo": "https://fastfetch.jameswu.me/logo.svg"
          }) }}
        />
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
        <style>{`
          altcha-widget {
            --altcha-max-width: 100%;
            display: block;
            margin: 0 auto;
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
