import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Script from "next/script";
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&amp;family=Oswald:wght@400;700&amp;family=Roboto:wght@400;700;900&amp;family=Bebas+Neue&amp;family=Lilita+One&amp;family=Bangers&amp;family=Anton&amp;display=swap" rel="stylesheet" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Script id="crisp-widget" strategy="afterInteractive">
          {`
            window.$crisp=[];
            window.CRISP_WEBSITE_ID="af36db37-5866-48e8-8831-d104b0d87abb";
            (function(){
              d=document;s=d.createElement("script");
              s.src="https://client.crisp.chat/l.js";
              s.async=1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();
          `}
        </Script>
      </body>

    </html>
  );
}
