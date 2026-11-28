import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { BRAND } from "@/lib/brand";
import { clientEnv } from "@/lib/env/client";
import { Toaster } from "@/components/ui/sonner";
import TrackHomePage from "@/components/tracker";
import { ConfirmDialog } from "@/components/confirm-dialog";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f6" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_APP_URL),
  title: {
    default: `${BRAND.name} | ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  appleWebApp: { capable: true, title: BRAND.name, statusBarStyle: "default" },
  keywords: [
    "Guidance",
    "Counseling",
    "University",
    "Student Support",
    "Mental Health",
    "Workshops",
    "Announcements",
  ],
  verification: {
    google: "YW8hRYwXwmkr7hv5hBSVypGhAUlXzyz4hUmphqjMf-A",
  },
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
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body
        className={`${instrumentSans.variable} bg-background min-h-dvh font-sans text-[15px] antialiased`}
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
