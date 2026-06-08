"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Loader2, PartyPopper } from 'lucide-react';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Automatically redirect back to the editor after 5 seconds
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0b1329] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 bg-[#16223f]/50 border border-[#253966] p-8 md:p-12 rounded-3xl max-w-lg w-full text-center shadow-2xl backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">
        
        <div className="flex justify-center mb-6 relative">
          <div className="absolute inset-0 bg-amber-400 blur-xl opacity-20 rounded-full animate-pulse" />
          <CheckCircle2 className="w-24 h-24 text-amber-400 relative z-10 drop-shadow-lg" />
          <PartyPopper className="w-10 h-10 text-amber-500 absolute -right-2 top-0 animate-bounce" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold font-heading mb-4 tracking-tight">
          Payment <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Successful!</span>
        </h1>
        
        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
          Thank you for upgrading your subscription. Your account has been instantly updated with your new features.
        </p>

        <div className="bg-[#0d142d] border border-[#1e2a4a] rounded-xl p-4 mb-8 flex items-center justify-center gap-3 shadow-inner">
          <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">
            Redirecting to editor in <strong className="text-white text-base mx-1">{countdown}</strong> seconds...
          </p>
        </div>

        <Link 
          href="/"
          className="subplus-button w-full py-4 rounded-xl font-bold text-lg text-[#332b10] flex justify-center items-center shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          Return to Editor Now
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
