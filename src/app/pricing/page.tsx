"use client";

import React, { useState, useEffect } from 'react';
import { Check, X, Sparkles, Zap, Crown } from 'lucide-react';
import axios from 'axios';

// Mock endpoint or use the real one if env is set
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const uiConfig: Record<string, any> = {
  FREE: {
    icon: <Zap className="w-6 h-6 text-slate-400" />,
    period: "forever",
    description: "Perfect for getting started and trying out the tools.",
    buttonText: "Current Plan",
    buttonVariant: "outline",
    popular: false,
  },
  PRO: {
    icon: <Sparkles className="w-6 h-6 text-amber-600" />,
    period: "per month",
    description: "For content creators who need professional quality.",
    buttonText: "Upgrade to Pro",
    buttonVariant: "gradient",
    popular: true,
  },
  ENTERPRISE: {
    icon: <Crown className="w-6 h-6 text-purple-400" />,
    period: "per month",
    description: "For teams and agencies with high volume needs.",
    buttonText: "Contact Sales",
    buttonVariant: "outline",
    popular: false,
  }
};

const initialFallbackTiers = [
  {
    name: "FREE",
    icon: uiConfig.FREE.icon,
    price: "$0",
    period: uiConfig.FREE.period,
    description: uiConfig.FREE.description,
    features: [
      "Watermarked 720p exports",
      "Auto subtitles up to 1 minute",
      "Standard subtitle styles",
    ],
    notIncluded: [
      "No Watermark",
      "4K Export",
      "Translation to 150+ languages",
    ],
    buttonText: uiConfig.FREE.buttonText,
    buttonVariant: uiConfig.FREE.buttonVariant,
    popular: false,
  },
  {
    name: "PRO",
    icon: uiConfig.PRO.icon,
    price: "$19",
    period: uiConfig.PRO.period,
    description: uiConfig.PRO.description,
    features: [
      "No Watermark",
      "1080p & 4K Export",
      "Auto subtitles up to 60 minutes",
      "Premium dynamic animations",
      "Translation to 150+ languages",
    ],
    notIncluded: [
      "Priority Rendering Queue",
      "API Access",
    ],
    buttonText: uiConfig.PRO.buttonText,
    buttonVariant: uiConfig.PRO.buttonVariant,
    popular: true,
  },
  {
    name: "ENTERPRISE",
    icon: uiConfig.ENTERPRISE.icon,
    price: "$99",
    period: uiConfig.ENTERPRISE.period,
    description: uiConfig.ENTERPRISE.description,
    features: [
      "Everything in PRO",
      "Priority Rendering Queue",
      "API Access",
      "Unlimited Subtitles",
      "Custom Brand Fonts",
      "Dedicated Support Manager",
    ],
    notIncluded: [],
    buttonText: uiConfig.ENTERPRISE.buttonText,
    buttonVariant: uiConfig.ENTERPRISE.buttonVariant,
    popular: false,
  }
];

export default function PricingPage() {
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [pricingTiers, setPricingTiers] = useState<any[]>(initialFallbackTiers);

  useEffect(() => {
    async function loadPlans() {
      try {
        const response = await axios.get(`${API_BASE_URL}/payments/plans`);
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const mapped = response.data.map((p: any) => {
            const config = uiConfig[p.name.toUpperCase()] || {
              icon: <Zap className="w-6 h-6 text-slate-400" />,
              period: "per month",
              description: "Custom subscription plan.",
              buttonText: `Subscribe to ${p.name}`,
              buttonVariant: "outline",
              popular: false,
            };
            return {
              name: p.name,
              icon: config.icon,
              price: `$${p.price}`,
              period: config.period,
              description: config.description,
              features: p.benefits || [],
              notIncluded: p.limitations || [],
              buttonText: config.buttonText,
              buttonVariant: config.buttonVariant,
              popular: config.popular,
            };
          });
          setPricingTiers(mapped);
        }
      } catch (err) {
        console.error("Failed to load plans from backend, using fallback configuration:", err);
      }
    }
    loadPlans();
  }, []);

  const handleSubscribe = async (tierName: string) => {
    if (tierName === 'FREE' || tierName === 'ENTERPRISE') {
      // Typically enterprise goes to a contact form, Free is default
      if (tierName === 'ENTERPRISE') {
         alert("Please email sales@addsubtitles.tech to setup an enterprise plan.");
      }
      return;
    }
    
    setLoadingTier(tierName);
    try {
      // Integrate with the backend endpoint we built
      const response = await axios.post(`${API_BASE_URL}/payments/checkout-session`, {
        tier: tierName
      }, {
        withCredentials: true 
      });
      
      if (response.data?.checkoutUrl) {
        // Redirect user to the Dodo Payments hosted checkout
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Failed to start checkout. Ensure you are logged in and the backend is running.");
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1329] text-white py-20 px-4 md:px-8 font-sans overflow-hidden relative">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-500/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-anim-float-up">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-heading tracking-tight">
            Simple, transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">pricing</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl">
            Choose the perfect plan for your video editing needs. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {pricingTiers.map((tier, index) => (
            <div 
              key={tier.name}
              className={`relative rounded-3xl p-8 flex flex-col transition-all duration-500 hover:-translate-y-3 border animate-anim-drop-in`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Card Background / Border Logic */}
              <div className={`absolute inset-0 rounded-3xl border transition-colors duration-300 ${
                tier.popular 
                  ? 'bg-white/5 border-amber-500/50 shadow-[0_0_30px_rgba(212,175,55,0.15)] backdrop-blur-xl' 
                  : 'bg-white/5 border-white/10 hover:border-white/30 backdrop-blur-md'
              }`} />

              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="bg-gradient-to-r from-amber-400 to-amber-600 text-[#332b10] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-[0_4px_14px_rgba(212,175,55,0.4)]">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-2xl ${tier.popular ? 'bg-amber-500/20' : 'bg-slate-800'}`}>
                    {tier.icon}
                  </div>
                  <h3 className="text-2xl font-bold font-heading tracking-wide">{tier.name}</h3>
                </div>
                
                <div className="mb-4">
                  <span className="text-5xl font-extrabold tracking-tight">{tier.price}</span>
                  <span className="text-slate-400 ml-2">/{tier.period}</span>
                </div>
                
                <p className="text-slate-400 mb-8 flex-grow leading-relaxed">
                  {tier.description}
                </p>

                <button 
                  onClick={() => handleSubscribe(tier.name)}
                  disabled={loadingTier === tier.name || tier.name === 'FREE'}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-200 flex justify-center items-center group relative overflow-hidden ${
                    tier.buttonVariant === 'gradient'
                      ? 'subplus-button shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] text-[#332b10]'
                      : 'bg-transparent border border-white/20 text-white hover:bg-white/10'
                  } ${tier.name === 'FREE' ? 'opacity-50 cursor-default hover:bg-transparent' : ''}`}
                >
                  {/* Subtle shine effect for popular button */}
                  {tier.popular && (
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                  )}

                  {loadingTier === tier.name ? (
                    <div className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    tier.buttonText
                  )}
                </button>

                <div className="mt-10 space-y-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Included Features</p>
                  <ul className="space-y-4">
                    {tier.features.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-slate-200">
                        <Check className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                    {tier.notIncluded.map((feature: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-slate-600">
                        <X className="w-5 h-5 shrink-0 mt-0.5" />
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
}
