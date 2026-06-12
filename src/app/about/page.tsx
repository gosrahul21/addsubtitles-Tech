"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import {
  ChevronDown,
  Scissors,
  Zap,
  Sparkles,
  Languages,
  Smile,
  Type,
  Wand2,
  Play,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Star,
  Menu,
  X,
  Waves,
  FileVideo,
  Globe,
  ArrowRight,
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_FEATURES = [
  { icon: Scissors, label: "Remove Silences", desc: "Auto-cut dead air from your timeline" },
  { icon: Type, label: "Karaoke Captions", desc: "Word-by-word animated subtitles" },
  { icon: Smile, label: "Auto Emojis", desc: "Context-aware emoji overlays" },
  { icon: Wand2, label: "AI Hook Generator", desc: "Generate viral spoken hooks with AI" },
  { icon: Languages, label: "Subtitle Translation", desc: "Translate to 50+ languages instantly" },
];

const NAV_TOOLS = [
  { label: "TikTok Subtitle Generator", href: "/tools/tiktok-subtitle-generator" },
  { label: "Remove Silences Online", href: "/tools/remove-silences-online" },
  { label: "Add Emojis to Video", href: "/tools/add-emojis-to-video" },
  { label: "CapCut Alternative", href: "/tools/capcut-alternative" },
  { label: "Translate Subtitles to Spanish", href: "/tools/translate-subtitles-spanish" },
  { label: "YouTube Shorts Editor", href: "/tools/youtube-shorts-editor" },
];

const PAIN_POINTS = [
  {
    emoji: "✂️",
    title: "Manual Silence Cutting",
    desc: "Scrubbing frame-by-frame to find dead air — then doing it 47 more times for every pause in your podcast.",
  },
  {
    emoji: "😐",
    title: "Boring Static Text",
    desc: "Plain white subtitles that nobody notices. Your message deserves captions that jump off the screen.",
  },
  {
    emoji: "⏰",
    title: "Wasting Hours Re-exporting",
    desc: "Tweaking a font, re-exporting, uploading, checking — repeat. There has to be a better way.",
  },
];

const FEATURES_A = [
  {
    icon: Scissors,
    title: "Remove Silences & Dead Air",
    desc: "AI analyses your audio waveform and instantly flags every awkward pause. One toggle — all dead air gone. Your video is already 30% shorter.",
    badge: "Saves Hours",
  },
  {
    icon: Waves,
    title: "Filter Filler Words",
    desc: "Automatically strike through every &quot;um,&quot; &quot;uh,&quot; and &quot;like&quot; in your transcript. Keep them visually tagged so viewers never hear the hesitation.",
    badge: "Instant Polish",
  },
];

const FEATURES_B_ANIMS = ["Pop", "Stomp", "Wave", "Karaoke", "Flip", "Slide"];

const FEATURES_C = [
  {
    icon: Smile,
    title: "Auto Emojis",
    desc: "Our AI reads your script and drops context-aware emojis above or below your text — no manual placement needed.",
  },
  {
    icon: Wand2,
    title: "AI Hook Generator",
    desc: "Paste your transcript and get 5 attention-grabbing spoken hooks engineered to maximise viewer retention in the first 3 seconds.",
  },
  {
    icon: Languages,
    title: "One-Click Translation",
    desc: "Auto-translate your subtitles into Spanish, French, Hindi, and 50+ languages to 10× your audience without re-recording.",
  },
];

const COMPARISON = [
  { feature: "Remove Silences (Auto)", us: true, capcut: false, veed: true, descript: true, submagic: false },
  { feature: "Word-by-Word Animation", us: true, capcut: true, veed: false, descript: false, submagic: true },
  { feature: "Filter Filler Words (um/uh)", us: true, capcut: false, veed: false, descript: true, submagic: false },
  { feature: "Auto Emojis", us: true, capcut: false, veed: false, descript: false, submagic: true },
  { feature: "Saveable Style Presets", us: true, capcut: true, veed: true, descript: true, submagic: false },
  { feature: "AI Hook Generator", us: true, capcut: false, veed: false, descript: false, submagic: false },
  { feature: "Export Without Watermark (Free)", us: true, capcut: false, veed: false, descript: false, submagic: false },
  { feature: "100% Browser-Based", us: true, capcut: false, veed: true, descript: false, submagic: true },
  { feature: "Subtitle Translation (50+ langs)", us: true, capcut: true, veed: true, descript: false, submagic: true },
];

