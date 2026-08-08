import type { Metadata, Viewport } from "next";
import { Baloo_2, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import localFont from "next/font/local";

import { AudioProvider } from "@/components/audio/AudioProvider";
import { BootProvider } from "@/components/boot/BootProvider";
import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { profile } from "@/lib/content";

import "./globals.css";

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

/**
 * Zen Maru Gothic, subset to just the kana and kanji this site actually uses —
 * 11 KB a weight instead of several megabytes. Anything outside that set falls
 * through to the system Japanese stack declared on `--font-jp`.
 */
const zenMaru = localFont({
  src: [
    { path: "./fonts/zen-maru-gothic-subset-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/zen-maru-gothic-subset-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-zen-maru",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(profile.website),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s · ${profile.name}`,
  },
  description: profile.blurb,
  applicationName: profile.name,
  authors: [{ name: profile.name, url: profile.github }],
  keywords: [
    "DevOps",
    "SRE",
    "Kubernetes",
    "Cloud",
    "Security",
    "Platform Engineering",
    "Shirasaka Ren",
  ],
  openGraph: {
    type: "website",
    title: `${profile.name} — ${profile.role}`,
    description: profile.blurb,
    siteName: profile.name,
    url: profile.website,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} — ${profile.role}`,
    description: profile.blurb,
  },
  icons: {
    icon: [
      { url: "/icons/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icons/favicon/apple-touch-icon.png",
    shortcut: "/icons/favicon/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffe9f1",
  colorScheme: "light",
};

/**
 * Runs while the HTML is still parsing, i.e. before the first paint, so the
 * white boot shield is already up when the homepage's markup lands behind it.
 * Without JS the attribute is never set and the shield stays invisible, which
 * is exactly what a no-JS visitor wants. The timeout is a dead-man's switch:
 * if the boot sequence ever fails to run, the page frees itself.
 */
const BOOT_SHIELD_SCRIPT = `(function(){try{var p=location.pathname;if(p==="/"||p==="/index.html"){var d=document.documentElement;d.setAttribute("data-booting","true");setTimeout(function(){d.removeAttribute("data-booting")},16000)}}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${baloo.variable} ${jakarta.variable} ${jetbrains.variable} ${zenMaru.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: BOOT_SHIELD_SCRIPT }} />
        <div id="boot-shield" aria-hidden="true" />

        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-full focus:bg-sakura-600 focus:px-5 focus:py-3 focus:font-display focus:font-bold focus:text-white"
        >
          Skip to content
        </a>

        <AudioProvider>
          <BootProvider>
            <Header />
            <div id="content" className="flex-1">
              {children}
            </div>
            <Footer />
          </BootProvider>
        </AudioProvider>
      </body>
    </html>
  );
}
