const fs = require('fs');
const path = require('path');
const https = require('https');

const HOST = 'www.addsubtitles.tech';
const INDEXNOW_KEY = '4c9d8b7a6f5e4d3c2b1a'; // Key from public/4c9d8b7a6f5e4d3c2b1a.txt
const SITEMAP_URL = `https://${HOST}/sitemap.xml`;

// Next.js static sitemap output path
const sitemapPath = path.join(process.cwd(), '.next', 'server', 'app', 'sitemap.xml.body');

async function triggerIndexing() {
  console.log('🔍 Starting Search Engine Indexing Trigger...');

  if (!fs.existsSync(sitemapPath)) {
    console.error(`❌ Sitemap file not found at ${sitemapPath}`);
    console.error('Make sure this script runs after Next.js build.');
    return;
  }

  // 1. Read sitemap and extract URLs
  const xmlContent = fs.readFileSync(sitemapPath, 'utf8');
  const urlMatches = xmlContent.match(/<loc>(.*?)<\/loc>/g);
  
  if (!urlMatches || urlMatches.length === 0) {
    console.error('❌ No URLs found in sitemap.');
    return;
  }

  const urlList = urlMatches.map(match => match.replace(/<\/?loc>/g, ''));
  console.log(`✅ Found ${urlList.length} URLs in sitemap.`);

  // 2. Ping IndexNow
  console.log('🚀 Pinging IndexNow...');
  try {
    const indexNowPayload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList: urlList
    };

    const indexNowResponse = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(indexNowPayload)
    });

    if (indexNowResponse.ok) {
      console.log('✅ IndexNow notified successfully (Status: 200).');
    } else {
      const text = await indexNowResponse.text();
      console.error(`⚠️ IndexNow responded with status ${indexNowResponse.status}: ${text}`);
    }
  } catch (error) {
    console.error('❌ Error pinging IndexNow:', error.message);
  }

  // 3. Google
  console.log('🚀 Sitemap generated for Google (Googlebot will crawl it from /sitemap.xml).');

  console.log('🎉 Indexing trigger complete.');
}

triggerIndexing();
