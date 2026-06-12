import { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { ArrowRight, Zap } from "lucide-react";

const TOOL_META: Record<string, { title: string; desc: string; h1: string; body: string }> = {
  "tiktok-subtitle-generator": {
    title: "Free TikTok Subtitle Generator – Auto Captions for TikTok | AddSubtitles",
    desc: "Generate TikTok subtitles automatically in seconds. Word-by-word animated captions, silence removal, and viral text styles. No app download needed.",
    h1: "Free TikTok Subtitle Generator",
    body: "Automatically generate subtitles for your TikTok videos with word-by-word animations, silence removal, and viral caption styles — all in your browser.",
  },
  "remove-silences-online": {
    title: "Remove Silences from Video Online Free – Dead Air Cutter | AddSubtitles",
    desc: "Automatically detect and remove silent gaps from your video online. No software needed. Works in your browser using AI audio analysis.",
    h1: "Remove Silences from Video Online",
    body: "Our AI analyses your video's waveform and automatically cuts every silent gap and dead air moment — saving you hours of manual timeline scrubbing.",
  },
  "add-emojis-to-video": {
    title: "Add Emojis to Video Online Free – Auto Emoji Overlay | AddSubtitles",
    desc: "Automatically add context-aware emojis to your videos online. No editing experience needed. Perfect for TikTok, Reels, and YouTube Shorts.",
    h1: "Add Emojis to Video Online",
    body: "Let AI read your script and place context-aware emojis directly above or below your subtitles. Stand out on TikTok, Reels, and Shorts instantly.",
  },
  "capcut-alternative": {
    title: "Best CapCut Alternative for Subtitles & AI Editing | AddSubtitles",
    desc: "Looking for a CapCut alternative? AddSubtitles offers word-by-word animations, silence removal, and AI captions in your browser — no app needed.",
    h1: "The Best CapCut Alternative for Creators",
    body: "Get all the viral caption power of CapCut without the app download. AddSubtitles runs in your browser with advanced animations, silence removal, and AI hooks.",
  },
  "translate-subtitles-spanish": {
    title: "Translate Subtitles to Spanish Online Free | AddSubtitles",
    desc: "Automatically translate your video subtitles to Spanish in one click. Reach millions of new viewers without re-recording. Free and browser-based.",
    h1: "Translate Subtitles to Spanish Online",
    body: "Instantly translate your auto-generated subtitles into Spanish (and 50+ other languages) with a single click. Original timing is preserved — only the text changes.",
  },
  "youtube-shorts-editor": {
    title: "Free YouTube Shorts Editor Online – AI Captions & Cuts | AddSubtitles",
    desc: "Edit YouTube Shorts in your browser. Auto subtitles, silence removal, 9:16 export, and viral word animations — no software to install.",
    h1: "Free YouTube Shorts Editor Online",
    body: "Edit, caption, and export YouTube Shorts directly in your browser. Switch to the 9:16 preset, add animated captions, remove dead air, and export in seconds.",
  },
  "auto-subtitle-generator": {
    title: "Free Auto Subtitle Generator – AI Captions in Seconds | AddSubtitles",
    desc: "Generate accurate subtitles automatically for any video. AI-powered transcription with word-level timestamps. Free, browser-based, no watermark.",
    h1: "Free Auto Subtitle Generator",
    body: "Upload your video and get AI-generated subtitles with word-level timestamps in seconds. Customise styles, animate captions, and export — all free.",
  },
  "video-caption-maker": {
    title: "Free Video Caption Maker – Animated Captions Online | AddSubtitles",
    desc: "Create animated video captions online for free. Word-by-word animations, custom fonts, colors, and backgrounds. Perfect for social media.",
    h1: "Free Video Caption Maker",
    body: "Make your captions impossible to ignore. Choose from Pop, Stomp, Wave, Karaoke, and 6 more animations. Customise every detail and export in one click.",
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const meta = TOOL_META[slug];
  if (!meta) return { title: "Free AI Video Tool | AddSubtitles" };
  return {
    title: meta.title,
    description: meta.desc,
  };
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = TOOL_META[slug] ?? {
    h1: "Free AI Video Tool",
    body: "This tool is part of the AddSubtitles free toolset for creators.",
  };

  // For the silence removal tool, we skip subtitle generation and auto-enable silence removal
  const editorHref = slug === 'remove-silences-online' ? '/?subtitles=false&removeSilences=true' : '/';

  return (
    <div className="min-h-screen bg-[#070b19] text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[#1e2a4a]/40 bg-[#0d142d]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <Logo size="md" />
        </Link>
        <Link
          href="/"
          className="subplus-button px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5"
        >
          Try Free <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1 rounded-full mb-6">
          <Zap className="w-3.5 h-3.5" /> Free Tool · No Account Required
        </div>
        <h1 className="text-4xl md:text-5xl font-black font-heading mb-6">{meta.h1}</h1>
        <p className="text-zinc-400 text-lg leading-relaxed mb-10">{meta.body}</p>
        <Link
          href={editorHref}
          className="subplus-button px-10 py-4 rounded-xl text-base font-black flex items-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
        >
          <Zap className="w-5 h-5" />
          Open Free Editor
        </Link>
        <p className="text-xs text-zinc-600 mt-4">No sign-up · No credit card · Works in your browser</p>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2a4a]/30 py-6 px-4 text-center">
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} AddSubtitles ·{" "}
          <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
          {" · "}
          <Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing</Link>
        </p>
      </footer>
    </div>
  );
}