const FAQS = [
  {
    q: "How do I automatically remove silences from a video?",
    a: "AddSubtitles uses the Web Audio API to scan your video's waveform directly in your browser. It detects any gap below a -35 dB threshold for more than 400 ms and marks it as a silence. Toggle 'Remove Silences' in the Magic panel and those sections are skipped in both the live preview and the final export — no backend or upload required.",
  },
  {
    q: "Can I save my own custom subtitle fonts and brand colors?",
    a: "Yes. After styling your captions (font, color, outline, shadow, animation), hit 'Save Style Preset' under the Styles tab. Your preset is tied to your account and available on every future project, making brand-consistent captions effortless.",
  },
  {
    q: "What is the best AI video editor for YouTube Shorts?",
    a: "AddSubtitles is purpose-built for short-form content. It auto-generates captions, removes dead air, adds word-by-word animations, and exports in 9:16 for YouTube Shorts — all in the browser with no software to install.",
  },
  {
    q: "Is AddSubtitles free to use?",
    a: "The core editor — subtitles, silence removal, animations, and export — is completely free with no credit card required. Pro features like saveable presets, priority processing, and no watermark are available on the paid plan.",
  },
  {
    q: "Does it work for TikTok and Instagram Reels?",
    a: "Absolutely. Select the 9:16 (TikTok) canvas preset and your video is framed perfectly for TikTok, Instagram Reels, and YouTube Shorts. The subtitle positioning system ensures text never overlaps your face.",
  },
  {
    q: "Can I translate subtitles automatically?",
    a: "Yes. After your captions are generated, open the Magic panel, pick your target language (Spanish, French, German, Hindi, and 50+ more), and hit Translate. The original subtitle timing is preserved — only the text changes.",
  },
];

