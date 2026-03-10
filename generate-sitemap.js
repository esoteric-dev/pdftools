const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://varalabs.systems';
const DESTINATION = path.join(__dirname, 'sitemap.xml');

// 1. Core Pages & Explicit Hardcoded Pages
const corePages = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/security.html', priority: 0.9, changefreq: 'monthly' },
  { url: '/redact.html', priority: 1.0, changefreq: 'monthly' },
  { url: '/metadata-cleaner.html', priority: 1.0, changefreq: 'monthly' }
];

// 2. Scan specific pSEO Directories for valid deployed folders
const matrixPages = [];
const publicDir = path.join(__dirname); 

// Target the /redact folder we just built our first 3 pages into
const redactDir = path.join(publicDir, 'redact');
if (fs.existsSync(redactDir)) {
  const folders = fs.readdirSync(redactDir);
  for (const folder of folders) {
    // Only include if there is an index.html inside
    const indexPath = path.join(redactDir, folder, 'index.html');
    if (fs.existsSync(indexPath)) {
      matrixPages.push({
        url: `/redact/${folder}/`,
        priority: 0.8,
        changefreq: 'monthly'
      });
    }
  }
}

// TODO: If we ever build /tools/[slug] physical pages, we can add a scanner here.
// For now, only combine what ACTUALLY EXISTS on disk to prevent SEO SPAM 404s.

const allPages = [...corePages, ...matrixPages];

// 3. Generate XML String
const today = new Date().toISOString().split('T')[0];

let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

for (const page of allPages) {
  xml += `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>`;
}

xml += `\n</urlset>`;

// 4. Write to disk
fs.writeFileSync(DESTINATION, xml, 'utf8');
console.log(`✅ Successfully generated sitemap.xml with ${allPages.length} URLs at ${DESTINATION}`);
