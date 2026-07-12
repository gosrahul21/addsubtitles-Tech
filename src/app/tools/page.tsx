import { AppConfig } from "@/config/appConfig";
import { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import {
  ArrowRight,
  Zap,
  Scissors,
  Mic2,
  Smile,
  Languages,
  Wand2,
  Play,
  Type,
  Captions,
  Sparkles,
} from "lucide-react";
import BadgeReel from "@/components/BadgeReel";

export const metadata: Metadata = {
  title: "Free AI Video Tools – Subtitles, Silence Removal & More | AddSubtitles",
  description:
    "Browse all free AI-powered video tools from AddSubtitles. Auto-generate captions, remove silences, add emojis, translate subtitles, and more — all in your browser.",
};

const TOOLS = [
  {
    slug: "auto-subtitle-generator",
    icon: Captions,
    label: "Auto Subtitle Generator",
    badge: "Most Popular",
    badgeColor: "amber",
    short: "AI-powered transcription with word-level timestamps in seconds.",
    tags: ["AI", "Free", "No Watermark"],
  },
  {
    slug: "mp4-subtitle-generator",
    icon: Play,
    label: "MP4 Subtitle Generator",
    badge: "MP4",
    badgeColor: "blue",
    short: "Generate accurate subtitles for MP4 videos instantly using AI.",
    tags: ["MP4", "AI", "Free"],
  },
  {
    slug: "mkv-subtitle-generator",
    icon: Captions,
    label: "MKV Subtitle Generator",
    badge: "MKV",
    badgeColor: "violet",
    short: "Auto-generate subtitles for MKV files and download as SRT or burn-in.",
    tags: ["MKV", "SRT", "Free"],
  },
  {
    slug: "mov-subtitle-generator",
    icon: Captions,
    label: "MOV Subtitle Generator",
    badge: "MOV",
    badgeColor: "emerald",
    short: "Add subtitles to QuickTime MOV files right in your browser.",
    tags: ["MOV", "AI", "Browser"],
  },
  {
    slug: "avi-subtitle-generator",
    icon: Captions,
    label: "AVI Subtitle Generator",
    badge: "AVI",
    badgeColor: "red",
    short: "Generate subtitles for AVI videos for free. No software needed.",
    tags: ["AVI", "Free", "Online"],
  },
  {
    slug: "webm-subtitle-generator",
    icon: Captions,
    label: "WebM Subtitle Generator",
    badge: "WebM",
    badgeColor: "indigo",
    short: "Add AI-generated captions to WebM video files in seconds.",
    tags: ["WebM", "AI", "Free"],
  },
  {
    slug: "tiktok-subtitle-generator",
    icon: Play,
    label: "TikTok Subtitle Generator",
    badge: "Viral",
    badgeColor: "pink",
    short: "Word-by-word animated captions built for TikTok virality.",
    tags: ["TikTok", "Animated", "Free"],
  },
  {
    slug: "youtube-shorts-editor",
    icon: Scissors,
    label: "YouTube Shorts Editor",
    badge: "9:16",
    badgeColor: "red",
    short: "Edit, caption, and export YouTube Shorts directly in your browser.",
    tags: ["Shorts", "AI Cuts", "Export"],
  },
  {
    slug: "remove-silences-online",
    icon: Mic2,
    label: "Remove Silences Online",
    badge: "AI",
    badgeColor: "violet",
    short: "Automatically cut every dead-air gap. Make your video 30% shorter.",
    tags: ["AI Audio", "Auto-Cut", "Free"],
  },
  {
    slug: "add-emojis-to-video",
    icon: Smile,
    label: "Add Emojis to Video",
    badge: "Fun",
    badgeColor: "yellow",
    short: "Context-aware auto-emoji overlay for TikTok, Reels & Shorts.",
    tags: ["Emojis", "AI", "Social"],
  },
  {
    slug: "translate-subtitles-spanish",
    icon: Languages,
    label: "Translate Subtitles to Spanish",
    badge: "50+ Langs",
    badgeColor: "emerald",
    short: "One-click subtitle translation into Spanish and 50+ languages.",
    tags: ["Translation", "AI", "Global"],
  },
  {
    slug: "video-caption-maker",
    icon: Type,
    label: "Video Caption Maker",
    badge: "Animated",
    badgeColor: "blue",
    short: "Pop, Stomp, Wave, Karaoke & more — animated captions that stop thumbs.",
    tags: ["Animations", "Custom", "Free"],
  },
  {
    slug: "youtube-transcript-generator",
    icon: Captions,
    label: "YouTube Transcript Generator",
    badge: "New",
    badgeColor: "amber",
    short: "Generate and extract transcripts from any YouTube video instantly.",
    tags: ["YouTube", "Transcript", "Free"],
  },
  {
    slug: "capcut-alternative",
    icon: Wand2,
    label: "CapCut Alternative",
    badge: "Browser",
    badgeColor: "indigo",
    short: "All of CapCut's caption power — no app download, no watermark.",
    tags: ["Alternative", "No App", "Free"],
  },
];

const BADGE_STYLES: Record<string, string> = {
  amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  pink: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
  violet: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  emerald: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  indigo: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
};

const ICON_STYLES: Record<string, string> = {
  amber: "text-amber-400 bg-amber-500/10",
  pink: "text-pink-400 bg-pink-500/10",
  red: "text-red-400 bg-red-500/10",
  violet: "text-violet-400 bg-violet-500/10",
  yellow: "text-yellow-400 bg-yellow-500/10",
  emerald: "text-emerald-400 bg-emerald-500/10",
  blue: "text-blue-400 bg-blue-500/10",
  indigo: "text-indigo-400 bg-indigo-500/10",
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#070b19] text-white">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-[#1e2a4a]/40 bg-[#070b19]/90 backdrop-blur-xl px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/about">
            <Logo size="md" />
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link href="/tools" className="text-amber-400 font-semibold">Tools</Link>
            <Link href="/about" className="text-zinc-400 hover:text-white transition-colors">Home</Link>
            <Link href="/pricing" className="text-zinc-400 hover:text-white transition-colors">Pricing</Link>
          </div>
          <Link
            href={AppConfig.EDITOR_URL}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-900 px-5 py-2 rounded-lg text-sm font-black hover:from-amber-300 hover:to-yellow-400 transition-all shadow-[0_0_20px_rgba(251,191,36,0.25)]"
          >
            <Zap className="w-3.5 h-3.5" />
            Open Editor
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            13 Free AI Video Tools
          </div>
          <h1 className="text-4xl md:text-6xl font-black font-heading mb-5 leading-[1.1]">
            Every Tool You Need to{" "}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              Go Viral
            </span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
            AI-powered subtitle, silence removal, and video editing tools — all free, all browser-based, zero watermark.
          </p>
        </div>
      </section>

      {/* ── Tools Grid ── */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-12 p-6 rounded-2xl border border-[#1e2a4a] bg-[#0d142d]/50">
          {[
            { value: "13", label: "Free Tools" },
            { value: "50+", label: "Languages Supported" },
            { value: "100%", label: "Browser-Based" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-black text-amber-400">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const iconStyle = ICON_STYLES[tool.badgeColor];
            const badgeStyle = BADGE_STYLES[tool.badgeColor];
            return (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group relative flex flex-col p-5 rounded-2xl border border-[#1e2a4a] bg-[#0d142d]/60 hover:border-[#2a3a6a] hover:bg-[#0d142d] transition-all duration-200 hover:shadow-[0_8px_40px_rgba(251,191,36,0.06)]"
              >
                {/* Badge */}
                <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full border mb-4 ${badgeStyle}`}>
                  {tool.badge}
                </span>

                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconStyle}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {/* Text */}
                <h2 className="text-sm font-bold text-white mb-2 leading-snug group-hover:text-amber-400 transition-colors">
                  {tool.label}
                </h2>
                <p className="text-xs text-zinc-500 leading-relaxed flex-1">{tool.short}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {tool.tags.map((t) => (
                    <span key={t} className="text-[10px] text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 p-10 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-4 py-1.5 rounded-full mb-5">
            <Zap className="w-3.5 h-3.5" />
            All tools in one editor
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-3">
            Try Everything for Free
          </h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            All 13 tools are baked into a single editor. Upload once, use everything — subtitles, silence removal, emoji overlay, translation, and more.
          </p>
          <Link
            href={AppConfig.EDITOR_URL}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-zinc-900 px-8 py-4 rounded-xl font-black text-base hover:from-amber-300 hover:to-yellow-400 transition-all shadow-[0_0_30px_rgba(251,191,36,0.2)]"
          >
            <Zap className="w-5 h-5" />
            Open Free Editor
          </Link>
          <p className="text-xs text-zinc-600 mt-4">No sign-up · No credit card · No watermark</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1e2a4a]/30 py-8 px-4">
        <BadgeReel />
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <div className="flex items-center gap-1.5">
            <Logo size="sm" />
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Link href="/about" className="hover:text-amber-400 transition-colors">Home</Link>
            <Link href="/tools" className="text-amber-400">Tools</Link>
            <Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing</Link>
            <Link href={AppConfig.EDITOR_URL} className="hover:text-amber-400 transition-colors">Editor</Link>
          </div>
          <div className="flex flex-col items-center gap-2">
            <p>© {new Date().getFullYear()} AddSubtitles. All rights reserved.</p>
          </div>
        </div>


      </footer>
    </div>
  );
}
