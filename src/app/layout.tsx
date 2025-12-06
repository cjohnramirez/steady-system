import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { Toaster } from "sonner";
import TrackHomePage from "@/components/tracker";
import ConfirmModal from "@/components/confirm-modal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GCS System | University Guidance & Counseling",
  description: "Official Guidance and Counseling Services platform for students, providing announcements, workshops, and counseling sessions.",
  keywords: ["Guidance", "Counseling", "University", "Student Support", "Workshops", "Announcements"],
  authors: [{ name: "Guidance and Counselling Services" }],
  creator: "Guidance and Counselling Services",
  publisher: "Guidance and Counselling Services",
  openGraph: {
    title: "GCS System | University Guidance & Counseling",
    description: "Stay updated with announcements, events, and counseling programs from the Guidance and Counseling Services Unit.",
    url: "https://gcs-system.vercel.app/",
    siteName: "GCS System",
        images: [
          {
            url: "https://gcs-system.vercel.app/home-page.png",
            width: 1918,
            height: 1198,
          },
        ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GCS System | University Guidance & Counseling",
    description: "Official platform for announcements, events, and counseling sessions.",
    images: ["/home-page.png"],
  }
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} w-full font-sans text-sm antialiased h-full bg-gray-50 `}
      >
        <Providers>{children}</Providers>
        <Toaster position="top-left" className="font-normal" />
        <ConfirmModal />
        <TrackHomePage />
      </body>
    </html>
  );
}
