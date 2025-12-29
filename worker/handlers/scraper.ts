import { Job } from 'bullmq';
import { createLogger } from '../../src/lib/logger';
import { createCrawler, WebCrawler } from '../../src/lib/crawler';
import prisma from '../../src/lib/db';
import { getAuditQueue, getMapsQueue, addJob, type ScraperJobData } from '../../src/lib/queue';
import { scraperRequestsTotal, scraperDuration, queueCompleted, queueFailed } from '../../src/lib/metrics';

const logger = createLogger('scraper-handler');

/**
 * Handle scraper job
 */
export async function handleScraperJob(job: Job<ScraperJobData>): Promise<void> {
  const { poiId, url, maxDepth = 3 } = job.data;
  const startTime = Date.now();
  
  logger.info({ jobId: job.id, poiId, url }, 'Starting scraper job');
  
  let crawler: WebCrawler | null = null;
  
  try {
    // Create crawler
    crawler = createCrawler({ maxDepth });
    await crawler.init();
    
    // Crawl website
    const results = await crawler.crawl(url, poiId);
    
    // Aggregate JSON-LD data
    const jsonLdData = WebCrawler.aggregateJsonLd(results);
    
    // Extract structured data
    const websiteData = extractWebsiteData(jsonLdData, results);
    
    // Update POI with website data
    await prisma.pOI.update({
      where: { id: poiId },
      data: {
        websiteData: JSON.parse(JSON.stringify(websiteData)),
      },
    });
    
    // Queue maps job for additional data
    const poi = await prisma.pOI.findUnique({
      where: { id: poiId },
      select: { name: true, street: true, city: true, latitude: true, longitude: true },
    });
    
    if (poi) {
      const mapsQueue = getMapsQueue();
      await addJob(mapsQueue, {
        poiId,
        name: poi.name,
        address: `${poi.street || ''}, ${poi.city || ''}`.trim(),
        latitude: poi.latitude || undefined,
        longitude: poi.longitude || undefined,
      });
    }
    
    const duration = (Date.now() - startTime) / 1000;
    scraperDuration.observe(duration);
    scraperRequestsTotal.labels({ status: 'success' }).inc();
    queueCompleted.labels({ queue: 'scraper' }).inc();
    
    logger.info(
      { jobId: job.id, poiId, pagesScraped: results.length, duration },
      'Scraper job completed'
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    scraperRequestsTotal.labels({ status: 'error' }).inc();
    queueFailed.labels({ queue: 'scraper' }).inc();
    
    // Log failed job
    await prisma.failedJob.create({
      data: {
        queue: 'scraper',
        jobId: job.id || '',
        jobData: JSON.parse(JSON.stringify(job.data)),
        error: errorMessage,
        stackTrace: error instanceof Error ? error.stack : undefined,
        attempts: job.attemptsMade,
        maxAttempts: job.opts.attempts || 3,
      },
    });
    
    logger.error({ jobId: job.id, poiId, error: errorMessage }, 'Scraper job failed');
    throw error;
  } finally {
    if (crawler) {
      await crawler.close();
    }
  }
}

/**
 * Extract structured data from crawl results
 */
function extractWebsiteData(
  jsonLdData: Record<string, unknown>[],
  results: { url: string; html: string; jsonLd: Record<string, unknown>[] }[]
): Record<string, unknown> {
  const data: Record<string, unknown> = {
    scrapedAt: new Date().toISOString(),
    pagesScraped: results.length,
    hasJsonLd: jsonLdData.length > 0,
  };
  
  // Extract from JSON-LD
  for (const item of jsonLdData) {
    const type = item['@type'] as string | string[] | undefined;
    
    if (!type) continue;
    
    const types = Array.isArray(type) ? type : [type];
    
    // Check for relevant Schema.org types
    if (types.some(t => ['LocalBusiness', 'Restaurant', 'Hotel', 'TouristAttraction', 'Place'].includes(t))) {
      // Extract fields
      if (item.name && !data.name) data.name = item.name;
      if (item.telephone && !data.telephone) data.telephone = item.telephone;
      if (item.email && !data.email) data.email = item.email;
      if (item.url && !data.url) data.url = item.url;
      if (item.description && !data.description) data.description = item.description;
      if (item.priceRange && !data.priceRange) data.priceRange = item.priceRange;
      if (item.servesCuisine && !data.servesCuisine) data.servesCuisine = item.servesCuisine;
      if (item.openingHoursSpecification && !data.openingHours) {
        data.openingHours = item.openingHoursSpecification;
      }
      if (item.paymentAccepted && !data.paymentAccepted) {
        data.paymentAccepted = item.paymentAccepted;
      }
      
      // Address
      const address = item.address as Record<string, unknown> | undefined;
      if (address && typeof address === 'object') {
        if (address.streetAddress && !data.streetAddress) data.streetAddress = address.streetAddress;
        if (address.postalCode && !data.postalCode) data.postalCode = address.postalCode;
        if (address.addressLocality && !data.addressLocality) data.addressLocality = address.addressLocality;
        if (address.addressRegion && !data.addressRegion) data.addressRegion = address.addressRegion;
        if (address.addressCountry && !data.addressCountry) data.addressCountry = address.addressCountry;
      }
      
      // Geo
      const geo = item.geo as Record<string, unknown> | undefined;
      if (geo && typeof geo === 'object') {
        if (geo.latitude && !data.latitude) data.latitude = geo.latitude;
        if (geo.longitude && !data.longitude) data.longitude = geo.longitude;
      }
    }
  }
  
  return data;
}
