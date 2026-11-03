import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required so PostHog API requests ending in a slash don't trigger a 308 redirect
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest",
        destination: "https://us.i.posthog.com/",
      },
    ];
  },
};

export default nextConfig;
