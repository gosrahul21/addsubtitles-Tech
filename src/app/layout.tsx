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
  title: "AddSubtitles – AI Subtitle Generator & Video Editor for TikTok, Shorts & Reels",
  description: "Automatically add subtitles, remove silences, filter filler words, and apply viral word-by-word animations. The fastest browser-based AI video editor for creators. No credit card required.",
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
