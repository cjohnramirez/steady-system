import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { BRAND } from "@/lib/brand";
import { clientEnv } from "@/lib/env/client";
import { Toaster } from "@/components/ui/sonner";
import TrackHomePage from "@/components/tracker";
import { ConfirmDialog } from "@/components/confirm-dialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#141210" },
  ],
};

export const metadata: Metadata = {
  // From the environment, so moving to a new domain needs no code change.
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_APP_URL),
  title: {
    default: `${BRAND.name} | ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  // Home-screen app on iPhone and iPad, which is what enables notifications there.
  appleWebApp: { capable: true, title: BRAND.name, statusBarStyle: "default" },
  keywords: [
    "Guidance",
    "Counseling",
    "University",
    "Student Support",
    "Workshops",
    "Announcements",
  ],
  verification: {
    google: "YW8hRYwXwmkr7hv5hBSVypGhAUlXzyz4hUmphqjMf-A",
  },
  // The card image comes from opengraph-image.tsx.
  openGraph: {
    title: `${BRAND.name} | ${BRAND.tagline}`,
    description: BRAND.description,
    url: clientEnv.NEXT_PUBLIC_APP_URL,
    siteName: BRAND.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} | ${BRAND.tagline}`,
    description: BRAND.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // next-themes adds the theme class before hydration; without this React warns
    // that the server-rendered <html> attributes differ.
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background min-h-dvh font-sans text-sm antialiased`}
      >
        <Providers>
          {children}
          <Toaster position="bottom-right" closeButton />
          <ConfirmDialog />
          <TrackHomePage />
        </Providers>
      </body>
    </html>
  );
}
