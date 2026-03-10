const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://varalabs.systems';
const DESTINATION = path.join(__dirname, 'sitemap.xml');

// 1. Core Pages
const corePages = [
  { url: '/', priority: 1.0, changefreq: 'weekly' },
  { url: '/security.html', priority: 0.9, changefreq: 'monthly' },
  { url: '/redact.html', priority: 1.0, changefreq: 'monthly' },
  { url: '/metadata-cleaner.html', priority: 1.0, changefreq: 'monthly' }
];

// 2. pSEO Matrix Data
const coreTools = ['redactor', 'metadata-scrubber', 'pdf-to-excel'];
const nicheUseCases = [
  'bank-statements',
  'medical-records',
  'legal-discovery',
  'real-estate-contracts',
  'tax-forms',
  'university-applications',
  'resume-ats'
];
const actionKeywords = ['secure', 'private', 'local', 'offline'];

const matrixPages = [];

// Generate permutations: /tools/[action]-[tool]-for-[niche]
for (const tool of coreTools) {
  for (const niche of nicheUseCases) {
    for (const action of actionKeywords) {
      const slug = `${action}-${tool}-for-${niche}`;
      matrixPages.push({
        url: `/tools/${slug}`,
        priority: 0.8,
        changefreq: 'monthly'
      });
    }
  }
}

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
