import { MetadataRoute } from 'next';

const BASE_URL = 'https://varalabs.systems';

export default function sitemap(): MetadataRoute.Sitemap {
  // Core pages
  const corePages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/security`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/redact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/metadata-cleaner`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
  ];

  // The pSEO Matrix Data
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

  const matrixPages: MetadataRoute.Sitemap = [];

  // Generate permutations: /tools/[action]-[tool]-for-[niche]
  // e.g. /tools/secure-redactor-for-bank-statements
  for (const tool of coreTools) {
    for (const niche of nicheUseCases) {
      for (const action of actionKeywords) {
        const slug = `${action}-${tool}-for-${niche}`;
        matrixPages.push({
          url: `${BASE_URL}/tools/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.8, // Long-tail pSEO pages get 0.8 priority
        });
      }
    }
  }

  // Combine and return all routes
  return [...corePages, ...matrixPages];
}
