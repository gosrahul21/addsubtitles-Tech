"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { ArrowRight, Zap, Captions, Loader2, Copy, Check, Download, FileText } from "lucide-react";
import { fetchYoutubeTranscript } from "./actions";
import BadgeReel from "@/components/BadgeReel";

export default function YoutubeTranscriptGeneratorPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<{ text: string; offset: number; duration: number }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'text' | 'time' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setTranscript(null);
    setCopied(null);

    try {
      const res = await fetchYoutubeTranscript(url);
      if (res.success && res.data) {
        setTranscript(res.data);
      } else {
        setError(res.error || "Failed to fetch transcript");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeSrt = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    const ss = String(date.getUTCSeconds()).padStart(2, '0');
    const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
    return `${hh}:${mm}:${ss},${ms}`;
  };

  const generateText = (withTime: boolean) => {
    if (!transcript) return "";
    return transcript
      .map((t) => (withTime ? `[${formatTime(t.offset)}] ${t.text}` : t.text))
      .join(withTime ? "\n" : " ");
  };

  const generateSrt = () => {
    if (!transcript) return "";
    return transcript
      .map((t, i) => {
        const start = formatTimeSrt(t.offset);
        const end = formatTimeSrt(t.offset + t.duration);
        return `${i + 1}\n${start} --> ${end}\n${t.text}\n`;
      })
      .join("\n");
  };

  const handleCopy = async (withTime: boolean) => {
    if (!transcript) return;
    const text = generateText(withTime);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(withTime ? "time" : "text");
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy text", err);
    }
  };

  const handleDownload = (format: 'txt' | 'srt') => {
    if (!transcript) return;
    const content = format === 'srt' ? generateSrt() : generateText(false);
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    if (hh > 0) {
      return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`;
    }
    return `${mm}:${ss}`;
  };

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
            href="/editor"
            className="subplus-button px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 bg-amber-500 text-black hover:bg-amber-400 transition"
          >
            Try Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero / Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-16 md:py-24">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
            <Zap className="w-3.5 h-3.5" /> Free Tool · No Account Required
          </div>
        </div>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-6xl font-black font-heading mb-6 leading-[1.1]">
            YouTube Transcript Generator
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed mb-8">
            Enter any YouTube video URL to instantly generate and read its transcript. No software required, 100% free.
          </p>
        </div>

        {/* Tool Area */}
        <div className="max-w-3xl mx-auto bg-[#0d142d]/50 border border-[#1e2a4a] rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 mb-8">
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 bg-[#070b19] border border-[#1e2a4a] rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition"
              required
            />
            <button
              type="submit"
              disabled={loading || !url}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-black font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Captions className="w-5 h-5" />}
              {loading ? "Generating..." : "Generate"}
            </button>
          </form>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-8 text-sm">
              {error}
            </div>
          )}

          {transcript && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-white">Transcript</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleCopy(false)}
                    className="flex items-center gap-2 text-xs font-semibold bg-[#1e2a4a]/50 hover:bg-[#1e2a4a] text-white px-3 py-1.5 rounded-lg transition"
                  >
                    {copied === 'text' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === 'text' ? "Copied" : "Copy Text"}
                  </button>
                  <button
                    onClick={() => handleCopy(true)}
                    className="flex items-center gap-2 text-xs font-semibold bg-[#1e2a4a]/50 hover:bg-[#1e2a4a] text-white px-3 py-1.5 rounded-lg transition"
                  >
                    {copied === 'time' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === 'time' ? "Copied" : "Copy with Timestamp"}
                  </button>
                  <button
                    onClick={() => handleDownload('txt')}
                    className="flex items-center gap-2 text-xs font-semibold bg-[#1e2a4a]/50 hover:bg-[#1e2a4a] text-white px-3 py-1.5 rounded-lg transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    TXT
                  </button>
                  <button
                    onClick={() => handleDownload('srt')}
                    className="flex items-center gap-2 text-xs font-semibold bg-[#1e2a4a]/50 hover:bg-[#1e2a4a] text-white px-3 py-1.5 rounded-lg transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    SRT
                  </button>
                </div>
              </div>
              <div className="bg-[#070b19] border border-[#1e2a4a] rounded-xl p-4 md:p-6 max-h-[500px] overflow-y-auto space-y-4">
                {transcript.map((item, index) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="text-xs text-amber-500/80 font-mono pt-0.5 w-12 shrink-0">
                      {formatTime(item.offset)}
                    </div>
                    <div className="text-zinc-300 text-sm leading-relaxed group-hover:text-white transition">
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e2a4a]/30 py-6 px-4 flex flex-col items-center gap-4 text-center">
        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} AddSubtitles ·{" "}
          <Link href="/about" className="hover:text-amber-400 transition-colors">Home</Link>
          {" · "}
          <Link href="/tools" className="hover:text-amber-400 transition-colors">Tools</Link>
          {" · "}
          <Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing</Link>
        </p>
        <BadgeReel />
      </footer>
    </div>
  );
}
