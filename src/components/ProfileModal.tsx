"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  CreditCard,
  Shield,
  Bell,
  Crown,
  Zap,
  Sparkles,
  Check,
  AlertTriangle,
  ExternalLink,
  LogOut,
  Mail,
  Calendar,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PLAN_META: Record<string, { icon: React.ReactNode; color: string; label: string; description: string; textColor: string; borderColor: string }> = {
  FREE: {
    icon: <Zap className="w-4 h-4" />,
    color: 'bg-slate-700',
    label: 'Free',
    description: 'Basic features for individuals',
    textColor: 'text-slate-300',
    borderColor: 'border-slate-600',
  },
  PRO: {
    icon: <Sparkles className="w-4 h-4" />,
    color: 'bg-amber-500/20',
    label: 'Pro',
    description: 'For content creators',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/50',
  },
  'PRO PLUS': {
    icon: <Crown className="w-4 h-4" />,
    color: 'bg-purple-500/20',
    label: 'Pro Plus',
    description: 'For professional creators',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/50',
  },
};

type Tab = 'account' | 'billing' | 'security' | 'notifications';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
  onLogout?: () => void;
}

export default function ProfileModal({ isOpen, onClose, onUpgrade, onLogout }: ProfileModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('account');
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const tier = user?.subscriptionTier || 'FREE';
  const planMeta = PLAN_META[tier] || PLAN_META.FREE;

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('account');
      setSaveStatus('idle');
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A';

  const handleSaveNotifications = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing & Plan', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-[#0b1329] border border-[#1e2a4a] rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh]">

        {/* Decorative glows */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-[#1e2a4a]/70">
          <h2 className="text-lg font-bold text-white font-heading tracking-tight">Profile Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#16223f] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar / Topbar on mobile */}
          <aside className="w-full md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-[#1e2a4a]/70 flex flex-row md:flex-col p-3 gap-1 overflow-x-auto md:overflow-visible">
            {/* User info - hidden on mobile nav to save space */}
            <div className="hidden md:block px-3 py-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-[#0d142d] font-bold text-sm shadow-md shrink-0">
                  {user.email[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-white truncate">{user.email.split('@')[0]}</p>
                  <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${planMeta.color} ${planMeta.textColor}`}>
                    {planMeta.icon}
                    {planMeta.label}
                  </div>
                </div>
              </div>
            </div>

            {/* Nav items */}
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#182747] text-white border border-[#253966]'
                    : 'text-zinc-400 hover:text-white hover:bg-[#111b34]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}

            <div className="flex-1 hidden md:block" />

            {/* Logout */}
            {onLogout && (
              <button
                onClick={() => { onClose(); onLogout(); }}
                className="flex items-center gap-2.5 px-3 py-2.5 mt-2 md:mt-0 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-6">

            {/* ── Account Tab ── */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Account Information</h3>
                  <p className="text-xs text-zinc-500">Manage your personal details</p>
                </div>

                {/* Profile card */}
                <div className="bg-[#0d142d] border border-[#1e2a4a] rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center text-[#0d142d] text-2xl font-bold shadow-lg">
                      {user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-base">{user.email.split('@')[0]}</p>
                      <p className="text-zinc-400 text-sm">{user.email}</p>
                      <div className={`mt-1 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-bold border ${planMeta.color} ${planMeta.textColor} ${planMeta.borderColor}`}>
                        {planMeta.icon}
                        {planMeta.label} Plan
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#0d142d] border border-[#1e2a4a] rounded-xl p-4 flex items-start gap-3">
                    <div className="p-2 bg-[#16223f] rounded-lg">
                      <Mail className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Email Address</p>
                      <p className="text-sm text-white font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="bg-[#0d142d] border border-[#1e2a4a] rounded-xl p-4 flex items-start gap-3">
                    <div className="p-2 bg-[#16223f] rounded-lg">
                      <Calendar className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Member Since</p>
                      <p className="text-sm text-white font-medium">{memberSince}</p>
                    </div>
                  </div>
                  <div className="bg-[#0d142d] border border-[#1e2a4a] rounded-xl p-4 flex items-start gap-3">
                    <div className="p-2 bg-[#16223f] rounded-lg">
                      <Clock className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">User ID</p>
                      <p className="text-sm text-white font-medium font-mono truncate">{user.id?.slice(0, 16)}...</p>
                    </div>
                  </div>
                  <div className={`bg-[#0d142d] border rounded-xl p-4 flex items-start gap-3 ${planMeta.borderColor}`}>
                    <div className={`p-2 rounded-lg ${planMeta.color}`}>
                      <span className={planMeta.textColor}>{planMeta.icon}</span>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-0.5">Current Plan</p>
                      <p className={`text-sm font-bold ${planMeta.textColor}`}>{planMeta.label}</p>
                    </div>
                  </div>
                </div>

                {/* Google sign-in notice */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-blue-300 font-medium">Signed in with Google</p>
                    <p className="text-xs text-blue-400/70 mt-0.5">Your account is managed through Google. Name and email changes are handled via your Google account.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Billing Tab ── */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Billing & Plan</h3>
                  <p className="text-xs text-zinc-500">Manage your subscription and billing details</p>
                </div>

                {/* Current plan */}
                <div className={`bg-[#0d142d] border rounded-xl p-5 ${planMeta.borderColor}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${planMeta.color}`}>
                        <span className={planMeta.textColor}>{planMeta.icon}</span>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 mb-0.5">Current Plan</p>
                        <p className={`text-lg font-bold ${planMeta.textColor}`}>{planMeta.label} Plan</p>
                        <p className="text-xs text-zinc-500">{planMeta.description}</p>
                      </div>
                    </div>
                    {tier === 'FREE' && (
                      <button
                        onClick={() => { onClose(); onUpgrade?.(); }}
                        className="subplus-button px-4 py-2 rounded-lg text-sm font-bold"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>

                  {tier !== 'FREE' && (
                    <div className="mt-4 pt-4 border-t border-[#1e2a4a] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-400">Status</span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                          Active
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-400">Billing Cycle</span>
                        <span className="text-sm text-white">Monthly</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* All plans */}
                <div>
                  <p className="text-sm font-semibold text-zinc-300 mb-3">All Plans</p>
                  <div className="space-y-2">
                    {Object.entries(PLAN_META).map(([name, meta]) => (
                      <div
                        key={name}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          name === tier
                            ? `${meta.borderColor} bg-[#0d142d]`
                            : 'border-[#1e2a4a] bg-[#0d142d]/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${meta.color}`}>
                            <span className={meta.textColor}>{meta.icon}</span>
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${name === tier ? meta.textColor : 'text-white'}`}>{meta.label}</p>
                            <p className="text-xs text-zinc-500">{meta.description}</p>
                          </div>
                        </div>
                        {name === tier ? (
                          <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${meta.color} ${meta.textColor}`}>
                            <Check className="w-3 h-3" /> Current
                          </span>
                        ) : name !== 'FREE' ? (
                          <button
                            onClick={() => { onClose(); onUpgrade?.(); }}
                            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                          >
                            Switch <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>

                {tier !== 'FREE' && (
                  <div className="bg-[#0d142d] border border-[#1e2a4a] rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Manage Billing</p>
                      <p className="text-xs text-zinc-500 mt-0.5">View invoices, update payment method</p>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400/60 px-3 py-2 rounded-lg transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Billing Portal
                    </button>
                  </div>
                )}

                {tier !== 'FREE' && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-400">Cancel Subscription</p>
                      <p className="text-xs text-zinc-500 mt-0.5">You'll keep access until end of billing period</p>
                    </div>
                    <button className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400 px-3 py-2 rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Security Tab ── */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Security</h3>
                  <p className="text-xs text-zinc-500">Manage your account security settings</p>
                </div>

                {/* Auth method */}
                <div className="bg-[#0d142d] border border-[#1e2a4a] rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4">Sign-in Method</p>
                  <div className="flex items-center gap-3 p-3 bg-[#16223f] rounded-lg border border-[#253966]">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Google Account</p>
                      <p className="text-xs text-zinc-400">{user.email}</p>
                    </div>
                    <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  </div>
                </div>

                {/* Sessions */}
                <div className="bg-[#0d142d] border border-[#1e2a4a] rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4">Active Sessions</p>
                  <div className="flex items-center gap-3 p-3 bg-[#16223f] rounded-lg border border-[#253966]">
                    <div className="p-1.5 bg-[#0d142d] rounded-md">
                      <Shield className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">Current Session</p>
                      <p className="text-xs text-zinc-400">This browser — Active now</p>
                    </div>
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Danger zone */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
                  <p className="text-sm font-semibold text-red-400 mb-3">Danger Zone</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white">Delete Account</p>
                      <p className="text-xs text-zinc-500 mt-0.5">Permanently delete your account and all data</p>
                    </div>
                    <button className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400 px-3 py-2 rounded-lg transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Notifications Tab ── */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Notifications</h3>
                  <p className="text-xs text-zinc-500">Manage how and when you hear from us</p>
                </div>

                <div className="bg-[#0d142d] border border-[#1e2a4a] rounded-xl overflow-hidden">
                  {[
                    {
                      key: 'emailNotifications',
                      label: 'Email Notifications',
                      description: 'Processing complete, export ready alerts',
                      value: emailNotifications,
                      onChange: setEmailNotifications,
                    },
                    {
                      key: 'productUpdates',
                      label: 'Product Updates',
                      description: 'New features and improvements',
                      value: productUpdates,
                      onChange: setProductUpdates,
                    },
                    {
                      key: 'marketingEmails',
                      label: 'Marketing & Promotions',
                      description: 'Tips, offers and promotional content',
                      value: marketingEmails,
                      onChange: setMarketingEmails,
                    },
                  ].map((item, index, arr) => (
                    <div
                      key={item.key}
                      className={`flex items-center justify-between p-4 ${
                        index < arr.length - 1 ? 'border-b border-[#1e2a4a]' : ''
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{item.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>
                      </div>
                      <button
                        onClick={() => item.onChange(!item.value)}
                        aria-label={`Toggle ${item.label}`}
                        style={{
                          position: 'relative',
                          display: 'inline-flex',
                          alignItems: 'center',
                          width: '44px',
                          height: '24px',
                          borderRadius: '9999px',
                          backgroundColor: item.value ? '#d4af37' : '#253966',
                          transition: 'background-color 0.2s ease',
                          flexShrink: 0,
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            top: '3px',
                            left: item.value ? '23px' : '3px',
                            width: '18px',
                            height: '18px',
                            borderRadius: '9999px',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                            transition: 'left 0.2s ease',
                          }}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSaveNotifications}
                  disabled={saving}
                  className="flex items-center gap-2 subplus-button px-5 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : saveStatus === 'success' ? (
                    <Check className="w-4 h-4" />
                  ) : null}
                  {saving ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : 'Save Preferences'}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
