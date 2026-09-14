import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { BRAND } from "@/lib/brand";
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
  themeColor: "#fafafa",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://gcs-system.vercel.app/"),
  title: {
    default: `${BRAND.name} | ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
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
    url: "https://gcs-system.vercel.app/",
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
    <html lang="en" data-scroll-behavior="smooth">
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
