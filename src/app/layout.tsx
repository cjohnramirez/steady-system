import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
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
  title: "GCS System | University Guidance & Counseling",
  description:
    "Official Guidance and Counseling Services platform for students, providing announcements, workshops, and Counseling sessions.",
  keywords: [
    "Guidance",
    "Counseling",
    "University",
    "Student Support",
    "Workshops",
    "Announcements",
  ],
  authors: [{ name: "University GCS Unit" }],
  creator: "University GCS Unit",
  publisher: "University GCS Unit",
  verification: {
    google: "YW8hRYwXwmkr7hv5hBSVypGhAUlXzyz4hUmphqjMf-A",
  },
  openGraph: {
    title: "GCS System | University Guidance & Counseling",
    description:
      "Stay updated with announcements, events, and Counseling programs from the Guidance and Counseling Services Unit.",
    url: "https://gcs-system.vercel.app/",
    siteName: "GCS System",
    images: [
      {
        url: "/home-page.png",
        width: 1918,
        height: 1198,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GCS System | University Guidance & Counseling",
    description:
      "Official platform for announcements, events, and Counseling sessions.",
    images: "/home-page.png",
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
