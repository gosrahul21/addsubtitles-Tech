import { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { ArrowRight, Zap, CheckCircle2, FileVideo, Captions, Sparkles } from "lucide-react";

const FORMAT_FEATURES = [
  "AI transcription with word-level timestamps",
  "Animated subtitle styles (Pop, Karaoke, Wave & more)",
  "Burn subtitles into video or download as SRT",
  "50+ language support",
  "No watermark, no account required",
  "100% browser-based — nothing to install",
];

const OTHER_FORMATS = [
  { slug: "mp4-subtitle-generator", label: "MP4" },
  { slug: "mkv-subtitle-generator", label: "MKV" },
  { slug: "mov-subtitle-generator", label: "MOV" },
  { slug: "avi-subtitle-generator", label: "AVI" },
  { slug: "webm-subtitle-generator", label: "WebM" },
];

const TOOL_META: Record<string, { title: string; desc: string; h1: string; body: string; format?: string }> = {
  "mp4-subtitle-generator": {
    title: "Free MP4 Subtitle Generator – Add Captions to MP4 Online | AddSubtitles",
    desc: "Generate accurate subtitles for MP4 videos instantly using AI. Upload your MP4, get word-level captions in seconds. No software, no watermark, 100% free.",
    h1: "Free MP4 Subtitle Generator",
    body: "Upload any MP4 file and get AI-generated subtitles with word-level timestamps in seconds. Customize styles, animate captions, and export your MP4 with burned-in subtitles — all free in your browser.",
    format: "MP4",
  },
  "mkv-subtitle-generator": {
    title: "Free MKV Subtitle Generator – Add Captions to MKV Files Online | AddSubtitles",
    desc: "Automatically generate subtitles for MKV files online. Download as SRT or burn captions directly into your video. AI-powered, free, no app download required.",
    h1: "Free MKV Subtitle Generator",
    body: "Upload your MKV file and let our AI transcribe it with word-level accuracy. Edit, style, and animate your captions, then export with subtitles burned in or download an SRT file — completely free.",
    format: "MKV",
  },
  "mov-subtitle-generator": {
    title: "Free MOV Subtitle Generator – Add Captions to QuickTime MOV | AddSubtitles",
    desc: "Add subtitles to MOV files online for free. AI-powered transcription for QuickTime MOV videos. No software needed — works directly in your browser.",
    h1: "Free MOV Subtitle Generator",
    body: "Upload your QuickTime MOV file and get AI-generated subtitles in seconds. Perfect for iPhone recordings and Mac screen recordings. Customize styles and export with captions burned in — all in your browser.",
    format: "MOV",
  },
  "avi-subtitle-generator": {
    title: "Free AVI Subtitle Generator – Auto Captions for AVI Videos | AddSubtitles",
    desc: "Generate subtitles for AVI videos online for free. AI transcription with word-level timestamps. No software to install, works in any browser.",
    h1: "Free AVI Subtitle Generator",
    body: "Upload your AVI video and let our AI automatically transcribe and generate subtitles with word-level precision. Style your captions, add animations, and export — 100% free, no watermark.",
    format: "AVI",
  },
  "webm-subtitle-generator": {
    title: "Free WebM Subtitle Generator – Add Captions to WebM Videos | AddSubtitles",
    desc: "Add AI-generated subtitles to WebM videos online. Word-level timestamps, animated captions, and free export. No software needed.",
    h1: "Free WebM Subtitle Generator",
    body: "Upload your WebM video and get accurate AI-generated subtitles in seconds. Ideal for web-optimized videos, screen recordings, and browser-based content. Customize and export for free.",
    format: "WebM",
  },
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

  const isFormatTool = !!meta.format;
  const editorHref = slug === 'remove-silences-online' ? '/?subtitles=false&removeSilences=true' : '/';
  const otherFormats = OTHER_FORMATS.filter((f) => f.slug !== slug);

  return (
    <div className="min-h-screen bg-[#070b19] text-white flex flex-col">
      {/* Nav */}
      <nav className="border-b border-[#1e2a4a]/40 bg-[#0d142d]/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <Link href="/about">
          <Logo size="md" />
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/tools" className="text-zinc-400 hover:text-white text-sm transition-colors hidden md:inline">
            All Tools
          </Link>
          <Link
            href="/"
            className="subplus-button px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5"
          >
            Try Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
            <Zap className="w-3.5 h-3.5" /> Free Tool · No Account Required
          </div>
        </div>

        {/* H1 + body */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-black font-heading mb-6 leading-[1.1]">
            {meta.h1}
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">{meta.body}</p>
          <Link
            href={editorHref}
            className="inline-flex subplus-button px-10 py-4 rounded-xl text-base font-black items-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.2)]"
          >
            <Zap className="w-5 h-5" />
            {isFormatTool ? `Generate ${meta.format} Subtitles Free` : "Open Free Editor"}
          </Link>
          <p className="text-xs text-zinc-600 mt-4">No sign-up · No credit card · Works in your browser</p>
        </div>

        {/* Format-specific: features + other formats */}
        {isFormatTool && (
          <>
            {/* Features grid */}
            <div className="grid md:grid-cols-2 gap-10 mb-16 p-8 rounded-2xl border border-[#1e2a4a] bg-[#0d142d]/50">
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <Captions className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-black">What You Get</h2>
                </div>
                <ul className="space-y-3">
                  {FORMAT_FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <FileVideo className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-black">How It Works</h2>
                </div>
                <ol className="space-y-4">
                  {[
                    { step: "1", text: `Upload your ${meta.format} video — drag & drop or click to browse` },
                    { step: "2", text: "Our AI transcribes your audio with word-level accuracy in seconds" },
                    { step: "3", text: "Style your subtitles, pick animations, and customise colours & fonts" },
                    { step: "4", text: "Export your video with subtitles burned in — or download SRT" },
                  ].map((s) => (
                    <li key={s.step} className="flex gap-3 text-sm text-zinc-300">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center shrink-0">{s.step}</span>
                      {s.text}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Other format links */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-zinc-500 text-xs mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Also works with other formats
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {otherFormats.map((f) => (
                  <Link
                    key={f.slug}
                    href={`/tools/${f.slug}`}
                    className="px-4 py-2 rounded-lg border border-[#1e2a4a] bg-[#0d142d]/60 text-sm text-zinc-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
                  >
                    {f.label} Subtitle Generator
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2a4a]/30 py-6 px-4 text-center">
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} AddSubtitles ·{" "}
          <Link href="/about" className="hover:text-amber-400 transition-colors">Home</Link>
          {" · "}
          <Link href="/tools" className="hover:text-amber-400 transition-colors">Tools</Link>
          {" · "}
          <Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing</Link>
        </p>
      </footer>
    </div>
  );
}
