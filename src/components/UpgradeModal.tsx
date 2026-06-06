"use client";

import React, { useState } from 'react';
import { Check, X, Sparkles, Zap, Crown, X as CloseIcon } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const pricingTiers = [
  {
    name: "FREE",
    icon: <Zap className="w-5 h-5 text-slate-400" />,
    price: "$0",
    period: "forever",
    description: "Perfect for getting started.",
    features: [
      "Watermarked exports",
      "Auto subtitles up to 1m",
    ],
    notIncluded: [
      "No Watermark",
      "4K Export",
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline",
  },
  {
    name: "PRO",
    icon: <Sparkles className="w-5 h-5 text-amber-600" />,
    price: "$19",
    period: "per month",
    description: "For content creators.",
    features: [
      "No Watermark",
      "1080p & 4K Export",
      "Premium animations",
    ],
    notIncluded: [
      "API Access",
    ],
    buttonText: "Upgrade to Pro",
    buttonVariant: "gradient",
    popular: true,
  },
  {
    name: "ENTERPRISE",
    icon: <Crown className="w-5 h-5 text-purple-400" />,
    price: "$99",
    period: "per month",
    description: "For teams and agencies.",
    features: [
      "Priority Rendering Queue",
      "API Access",
      "Unlimited Subtitles",
    ],
    notIncluded: [],
    buttonText: "Contact Sales",
    buttonVariant: "outline",
  }
];

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async (tierName: string) => {
    if (tierName === 'FREE' || tierName === 'ENTERPRISE') {
      if (tierName === 'ENTERPRISE') {
         alert("Please email sales@addsubtitles.tech to setup an enterprise plan.");
      }
      return;
    }
    
    setLoadingTier(tierName);
    try {
      const response = await axios.post(`${API_BASE_URL}/payments/checkout-session`, {
        tier: tierName
      }, {
        withCredentials: true 
      });
      
      if (response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to start checkout. Ensure you are logged in.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-[#0b1329] border border-[#1e2a4a] rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">
        
        {/* Background Decorative Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-[#1e2a4a]/50">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-white">
            Upgrade your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">experience</span>
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-[#16223f] rounded-lg transition-colors">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-[#1e2a4a]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {pricingTiers.map((tier) => (
              <div 
                key={tier.name}
                className={`relative rounded-2xl p-6 flex flex-col transition-all duration-300 border ${
                  tier.popular 
                    ? 'bg-white/5 border-amber-500/50 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-[#332b10] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${tier.popular ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                    {tier.icon}
                  </div>
                  <h3 className="text-xl font-bold font-heading tracking-wide text-white">{tier.name}</h3>
                </div>
                
                <div className="mb-2">
                  <span className="text-4xl font-extrabold tracking-tight text-white">{tier.price}</span>
                  <span className="text-slate-400 text-sm ml-1">/{tier.period}</span>
                </div>
                
                <p className="text-slate-400 text-sm mb-6 flex-grow leading-relaxed">
                  {tier.description}
                </p>

                <button 
                  onClick={() => handleSubscribe(tier.name)}
                  disabled={loadingTier === tier.name || tier.name === 'FREE'}
                  className={`w-full py-3 rounded-lg font-bold text-sm md:text-base transition-all duration-200 flex justify-center items-center group relative overflow-hidden ${
                    tier.buttonVariant === 'gradient'
                      ? 'subplus-button shadow-[0_0_15px_rgba(212,175,55,0.2)] text-[#332b10]'
                      : 'bg-transparent border border-white/20 text-white hover:bg-white/10'
                  } ${tier.name === 'FREE' ? 'opacity-50 cursor-default hover:bg-transparent' : ''}`}
                >
                  {loadingTier === tier.name ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    tier.buttonText
                  )}
                </button>

                <div className="mt-6 space-y-3">
                  <ul className="space-y-2">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-200 text-sm">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                    {tier.notIncluded.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                        <X className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
