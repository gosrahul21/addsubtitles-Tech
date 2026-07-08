import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { VolumeX, Search, Accessibility, Clock, Share2, ArrowRight, Video, Scissors, Type, Globe, CalendarClock, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'The Silent-View Secret: Why Captioned Shorts Win the Feed | addsubtitles.tech',
  description: 'Learn why 70-85% of short-form video is watched silently and how automating captions can skyrocket your retention and views.',
};

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-[#0b1329] text-white selection:bg-amber-500/30">
      
      {/* Navigation / Header simple */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0b1329]/80 backdrop-blur-md border-b border-white/10 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="font-heading text-2xl font-bold tracking-tighter text-white flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-amber-400">Add</span>Subtitles
          </Link>
          <Link href="/" className="text-sm font-medium text-white/70 hover:text-white transition-colors flex items-center gap-2">
            Back to Home
          </Link>
        </div>
      </header>

      <main className="pt-32 pb-24 overflow-hidden">
        
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto px-6 mb-16 relative">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-40 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 space-y-8 ">
            <div className="flex items-center gap-3 text-sm font-medium">
              <span className="px-3 py-1 rounded-full bg-white/10 text-amber-400 border border-white/10 shadow-sm backdrop-blur-sm">
                Content Strategy
              </span>
              <span className="text-white/50 flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> 5 min read
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold leading-[1.1] tracking-tight">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600">Silent-View</span> Secret:<br />
              Why Captioned Shorts Win the Feed
            </h1>
            
            <p className="text-xl md:text-2xl text-white/70 font-sans leading-relaxed max-w-3xl">
              Most creators think growth comes down to better content. But there&apos;s a quieter variable that decides whether your video even gets watched past the first second — <span className="text-white font-semibold border-b-2 border-amber-500/50 pb-0.5">sound.</span>
            </p>

            <div className="flex items-center gap-4 pt-6 border-t border-white/10 mt-8">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg">
                AS
              </div>
              <div>
                <p className="font-bold text-white tracking-wide">AddSubtitles Team</p>
                <p className="text-sm text-white/50">Growth Strategies</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <article className="prose prose-invert prose-lg md:prose-xl max-w-none font-sans text-white/80 leading-relaxed space-y-8">
            
            <p className="text-xl leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
              Somewhere between <strong className="text-white font-bold">70–85% of short-form video is watched with the sound off</strong>, whether that&apos;s someone scrolling in a waiting room, on a commute, or half-listening to a meeting. If your hook lives in the audio and not on the screen, you&apos;re losing the majority of your audience before they ever hear your pitch. 
            </p>
            
            <p className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
              The creators quietly stacking hundreds of thousands of views a month aren&apos;t just posting more — they&apos;re making sure every single clip works in silence. That means captions, and it means captions that are fast, accurate, and automated at scale.
            </p>

            <div className="p-8 md:p-10 rounded-3xl bg-white/[0.03] border border-white/10 my-12 relative overflow-hidden group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <p className="text-xl md:text-2xl font-medium text-white italic relative z-10 leading-relaxed">
                "This is the playbook for building a faceless shorts machine where captioning isn&apos;t an afterthought bolted on at the end — it&apos;s baked into the pipeline from day one, and where <span className="text-amber-400 font-bold not-italic px-1">addsubtitles.tech</span> does the heavy lifting so you never touch a caption editor by hand."
              </p>
            </div>

            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mt-20 mb-8 flex items-center gap-4">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <VolumeX className="w-6 h-6" />
              </span>
              Why captions are the real unlock
            </h2>

            <p>
              Volume-based content strategies live and die on retention. If you&apos;re posting 10–50 clips a day sourced from proven hooks, every clip needs to hold attention on its own — no context, no prior video, no sound required. 
            </p>
            
            <p className="mb-8">A few things happen the moment you add clean, well-timed captions:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12 not-prose">
              {[
                {
                  icon: <VolumeX className="w-6 h-6 text-blue-400" />,
                  title: "Silent viewers stay.",
                  desc: "They can follow the story without turning their volume on, crucial for public autoplay feeds."
                },
                {
                  icon: <Search className="w-6 h-6 text-green-400" />,
                  title: "The algorithm reads them.",
                  desc: "Captions give ranking systems more text signal for better topic-matching and discovery."
                },
                {
                  icon: <Accessibility className="w-6 h-6 text-purple-400" />,
                  title: "Accessibility widens reach.",
                  desc: "Deaf/hard-of-hearing viewers and non-native speakers all convert better with text on screen."
                },
                {
                  icon: <Clock className="w-6 h-6 text-amber-400" />,
                  title: "Watch time goes up.",
                  desc: "Viewers re-read, pause, and spend longer per view — a metric every platform rewards."
                }
              ].map((item, idx) => (
                <div key={idx} className="p-6 md:p-8 rounded-3xl bg-[#131b31] border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  <div className="mb-5 bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            <p>
              If you&apos;re running the "scrape a viral hook, stitch on a CTA, post everywhere" strategy, captions are the difference between a clip that gets skipped in half a second and one that gets watched to the end.
            </p>

            <div className="relative my-20 p-8 md:p-10 rounded-3xl bg-red-950/20 border border-red-500/20">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-red-500 rounded-r-full" />
              <div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">The problem: captioning doesn&apos;t scale by hand</h2>
                <p className="text-red-100/70 text-lg">
                  Manually typing out captions, syncing them frame-by-frame, and styling them to match your brand is fine for one video. It falls apart completely once you&apos;re producing dozens of clips a day. This is exactly where most automated content pipelines quietly break down — the scrape-and-schedule part is easy to automate, but captioning gets left as a manual bottleneck, or worse, skipped entirely.
                </p>
                <p className="mt-6 font-medium text-white text-lg">
                  That&apos;s the gap <span className="text-amber-400">addsubtitles.tech</span> is built to close.
                </p>
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mt-20 mb-12 text-center">
              How to build a captioned faceless shorts pipeline
            </h2>

            <div className="space-y-4 md:space-y-6 not-prose">
              {[
                {
                  step: "Step 1",
                  icon: <Video className="w-6 h-6 text-indigo-400" />,
                  title: "Source proven hooks.",
                  desc: "Don't invent hooks from scratch. Find channels in your niche that already post shorts that consistently perform, and use the opening seconds — the part that's already proven to stop the scroll — as your raw material."
                },
                {
                  step: "Step 2",
                  icon: <Scissors className="w-6 h-6 text-pink-400" />,
                  title: "Stitch your CTA.",
                  desc: "Trim the hook, attach your own call-to-action for your app, product, or offer at the end, and batch this across your whole download in one pass rather than one clip at a time."
                },
                {
                  step: "Step 3",
                  icon: <Type className="w-6 h-6 text-amber-400" />,
                  title: "Auto-caption everything.",
                  desc: "Run every stitched clip through addsubtitles.tech before it goes anywhere near a scheduler. Point it at a folder or feed it through the API, and get back accurate, word-level-timed captions — styled, burned in or as a soft subtitle track, and ready for vertical video — without opening an editor."
                },
                {
                  step: "Step 4",
                  icon: <Globe className="w-6 h-6 text-green-400" />,
                  title: "Localize if you're going wide.",
                  desc: "If you're targeting more than one language market, generate translated caption tracks in the same pass. A clip captioned in English, Spanish, and Portuguese from a single source file multiplies your addressable audience without multiplying your workload."
                },
                {
                  step: "Step 5",
                  icon: <CalendarClock className="w-6 h-6 text-blue-400" />,
                  title: "Schedule the batch.",
                  desc: "Push the fully captioned batch into your scheduler of choice and let it drip out across platforms on autopilot. The captioning step should be invisible — something that happens automatically between stitching and scheduling, not a separate manual task you have to remember."
                }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-5 md:gap-8 group p-6 rounded-3xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-[#131b31] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#1a2542] group-hover:border-white/20 transition-all duration-300 group-hover:scale-110 shadow-lg">
                      {item.icon}
                    </div>
                    {idx !== 4 && <div className="w-0.5 h-full bg-gradient-to-b from-white/10 to-transparent mt-4 group-hover:from-white/20 transition-colors" />}
                  </div>
                  <div className="pb-8 pt-2">
                    <div className="text-xs font-bold uppercase tracking-widest text-amber-400/80 mb-2">{item.step}</div>
                    <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-white/70 leading-relaxed text-base md:text-lg">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mt-20 mb-8 flex items-center gap-4">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Zap className="w-6 h-6" />
              </span>
              Automate it end-to-end
            </h2>

            <p>
              The real leverage isn&apos;t captioning one video well — it&apos;s captioning zero videos manually, ever, because the pipeline does it for you. <strong className="text-white">addsubtitles.tech</strong> is built to slot into exactly this kind of automated workflow:
            </p>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 my-10 list-none pl-0 not-prose">
              {[
                { title: "Bulk and API-first", desc: "Feed in a batch of stitched clips and get back captioned versions programmatically." },
                { title: "Fast turnaround", desc: "Built for volume — caption dozens of short clips a day, not one video a month." },
                { title: "Style controls", desc: "Match your captions to your brand — font, color, position, and animation." },
                { title: "Multi-language output", desc: "Generate translated tracks, serving several markets at once from one clip." }
              ].map((feature, i) => (
                <li key={i} className="flex flex-col gap-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-amber-500 shrink-0" />
                    <strong className="text-white text-lg">{feature.title}</strong>
                  </div>
                  <span className="text-white/60 text-sm leading-relaxed">{feature.desc}</span>
                </li>
              ))}
            </ul>

            <p>
              If you&apos;re already driving your content pipeline with an AI agent — telling it to scrape a channel, stitch a batch, and schedule the drop — captioning is the missing link that keeps that automation honest. A clip that isn&apos;t captioned is a clip that underperforms the moment someone scrolls past it with the sound off.
            </p>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-16" />

            <h2 className="text-3xl font-heading font-bold text-white mb-8">
              The takeaway
            </h2>

            <p>
              Posting volume gets you views. Proven hooks get you attention. But captions are what keep the majority of your silent, scrolling audience actually watching — and they&apos;re the one step in most automated content pipelines that&apos;s still being done by hand, or not at all.
            </p>

            <p>
              Build the loop: scrape proven hooks, stitch your CTA, auto-caption with <strong className="text-amber-400">addsubtitles.tech</strong>, schedule everywhere. Once captioning is automated alongside everything else, there&apos;s nothing left standing between your content machine and a truly hands-off, silent-view-proof posting schedule.
            </p>

            {/* Final CTA Card */}
            <div className="mt-20 p-10 md:p-14 rounded-[2.5rem] bg-gradient-to-br from-[#131b31] to-[#0b1329] border border-white/10 relative overflow-hidden not-prose text-center shadow-2xl">
              {/* Decorative elements */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="relative z-10">
                <h3 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6 tracking-tight">
                  Ready to stop typing<br className="hidden md:block" /> captions by hand?
                </h3>
                <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                  Try addsubtitles.tech and plug automated, accurate subtitles into your content pipeline today.
                </p>
                
                <Link href="/" className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 text-[#332b10] font-black text-xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_80px_rgba(212,175,55,0.5)]">
                  Try AddSubtitles Free <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </div>

          </article>
        </div>
      </main>
      
    </div>
  );
}
