
const ProductMockup = ()=>{
    return (
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
    )
}

export default ProductMockup