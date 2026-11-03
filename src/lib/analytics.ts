import posthog from "posthog-js";

/**
 * Safely captures a PostHog event if PostHog has been initialized.
 * In development, logs events to the console for easy debugging.
 */
function captureEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === "undefined") return;

  if (process.env.NODE_ENV !== "production") {
    console.debug(`[Analytics] ${eventName}`, properties || {});
  }

  if (posthog.__loaded) {
    posthog.capture(eventName, properties);
  }
}

/**
 * Strongly-typed event dispatcher for AddSubtitles.
 */
export const analytics = {
  // ─── User & Authentication ───
  identifyUser: (userId: string, traits?: { email?: string; subscriptionTier?: string; [key: string]: any }) => {
    if (typeof window === "undefined") return;
    if (posthog.__loaded) {
      posthog.identify(userId, traits);
    }
  },

  resetUser: () => {
    if (typeof window === "undefined") return;
    if (posthog.__loaded) {
      posthog.reset();
    }
  },

  // ─── Video & Media Funnel ───
  videoUploaded: (data: {
    fileName: string;
    fileSizeMb: number;
    durationSeconds?: number;
    fileType: string;
  }) => {
    captureEvent("video_uploaded", data);
  },

  transcriptionStarted: (data?: {
    durationSeconds?: number;
    language?: string;
  }) => {
    captureEvent("transcription_started", data);
  },

  transcriptionCompleted: (data: {
    durationSeconds?: number;
    wordCount: number;
    segmentCount: number;
    processingTimeMs?: number;
  }) => {
    captureEvent("transcription_completed", data);
  },

  // ─── Editor Editing Features ───
  silenceCutApplied: (data: {
    silencesCount: number;
    totalDurationRemovedSeconds?: number;
  }) => {
    captureEvent("silences_cut_applied", data);
  },

  fillerWordsToggled: (data: {
    enabled: boolean;
    fillerCount?: number;
  }) => {
    captureEvent("filler_words_toggled", data);
  },

  templateSelected: (data: {
    templateName: string;
    fontFamily?: string;
    animation?: string;
  }) => {
    captureEvent("template_selected", data);
  },

  presetSaved: (data: {
    presetName: string;
  }) => {
    captureEvent("preset_saved", data);
  },

  aiHookGenerated: (data: {
    hooksCount: number;
  }) => {
    captureEvent("ai_hook_generated", data);
  },

  aiEmojisGenerated: (data: {
    emojisCount: number;
  }) => {
    captureEvent("ai_emojis_generated", data);
  },

  subtitlesTranslated: (data: {
    targetLanguage: string;
    segmentsCount: number;
  }) => {
    captureEvent("subtitles_translated", data);
  },

  // ─── Export & Render Funnel ───
  exportStarted: (data: {
    videoDurationSeconds?: number;
    resolution?: string;
    isPro: boolean;
    hasWatermark: boolean;
    removeSilences?: boolean;
    filterFillerWords?: boolean;
  }) => {
    captureEvent("export_started", data);
  },

  exportCompleted: (data: {
    renderDurationMs: number;
    fileSizeMb?: number;
    resolution?: string;
  }) => {
    captureEvent("export_completed", data);
  },

  exportFailed: (data: {
    error: string;
    videoDurationSeconds?: number;
  }) => {
    captureEvent("export_failed", data);
  },

  videoDownloaded: (data?: {
    resolution?: string;
    fileName?: string;
  }) => {
    captureEvent("video_downloaded", data);
  },

  // ─── Monetization & Upgrades ───
  upgradeModalOpened: (data: {
    triggerSource: "watermark_badge" | "pro_feature_lock" | "pricing_page" | "navbar" | "export";
  }) => {
    captureEvent("upgrade_modal_opened", data);
  },

  checkoutInitiated: (data: {
    tier: string;
    price?: number | string;
    period?: string;
  }) => {
    captureEvent("checkout_initiated", data);
  },

  paymentCompleted: (data?: {
    tier?: string;
  }) => {
    captureEvent("payment_completed", data);
  },

  // ─── Tools & Landing Navigation ───
  ctaClicked: (data: {
    buttonName: string;
    location: string;
    destinationUrl?: string;
  }) => {
    captureEvent("cta_clicked", data);
  },

  toolUsed: (data: {
    toolSlug: string;
    success: boolean;
    url?: string;
  }) => {
    captureEvent("tool_used", data);
  },
};
