import { chromium, Browser, Page } from 'playwright';
import { createLogger } from './logger';
import { sleep, normalizeUrl, extractDomain } from './utils';
import prisma from './db';

const logger = createLogger('crawler');

/**
 * Crawler configuration
 */
interface CrawlerConfig {
  maxDepth: number;
  rateLimit: number; // ms between requests
  timeout: number; // page load timeout
  respectRobotsTxt: boolean;
  userAgent: string;
}

const DEFAULT_CONFIG: CrawlerConfig = {
  maxDepth: parseInt(process.env.SCRAPER_MAX_DEPTH || '3', 10),
  rateLimit: parseInt(process.env.SCRAPER_RATE_LIMIT_MS || '1000', 10),
  timeout: 30000,
  respectRobotsTxt: true,
  userAgent:
    'Mozilla/5.0 (compatible; LDB-DataGuard/1.0; +https://ldb-dataguard.de/bot)',
};

/**
 * Crawl result
 */
interface CrawlResult {
  url: string;
  statusCode: number;
  contentType: string;
  html: string;
  jsonLd: Record<string, unknown>[];
  links: string[];
  depth: number;
  error?: string;
}

/**
 * Parse robots.txt and check if URL is allowed
 */
async function isAllowedByRobots(
  url: string,
  userAgent: string
): Promise<boolean> {
  try {
    const domain = extractDomain(url);
    const robotsUrl = `https://${domain}/robots.txt`;
    
    const response = await fetch(robotsUrl, {
      headers: { 'User-Agent': userAgent },
    });
    
    if (!response.ok) {
      // No robots.txt or error - assume allowed
      return true;
    }
    
    const robotsTxt = await response.text();
    const lines = robotsTxt.split('\n');
    
    let relevantSection = false;
    let disallowed: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      
      if (trimmed.startsWith('user-agent:')) {
        const agent = trimmed.replace('user-agent:', '').trim();
        relevantSection = agent === '*' || userAgent.toLowerCase().includes(agent);
      } else if (relevantSection && trimmed.startsWith('disallow:')) {
        const path = trimmed.replace('disallow:', '').trim();
        if (path) disallowed.push(path);
      }
    }
    
    const urlPath = new URL(url).pathname;
    return !disallowed.some((path) => urlPath.startsWith(path));
  } catch (error) {
    logger.warn({ url, error }, 'Failed to check robots.txt');
    return true;
  }
}

/**
 * Extract JSON-LD data from page
 */
async function extractJsonLd(page: Page): Promise<Record<string, unknown>[]> {
  try {
    return await page.evaluate(() => {
      const scripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      const results: Record<string, unknown>[] = [];
      
      scripts.forEach((script) => {
        try {
          const data = JSON.parse(script.textContent || '{}');
          if (Array.isArray(data)) {
            results.push(...data);
          } else {
            results.push(data);
          }
        } catch {
          // Invalid JSON, skip
        }
      });
      
      return results;
    });
  } catch (error) {
    logger.warn({ error }, 'Failed to extract JSON-LD');
    return [];
  }
}

/**
 * Extract links from page
 */
async function extractLinks(
  page: Page,
  baseUrl: string
): Promise<string[]> {
  try {
    const links = await page.evaluate(() => {
      const anchors = document.querySelectorAll('a[href]');
      return Array.from(anchors).map((a) => a.getAttribute('href') || '');
    });
    
    const baseDomain = extractDomain(baseUrl);
    const uniqueLinks = new Set<string>();
    
    for (const link of links) {
      try {
        const absoluteUrl = new URL(link, baseUrl).href;
        const linkDomain = extractDomain(absoluteUrl);
        
        // Only include same-domain links
        if (linkDomain === baseDomain) {
          uniqueLinks.add(normalizeUrl(absoluteUrl));
        }
      } catch {
        // Invalid URL, skip
      }
    }
    
    return Array.from(uniqueLinks);
  } catch (error) {
    logger.warn({ error }, 'Failed to extract links');
    return [];
  }
}

/**
 * Deep website crawler
 */
export class WebCrawler {
  private browser: Browser | null = null;
  private config: CrawlerConfig;
  private visitedUrls: Set<string> = new Set();
  private lastRequestTime = 0;
  
