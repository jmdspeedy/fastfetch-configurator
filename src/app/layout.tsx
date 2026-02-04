import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fastfetch Configurator | Custom Fastfetch Preset Generator",
  description: "Create and deploy beautiful Fastfetch configurations with our interactive builder. Customize modules, logos, and appearance with a real-time terminal preview.",
  keywords: ["fastfetch", "configurator", "terminal", "linux", "customization", "cli", "dotfiles"],
  authors: [{ name: "James" }],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Fastfetch Configurator",
    description: "Interactive Fastfetch configuration builder with live preview.",
    type: "website",
    url: "https://fastfetch-configurator.vercel.app", 
    images: [
      {
        url: "/logo.svg",
        width: 512,
        height: 512,
        alt: "Fastfetch Configurator Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fastfetch Configurator",
    description: "Build your perfect Fastfetch config in seconds.",
    images: ["/logo.svg"],
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
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
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
      >
        {children}
      </body>
    </html>
  );
}