const SEO_LINKS = [
  { label: "TikTok Subtitle Generator", href: "/tools/tiktok-subtitle-generator" },
  { label: "Remove Silences Online", href: "/tools/remove-silences-online" },
  { label: "Add Emojis to Video", href: "/tools/add-emojis-to-video" },
  { label: "CapCut Alternative", href: "/tools/capcut-alternative" },
  { label: "Translate Subtitles to Spanish", href: "/tools/translate-subtitles-spanish" },
  { label: "YouTube Shorts Editor", href: "/tools/youtube-shorts-editor" },
  { label: "Auto Subtitle Generator", href: "/tools/auto-subtitle-generator" },
  { label: "Video Caption Maker", href: "/tools/video-caption-maker" },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

function CheckMark({ val }: { val: boolean | string }) {
  if (typeof val === 'string') {
    return <span className="text-zinc-300 text-sm font-medium">{val}</span>;
  }
  return val
    ? <span className="text-emerald-400 text-lg font-bold">✓</span>
    : <span className="text-zinc-600 text-lg font-bold">✕</span>;
}

function AnimatedSubtitlePreview() {
  const [activeAnim, setActiveAnim] = useState(0);
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAnim(prev => (prev + 1) % FEATURES_B_ANIMS.length);
      setKey(k => k + 1);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const anim = FEATURES_B_ANIMS[activeAnim];

  const getAnimStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = { display: "inline-block" };
    switch (anim) {
      case "Pop":    return { ...base, animation: "anim-pop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards" };
      case "Stomp":  return { ...base, animation: "anim-stomp 0.4s cubic-bezier(0.175,0.885,0.32,1.275) forwards" };
      case "Wave":   return { ...base, animation: "anim-wave 0.5s ease-in-out forwards" };
      case "Flip":   return { ...base, animation: "anim-flip 0.5s ease-out forwards" };
      case "Slide":  return { ...base, animation: "anim-slide 0.4s ease-out forwards" };
      case "Karaoke": return base;
      default:       return base;
    }
  };

  const words = ["Stand", "out", "from", "the", "crowd"];

  return (
    <div className="relative flex flex-col items-center justify-center bg-[#0a0f1e] rounded-2xl border border-[#1e2a4a] overflow-hidden h-52 w-full max-w-sm mx-auto shadow-2xl">
      {/* Fake video bg */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f1a35] via-[#070b19] to-[#0f1a35] opacity-60" />
      <div className="absolute bottom-8 left-0 right-0 flex justify-center">
        <div key={key} className="px-2 flex gap-2 flex-wrap justify-center">
          {words.map((w, i) => (
            <span
              key={`${key}-${i}`}
              style={{ ...getAnimStyle(), animationDelay: `${i * 60}ms`, opacity: 0 }}
              className={`text-xl font-black uppercase tracking-wide ${
                anim === "Karaoke" && i === 2
                  ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                  : "text-white"
              }`}
            >
              {w}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute top-3 right-3 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
        {anim}
      </div>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      itemScope
      itemProp="mainEntity"
      itemType="https://schema.org/Question"
      className={`border rounded-xl overflow-hidden transition-all ${open ? "border-amber-500/40 bg-amber-500/5" : "border-[#1e2a4a] bg-[#0d142d]/60"}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left gap-4"
        aria-expanded={open}
      >
        <span itemProp="name" className="font-semibold text-white text-sm md:text-base leading-snug">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-amber-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          itemScope
          itemProp="acceptedAnswer"
          itemType="https://schema.org/Answer"
          className="px-6 pb-5"
        >
          <p itemProp="text" className="text-zinc-400 text-sm leading-relaxed">
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────

export default function LandingPage() {
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handler = () => { setFeaturesOpen(false); setToolsOpen(false); };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return (
    <div className="min-h-screen bg-[#070b19] text-white overflow-x-hidden">

      {/* ── 1. NAVIGATION ─────────────────────────────────────────────── */}
      <nav
        className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-300 w-[95%] max-w-6xl rounded-full ${
          scrolled 
            ? "top-4 bg-[#0d142d]/80 backdrop-blur-xl border border-[#1e2a4a] shadow-2xl" 
            : "top-6 bg-[#070b19]/20 backdrop-blur-sm border border-transparent"
        }`}
      >
        <div className="px-4 md:px-6 h-14 md:h-16 flex items-center justify-between">

          {/* Left: Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo size="md" />
          </Link>

          {/* Center: Nav Links (desktop) */}
          <div className="hidden md:flex items-center gap-1">

            {/* Features Dropdown */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                id="nav-features-btn"
                onClick={() => { setFeaturesOpen(!featuresOpen); setToolsOpen(false); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
              >
                Features
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${featuresOpen ? "rotate-180" : ""}`} />
              </button>
              {featuresOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 glass-card rounded-xl shadow-2xl shadow-black/60 py-2 z-50">
                  {NAV_FEATURES.map(f => (
                    <Link
                      key={f.label}
                      href="/"
                      className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors group"
                      onClick={() => setFeaturesOpen(false)}
                    >
                      <div className="mt-0.5 p-1.5 rounded-md bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                        <f.icon className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{f.label}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{f.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Tools Dropdown */}
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                id="nav-tools-btn"
                onClick={() => { setToolsOpen(!toolsOpen); setFeaturesOpen(false); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
              >
                Tools
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${toolsOpen ? "rotate-180" : ""}`} />
              </button>
              {toolsOpen && (
                <div className="absolute top-full left-0 mt-2 w-60 glass-card rounded-xl shadow-2xl shadow-black/60 py-2 z-50">
                  {NAV_TOOLS.map(t => (
                    <Link
                      key={t.label}
                      href={t.href}
                      className="block px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                      onClick={() => setToolsOpen(false)}
                    >
                      {t.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/pricing" className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all">
              Pricing
            </Link>
            <a href="#" className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all">
              Affiliate
            </a>
          </div>

          {/* Right: CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
              Login
            </Link>
            <Link
              id="nav-cta-btn"
              href="/"
              className="subplus-button px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 animate-pulse-glow"
            >
              Start for Free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            id="mobile-menu-btn"
            className="md:hidden p-2 text-zinc-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 mt-3 bg-[#0d142d]/95 backdrop-blur-xl border border-[#1e2a4a]/50 rounded-2xl px-4 py-4 flex flex-col gap-3 shadow-2xl">
            {NAV_FEATURES.map(f => (
              <Link key={f.label} href="/" className="flex items-center gap-2 text-sm text-zinc-300 py-1 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                <f.icon className="w-4 h-4 text-amber-400" /> {f.label}
              </Link>
            ))}
            <div className="border-t border-[#1e2a4a]/50 pt-3 mt-1">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="subplus-button w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                Start for Free – No Credit Card
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── 2. HERO ───────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 overflow-hidden"
      >
        {/* Layered backgrounds */}
        <div className="absolute inset-0 landing-grid opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070b19]/30 via-[#070b19]/80 to-[#070b19]" />
        
        {/* Animated Premium Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none animate-orb" />
        <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none animate-orb" style={{ animationDelay: '-5s' }} />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] rounded-full bg-indigo-500/5 blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center gap-7">

          {/* Pre-headline trust pill */}
          <div className="animate-fade-up flex items-center gap-2 bg-[#0d142d] border border-white/10 rounded-full px-5 py-2 text-xs font-semibold text-zinc-300 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" style={{ boxShadow: '0 0 10px rgba(251,191,36,0.8)' }} />
            Trusted by 1,000+ daily creators — no credit card needed
          </div>

          {/* H1 */}
          <h1
            className="animate-fade-up text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-heading leading-[1.02] tracking-tighter drop-shadow-2xl"
            style={{ animationDelay: "80ms" }}
          >
            <span className="text-gradient-premium">Add Viral Subtitles &</span>{" "}
            <br className="hidden md:block" />
            <span className="animate-gradient-x bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Edit Videos
            </span>{" "}
            <span className="text-gradient-premium">in Seconds.</span>
          </h1>

          {/* H2 */}
          <p
            className="animate-fade-up text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed"
            style={{ animationDelay: "160ms" }}
          >
            Add subtitles automatically <strong className="text-white font-bold">without watermarks</strong>. Fast, accurate, and packed with a massive collection of styles and AI-powered features. The ultimate web-based editor for{" "}
            <span className="text-white font-semibold">TikTok</span>,{" "}
            <span className="text-white font-semibold">Shorts</span>, and{" "}
            <span className="text-white font-semibold">Reels</span>.
          </p>

          {/* CTAs */}
          <div
            className="animate-fade-up flex flex-col sm:flex-row items-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              id="hero-cta-primary"
              href="/"
              className="subplus-button px-8 py-4 rounded-xl text-base font-black flex items-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.25)] hover:shadow-[0_0_50px_rgba(212,175,55,0.4)] transition-all"
            >
              <Zap className="w-4 h-4" />
              Try it Free – No Credit Card
            </Link>
            {/* <a
              id="hero-cta-demo"
              href="#demo"
              className="flex items-center gap-2 px-6 py-4 rounded-xl border border-[#1e2a4a] bg-white/5 hover:bg-white/10 text-sm font-semibold text-zinc-300 hover:text-white transition-all"
            >
              <Play className="w-4 h-4 text-amber-400" />
              Watch Demo
            </a> */}
          </div>

          {/* Avatar trust row */}
          <div className="animate-fade-up flex items-center gap-3" style={{ animationDelay: "320ms" }}>
            {/* <div className="flex -space-x-2">
              {["#f59e0b", "#6366f1", "#ec4899", "#10b981", "#3b82f6"].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-[#070b19] flex items-center justify-center text-[11px] font-bold text-[#070b19]"
                  style={{ background: c }}
                >
                  {["A", "B", "C", "D", "E"][i]}
                </div>
              ))}
            </div> */}
            <div className="text-xs text-zinc-400">
              <div className="flex text-amber-400">
                {/* {Array(5).fill(0).map((_, i) => <Star key={i} className="w-3 h-3 fill-amber-400" />)} */}
              </div>
              {/* <span>"Saves me 2 hours every video"</span> */}
            </div>
          </div>

          {/* Product mockup */}
          <div
            className="animate-fade-up animate-float w-full max-w-4xl mt-8 rounded-2xl overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8),0_20px_40px_rgba(0,0,0,0.4)]"
            style={{ animationDelay: "400ms" }}
            id="demo"
          >
            {/* Fake browser chrome */}
            <div className="bg-[#0d142d] border-b border-[#1e2a4a] px-4 py-2.5 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4 bg-[#070b19] rounded-md px-3 py-1 text-[10px] text-zinc-500 font-mono">
                addsubtitles.com/editor
              </div>
            </div>
            {/* Fake editor UI */}
            <div className="bg-[#070b19] h-56 md:h-80 flex items-center justify-center relative">
              <div className="absolute inset-0 landing-grid opacity-40" />
              {/* Fake canvas */}
              <div className="relative z-10 w-32 h-56 md:w-44 md:h-72 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] rounded-xl border border-[#1e2a4a] shadow-2xl flex flex-col items-center justify-end pb-8 overflow-hidden">
                <div className="absolute top-4 left-4 right-4 h-4 bg-zinc-700/30 rounded" />
                <div className="absolute top-10 left-4 right-4 h-3 bg-zinc-700/20 rounded" />
                <div className="text-center px-2">
                  <div className="text-white font-black text-xs uppercase tracking-wider drop-shadow-lg">
                    Stand Out
                  </div>
                  <div className="text-amber-400 font-black text-xs uppercase tracking-wider">
                    From The Crowd
                    <span className="animate-blink-cursor ml-0.5">|</span>
                  </div>
                </div>
              </div>
              {/* Sidebar pill hints */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                {["Styles", "Magic", "Animate"].map(l => (
                  <div key={l} className="bg-[#0d142d] border border-[#1e2a4a] rounded-lg px-2 py-1.5 text-[9px] text-zinc-400 font-semibold">
                    {l}
                  </div>
                ))}
              </div>
              {/* Timeline strip */}
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#090d1f] border-t border-[#1e2a4a]/40 flex items-center px-3 gap-1.5 overflow-hidden">
                {[20, 35, 15, 25, 30, 20, 18].map((w, i) => (
                  <div
                    key={i}
                    className={`h-5 rounded flex-shrink-0 ${i === 2 ? "bg-blue-600 border border-blue-400" : "bg-[#1e293b] border border-[#1e2a4a]"}`}
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ───────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-y border-[#1e2a4a]/40 bg-[#0d142d]/40 py-3">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...Array(2)].map((_, di) => (
            <span key={di} className="flex items-center">
              {["Remove Silences", "Auto Subtitles", "AI Hooks", "Word Animations", "Filler Word Filter", "Auto Emojis", "Translate Subtitles", "Saveable Presets", "Export in 9:16", "No Credit Card"].map((item, i) => (
                <span key={i} className="flex items-center text-xs font-semibold text-zinc-500 mx-6">
                  <span className="text-amber-500 mr-2">✦</span>
                  {item}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── 3. AGITATION ─────────────────────────────────────────────── */}
      <section className="py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black font-heading mb-4">
            Stop manually chopping{" "}
            <span className="text-amber-400">your timeline.</span>
          </h2>
          <p className="text-zinc-400 text-base md:text-lg max-w-xl mx-auto">
            Every creator knows the pain. Traditional workflows are broken.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAIN_POINTS.map(p => (
            <div
              key={p.title}
              className="glass-card hover-lift rounded-2xl p-7 flex flex-col gap-4"
            >
              <span className="text-4xl">{p.emoji}</span>
              <h3 className="text-lg font-bold text-white">{p.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4A. EDITORIAL ENGINE ─────────────────────────────────────── */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#070b19] via-[#0a0f22] to-[#070b19]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold px-3 py-1 rounded-full mb-4">
              <Scissors className="w-3.5 h-3.5" /> The Editorial Engine
            </div>
            <h2 className="text-3xl md:text-4xl font-black font-heading">
              AI-powered editing,{" "}
              <span className="text-amber-400">zero timeline scrubbing.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="flex flex-col gap-6">
              {FEATURES_A.map(f => (
                <div key={f.title} className="glass-card hover-lift rounded-2xl p-6 flex gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 shrink-0 self-start">
                    <f.icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white">{f.title}</h3>
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                        {f.badge}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual: timeline with striped silence zones */}
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Timeline Preview</div>
              <div className="bg-[#090d1f] rounded-xl p-3 flex flex-col gap-2">
                {/* Track label + bar */}
                {["V1", "T1"].map((track, ti) => (
                  <div key={track} className="flex items-center gap-2">
                    <div className="text-[9px] text-zinc-600 w-5 font-bold">{track}</div>
                    <div className="flex-1 h-7 bg-[#070b19] rounded-md relative overflow-hidden border border-[#1e2a4a]/30">
                      <div className={`absolute inset-y-1 left-0 right-0 mx-1 rounded ${ti === 0 ? "bg-[#064e3b]/70 border border-[#10b981]/30" : "bg-[#0f172a] border border-[#1e293b]"} flex items-center`}>
                        {ti === 0 && (
                          <>
                            {/* Silence cut zones */}
                            {[{l: "18%", w: "8%"}, {l: "42%", w: "6%"}, {l: "71%", w: "9%"}].map((z, zi) => (
                              <div
                                key={zi}
                                className="absolute inset-y-0"
                                style={{
                                  left: z.l, width: z.w,
                                  background: "repeating-linear-gradient(45deg,rgba(0,0,0,0.7) 0px,rgba(0,0,0,0.7) 3px,rgba(80,80,80,0.3) 3px,rgba(80,80,80,0.3) 6px)",
                                  borderLeft: "1px solid rgba(255,255,255,0.15)",
                                  borderRight: "1px solid rgba(255,255,255,0.15)",
                                }}
                              />
                            ))}
                            <span className="text-[8px] text-emerald-400 font-bold px-2">Main Video</span>
                          </>
                        )}
                        {ti === 1 && (
                          <div className="flex gap-1 px-1">
                            {[{w: "30%", l: "0%"}, {w: "20%", l: "35%"}, {w: "25%", l: "60%"}].map((s, si) => (
                              <div key={si} className="absolute inset-y-0.5 rounded bg-blue-900/60 border border-blue-500/40" style={{left: s.l, width: s.w}} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <div className="w-3 h-3 rounded-sm"
                  style={{ background: "repeating-linear-gradient(45deg,rgba(0,0,0,0.7) 0,rgba(0,0,0,0.7) 3px,rgba(80,80,80,0.5) 3px,rgba(80,80,80,0.5) 6px)" }}
                />
                Silence zones detected and removed
              </div>
              <Link
                href="/"
                className="subplus-button w-full py-3 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 mt-2"
              >
                Try it now – free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4B. VIRAL TYPOGRAPHY ─────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full w-fit">
                <Type className="w-3.5 h-3.5" /> Viral Typography
              </div>
              <h2 className="text-3xl md:text-4xl font-black font-heading">
                CapCut-level animations.{" "}
                <span className="text-amber-400">Browser simplicity.</span>
              </h2>
              <p className="text-zinc-400 leading-relaxed">
                Choose from Stomp, Wave, Flip, Karaoke, Pop, and more — each one engineered to maximise dwell time and thumb-stopping power. Style presets lock in your brand so every video looks identical without lifting a finger.
              </p>
              <div className="flex flex-wrap gap-2">
                {FEATURES_B_ANIMS.map(a => (
                  <span key={a} className="px-3 py-1.5 rounded-full bg-[#0d142d] border border-[#1e2a4a] text-xs font-semibold text-zinc-300">
                    {a}
                  </span>
                ))}
              </div>
              <Link href="/" className="subplus-button w-fit px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2">
                Pick your animation <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex flex-col gap-4 items-center">
              <AnimatedSubtitlePreview />
              <p className="text-xs text-zinc-600 text-center">Live preview — animation cycles automatically</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4C. MAGIC TOUCHES ────────────────────────────────────────── */}
      <section className="py-24 px-4 bg-gradient-to-b from-[#070b19] via-[#0a0f22] to-[#070b19]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full mb-4">
              <Sparkles className="w-3.5 h-3.5" /> The Magic Touches
            </div>
            <h2 className="text-3xl md:text-4xl font-black font-heading">
              Features that make viewers{" "}
              <span className="text-amber-400">stop scrolling.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES_C.map(f => (
              <div key={f.title} className="glass-card hover-lift rounded-2xl p-7 flex flex-col gap-4 group">
                <div className="p-3 w-fit rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/20 group-hover:from-amber-500/30 transition-all">
                  <f.icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white">{f.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. COMPARISON TABLE ──────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black font-heading mb-3">
              Why creators choose{" "}
              <span className="text-amber-400">AddSubtitles</span>
            </h2>
            <p className="text-zinc-400">
              See how we stack up against traditional video editors and basic transcribers.
            </p>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden relative">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2a4a]">
                  <th className="text-left px-6 py-5 text-zinc-400 font-semibold">Feature</th>
                  <th className="px-4 py-5 text-center bg-amber-500/10 border-x border-amber-500/20 relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-amber-400 font-black text-base">AddSubtitles</span>
                      <span className="text-[10px] text-amber-500/70 font-semibold">✦ Free</span>
                    </div>
                  </th>
                  <th className="px-4 py-5 text-center text-zinc-500 font-semibold text-xs">CapCut</th>
                  <th className="px-4 py-5 text-center text-zinc-500 font-semibold text-xs">Veed</th>
                  <th className="px-4 py-5 text-center text-zinc-500 font-semibold text-xs">Descript</th>
                  <th className="px-4 py-5 text-center text-zinc-500 font-semibold text-xs">Submagic</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-[#1e2a4a]/40 ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}
                  >
                    <td className="px-6 py-4 text-zinc-300 font-medium whitespace-nowrap">{row.feature}</td>
                    <td className="px-4 py-4 text-center bg-amber-500/5 border-x border-amber-500/10"><CheckMark val={row.us} /></td>
                    <td className="px-4 py-4 text-center"><CheckMark val={(row as any).capcut} /></td>
                    <td className="px-4 py-4 text-center"><CheckMark val={(row as any).veed} /></td>
                    <td className="px-4 py-4 text-center"><CheckMark val={(row as any).descript} /></td>
                    <td className="px-4 py-4 text-center"><CheckMark val={(row as any).submagic} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/"
              className="subplus-button inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-base shadow-[0_0_30px_rgba(212,175,55,0.2)]"
            >
              <Zap className="w-5 h-5" />
              Get Started Free — No Account Needed
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. FAQ ───────────────────────────────────────────────────── */}
      <section
        className="py-24 px-4 bg-gradient-to-b from-[#070b19] via-[#0a0f22] to-[#070b19]"
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black font-heading mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-zinc-400">Everything you need to know about AddSubtitles.</p>
          </div>
          <div className="flex flex-col gap-3">
            {FAQS.map(f => <FAQItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BAND ───────────────────────────────────────────── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-amber-500/5 blur-[150px] pointer-events-none animate-orb" />
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black font-heading leading-[1.1] tracking-tight">
            Your next video is{" "}
            <br />
            <span className="animate-gradient-x bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent drop-shadow-2xl">
              already 30% shorter.
            </span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-lg">
            Join 1,000+ creators who cut their editing time in half. No credit card. No software. Just results.
          </p>
          <Link
            id="final-cta-btn"
            href="/"
            className="subplus-button px-12 py-5 rounded-xl text-lg font-black flex items-center gap-2 shadow-[0_0_50px_rgba(212,175,55,0.3)] hover:scale-105 transition-all"
          >
            <Zap className="w-5 h-5" />
            Start Editing Free Now
          </Link>
          <p className="text-sm text-zinc-500 font-medium">No sign-up required · Works in your browser · Export in seconds</p>
        </div>
      </section>

      {/* ── 7. FOOTER ────────────────────────────────────────────────── */}
      <footer className="border-t border-[#1e2a4a]/40 bg-[#070b19]">
        {/* SEO link net */}
        <div className="border-b border-[#1e2a4a]/30 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-4">
              Free AI Video Tools
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {SEO_LINKS.map(l => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-sm text-zinc-500 hover:text-amber-400 transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Main footer */}
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Logo size="md" />
            <p className="text-xs text-zinc-500 leading-relaxed">
              The fastest browser-based AI subtitle editor for short-form creators.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Twitter" className="text-zinc-600 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="text-zinc-600 hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Product</h4>
            {["Features", "Pricing", "Changelog", "Roadmap"].map(l => (
              <Link key={l} href={l === "Pricing" ? "/pricing" : "#"} className="text-sm text-zinc-500 hover:text-white transition-colors">{l}</Link>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Company</h4>
            {["About", "Blog", "Affiliate Program", "Contact"].map(l => (
              <a key={l} href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">{l}</a>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Legal</h4>
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(l => (
              <a key={l} href="#" className="text-sm text-zinc-500 hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>

        <div className="border-t border-[#1e2a4a]/30 py-5 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} AddSubtitles. All rights reserved.
            </p>
            <p className="text-xs text-zinc-700">
              Built for TikTok · YouTube Shorts · Instagram Reels creators
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