  constructor(config: Partial<CrawlerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Initialize browser
   */
  async init(): Promise<void> {
    if (this.browser) return;
    
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    
    logger.info('Browser initialized');
  }
  
  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('Browser closed');
    }
  }
  
  /**
   * Apply rate limiting
   */
  private async applyRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    
    if (elapsed < this.config.rateLimit) {
      await sleep(this.config.rateLimit - elapsed);
    }
    
    this.lastRequestTime = Date.now();
  }
  
  /**
   * Crawl a single URL
   */
  private async crawlUrl(
    url: string,
    depth: number,
    poiId?: string
  ): Promise<CrawlResult> {
    const normalizedUrl = normalizeUrl(url);
    
    if (this.visitedUrls.has(normalizedUrl)) {
      return {
        url: normalizedUrl,
        statusCode: 0,
        contentType: '',
        html: '',
        jsonLd: [],
        links: [],
        depth,
        error: 'Already visited',
      };
    }
    
    this.visitedUrls.add(normalizedUrl);
    
    // Check robots.txt
    if (this.config.respectRobotsTxt) {
      const allowed = await isAllowedByRobots(url, this.config.userAgent);
      if (!allowed) {
        logger.info({ url }, 'URL disallowed by robots.txt');
        return {
          url: normalizedUrl,
          statusCode: 0,
          contentType: '',
          html: '',
          jsonLd: [],
          links: [],
          depth,
          error: 'Disallowed by robots.txt',
        };
      }
    }
    
    await this.applyRateLimit();
    
    if (!this.browser) {
      await this.init();
    }
    
    const page = await this.browser!.newPage({
      userAgent: this.config.userAgent,
    });
    
    try {
      logger.debug({ url, depth }, 'Crawling URL');
      
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout,
      });
      
      const statusCode = response?.status() || 0;
      const contentType = response?.headers()['content-type'] || '';
      
      if (statusCode >= 400) {
        return {
          url: normalizedUrl,
          statusCode,
          contentType,
          html: '',
          jsonLd: [],
          links: [],
          depth,
          error: `HTTP ${statusCode}`,
        };
      }
      
      const html = await page.content();
      const jsonLd = await extractJsonLd(page);
      const links = depth < this.config.maxDepth ? await extractLinks(page, url) : [];
      
      // Store scraped content
      if (poiId) {
        await prisma.scrapedContent.create({
          data: {
            poiId,
            url: normalizedUrl,
            html: html.substring(0, 500000), // Limit size
            jsonLd: jsonLd.length > 0 ? JSON.parse(JSON.stringify({ items: jsonLd })) : undefined,
            statusCode,
            contentType,
            depth,
          },
        });
      }
      
      logger.info(
        { url, statusCode, jsonLdCount: jsonLd.length, linksCount: links.length },
        'URL crawled successfully'
      );
      
      return {
        url: normalizedUrl,
        statusCode,
        contentType,
        html,
        jsonLd,
        links,
        depth,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error({ url, error: errorMessage }, 'Crawl error');
      
      return {
        url: normalizedUrl,
        statusCode: 0,
        contentType: '',
        html: '',
        jsonLd: [],
        links: [],
        depth,
        error: errorMessage,
      };
    } finally {
      await page.close();
    }
  }
  
  /**
   * Deep crawl starting from URL
   */
  async crawl(
    startUrl: string,
    poiId?: string
  ): Promise<CrawlResult[]> {
    this.visitedUrls.clear();
    const results: CrawlResult[] = [];
    const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
    
    while (queue.length > 0) {
      const { url, depth } = queue.shift()!;
      
      if (depth > this.config.maxDepth) continue;
      
      const result = await this.crawlUrl(url, depth, poiId);
      results.push(result);
      
      // Add discovered links to queue
      if (!result.error && depth < this.config.maxDepth) {
        for (const link of result.links) {
          if (!this.visitedUrls.has(normalizeUrl(link))) {
            queue.push({ url: link, depth: depth + 1 });
          }
        }
      }
    }
    
    logger.info(
      { startUrl, totalPages: results.length, maxDepth: this.config.maxDepth },
      'Deep crawl completed'
    );
    
    return results;
  }
  
  /**
   * Get aggregated JSON-LD data from all crawled pages
   */
  static aggregateJsonLd(results: CrawlResult[]): Record<string, unknown>[] {
    const allJsonLd: Record<string, unknown>[] = [];
    
    for (const result of results) {
      allJsonLd.push(...result.jsonLd);
    }
    
    return allJsonLd;
  }
}

/**
 * Create a new crawler instance
 */
export function createCrawler(config?: Partial<CrawlerConfig>): WebCrawler {
  return new WebCrawler(config);
}

export default WebCrawler;
