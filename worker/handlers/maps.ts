import { Job } from 'bullmq';
import { createLogger } from '../../src/lib/logger';
import { findPlace, getPlaceDetails, placeDetailsToPoiData } from '../../src/lib/google-places';
import prisma from '../../src/lib/db';
import { getAuditQueue, addJob, type MapsJobData } from '../../src/lib/queue';
import { queueCompleted, queueFailed, apiRequestsTotal } from '../../src/lib/metrics';

const logger = createLogger('maps-handler');

/**
 * Handle Google Maps job
 */
export async function handleMapsJob(job: Job<MapsJobData>): Promise<void> {
  const { poiId, name, address, latitude, longitude } = job.data;
  
  logger.info({ jobId: job.id, poiId, name }, 'Starting maps job');
  
  try {
    // Find place
    const place = await findPlace(name, address, poiId);
    
    if (!place) {
      logger.warn({ poiId, name }, 'Place not found on Google Maps');
      apiRequestsTotal.labels({ service: 'google_maps', operation: 'findPlace', status: 'not_found' }).inc();
      
      // Still queue audit job with available data
      await queueAuditJob(poiId);
      return;
    }
    
    apiRequestsTotal.labels({ service: 'google_maps', operation: 'findPlace', status: 'success' }).inc();
    
    // Get place details
    const details = await getPlaceDetails(place.placeId, poiId);
    
    if (!details) {
      logger.warn({ poiId, placeId: place.placeId }, 'Failed to get place details');
      apiRequestsTotal.labels({ service: 'google_maps', operation: 'placeDetails', status: 'error' }).inc();
      
      await queueAuditJob(poiId);
      return;
    }
    
    apiRequestsTotal.labels({ service: 'google_maps', operation: 'placeDetails', status: 'success' }).inc();
    
    // Convert to POI data format
    const mapsData = placeDetailsToPoiData(details);
    
    // Update POI with maps data
    await prisma.pOI.update({
      where: { id: poiId },
      data: {
        mapsData: JSON.parse(JSON.stringify(mapsData)),
      },
    });
    
    queueCompleted.labels({ queue: 'maps' }).inc();
    
    logger.info({ jobId: job.id, poiId, placeId: place.placeId }, 'Maps job completed');
    
    // Queue audit job
    await queueAuditJob(poiId);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    queueFailed.labels({ queue: 'maps' }).inc();
    
    // Log failed job
    await prisma.failedJob.create({
      data: {
        queue: 'maps',
        jobId: job.id || '',
        jobData: JSON.parse(JSON.stringify(job.data)),
        error: errorMessage,
        stackTrace: error instanceof Error ? error.stack : undefined,
        attempts: job.attemptsMade,
        maxAttempts: job.opts.attempts || 3,
      },
    });
    
    logger.error({ jobId: job.id, poiId, error: errorMessage }, 'Maps job failed');
    throw error;
  }
}

/**
 * Queue audit job for POI
 */
async function queueAuditJob(poiId: string): Promise<void> {
  const poi = await prisma.pOI.findUnique({
    where: { id: poiId },
    select: {
      tldbData: true,
      websiteData: true,
      mapsData: true,
    },
  });
  
  if (!poi) {
    logger.warn({ poiId }, 'POI not found for audit');
    return;
  }
  
  const auditQueue = getAuditQueue();
  await addJob(auditQueue, {
    poiId,
    tldbData: (poi.tldbData as Record<string, unknown>) || {},
    websiteData: (poi.websiteData as Record<string, unknown>) || {},
    mapsData: (poi.mapsData as Record<string, unknown>) || {},
  });
  
  logger.info({ poiId }, 'Audit job queued');
}
