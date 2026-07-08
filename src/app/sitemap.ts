import { MetadataRoute } from 'next';
import { TOOL_META } from './tools/[slug]/page';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.addsubtitles.tech';
  const lastModified = new Date();

  // Core Static Routes
  const staticRoutes = [
    '',
    '/about',
    '/pricing',
    '/tools',
    '/tools/youtube-transcript-generator',
    '/blog/silent-view-secret',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
  }));

  // Dynamic Tool Routes
  const dynamicToolRoutes = Object.keys(TOOL_META).map((slug) => ({
    url: `${baseUrl}/tools/${slug}`,
    lastModified,
  }));

  return [...staticRoutes, ...dynamicToolRoutes];
}
