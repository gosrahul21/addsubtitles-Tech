import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "AddSubtitles - Auto AI Subtitle Generator & Video Editor",
  description: "Automatically add subtitles, captions, remove silences, filter filler words, and apply viral word-by-word animations. The fastest browser-based AI video editor for creators.",
  applicationName: "AddSubtitles",
  openGraph: {
    title: "AddSubtitles - Auto AI Subtitle Generator & Video Editor",
    description: "Automatically add subtitles, captions, remove silences, filter filler words, and apply viral word-by-word animations.",
    url: "https://www.addsubtitles.tech",
    siteName: "AddSubtitles",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AddSubtitles - Auto AI Subtitle Generator",
    description: "Automatically add subtitles, captions, remove silences, filter filler words, and apply viral word-by-word animations.",
  },
  appleWebApp: {
    title: "AddSubtitles",
    statusBarStyle: "black-translucent",
  }
};


import AuthProvider from "@/providers/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
