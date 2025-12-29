import { createLogger } from './logger';
import { retry } from './utils';
import prisma from './db';

const logger = createLogger('google-places');

/**
 * Google Places API client
 */

const API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
const BASE_URL = 'https://maps.googleapis.com/maps/api/place';

/**
 * Cost per API call (approximate)
 */
const API_COSTS = {
  findPlace: 0.017,
  placeDetails: 0.017,
  nearbySearch: 0.032,
  textSearch: 0.032,
};

/**
 * Track API cost
 */
async function trackCost(
  operation: keyof typeof API_COSTS,
  poiId?: string
): Promise<void> {
  const cost = API_COSTS[operation];
  
  await prisma.costTracking.create({
    data: {
      service: 'google_maps',
      operation,
      poiId,
      units: 1,
      unitCost: cost,
      totalCost: cost,
    },
  });
  
  logger.debug({ operation, cost }, 'Google Maps API cost tracked');
}

/**
 * Place search result
 */
export interface PlaceSearchResult {
  placeId: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  types: string[];
  businessStatus?: string;
}

/**
 * Place details
 */
export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
  website?: string;
  url?: string; // Google Maps URL
  location: {
    lat: number;
    lng: number;
  };
  openingHours?: {
    weekdayText: string[];
    isOpen?: boolean;
  };
  priceLevel?: number;
  rating?: number;
  userRatingsTotal?: number;
  types: string[];
  businessStatus?: string;
  reviews?: Array<{
    authorName: string;
    rating: number;
    text: string;
    time: number;
  }>;
}

/**
 * Find place by name and address
 */
export async function findPlace(
  name: string,
  address: string,
  poiId?: string
): Promise<PlaceSearchResult | null> {
  if (!API_KEY) {
    logger.warn('Google Places API key not configured');
    return null;
  }
  
  return retry(
    async () => {
      const query = `${name} ${address}`;
      const url = new URL(`${BASE_URL}/findplacefromtext/json`);
      url.searchParams.set('input', query);
      url.searchParams.set('inputtype', 'textquery');
      url.searchParams.set('fields', 'place_id,name,formatted_address,geometry,types,business_status');
      url.searchParams.set('key', API_KEY);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      await trackCost('findPlace', poiId);
      
      if (data.status !== 'OK' || !data.candidates?.length) {
        logger.info({ query, status: data.status }, 'No place found');
        return null;
      }
      
      const candidate = data.candidates[0];
      
      logger.info({ placeId: candidate.place_id, name: candidate.name }, 'Place found');
      
      return {
        placeId: candidate.place_id,
        name: candidate.name,
        address: candidate.formatted_address,
        location: {
          lat: candidate.geometry.location.lat,
          lng: candidate.geometry.location.lng,
        },
        types: candidate.types || [],
        businessStatus: candidate.business_status,
      };
    },
    {
      maxAttempts: 3,
      baseDelay: 1000,
      onRetry: (error, attempt) => {
        logger.warn({ error: error.message, attempt }, 'Retrying findPlace');
      },
    }
  );
}

/**
 * Get place details by place ID
 */
export async function getPlaceDetails(
  placeId: string,
  poiId?: string
): Promise<PlaceDetails | null> {
  if (!API_KEY) {
    logger.warn('Google Places API key not configured');
    return null;
  }
  
  return retry(
    async () => {
      const url = new URL(`${BASE_URL}/details/json`);
      url.searchParams.set('place_id', placeId);
      url.searchParams.set(
        'fields',
        [
          'place_id',
          'name',
          'formatted_address',
          'formatted_phone_number',
          'international_phone_number',
          'website',
          'url',
          'geometry',
          'opening_hours',
          'price_level',
          'rating',
          'user_ratings_total',
          'types',
          'business_status',
          'reviews',
        ].join(',')
      );
      url.searchParams.set('key', API_KEY);
      
      const response = await fetch(url.toString());
      const data = await response.json();
      
      await trackCost('placeDetails', poiId);
      
      if (data.status !== 'OK' || !data.result) {
        logger.warn({ placeId, status: data.status }, 'Failed to get place details');
        return null;
      }
      
      const result = data.result;
      
      logger.info({ placeId, name: result.name }, 'Place details retrieved');
      
      return {
        placeId: result.place_id,
        name: result.name,
        formattedAddress: result.formatted_address,
        formattedPhoneNumber: result.formatted_phone_number,
        internationalPhoneNumber: result.international_phone_number,
        website: result.website,
        url: result.url,
        location: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
        openingHours: result.opening_hours
          ? {
              weekdayText: result.opening_hours.weekday_text || [],
              isOpen: result.opening_hours.open_now,
            }
          : undefined,
        priceLevel: result.price_level,
        rating: result.rating,
        userRatingsTotal: result.user_ratings_total,
        types: result.types || [],
        businessStatus: result.business_status,
        reviews: result.reviews?.map((r: Record<string, unknown>) => ({
          authorName: r.author_name,
          rating: r.rating,
          text: r.text,
          time: r.time,
        })),
      };
    },
    {
      maxAttempts: 3,
      baseDelay: 1000,
      onRetry: (error, attempt) => {
        logger.warn({ error: error.message, attempt }, 'Retrying getPlaceDetails');
      },
    }
  );
}

/**
 * Search nearby places
 */
export async function nearbySearch(
  lat: number,
  lng: number,
  radius: number = 1000,
  type?: string
): Promise<PlaceSearchResult[]> {
  if (!API_KEY) {
    logger.warn('Google Places API key not configured');
    return [];
  }
  
  const url = new URL(`${BASE_URL}/nearbysearch/json`);
  url.searchParams.set('location', `${lat},${lng}`);
  url.searchParams.set('radius', String(radius));
  if (type) url.searchParams.set('type', type);
  url.searchParams.set('key', API_KEY);
  
  const response = await fetch(url.toString());
  const data = await response.json();
  
  await trackCost('nearbySearch');
  
  if (data.status !== 'OK') {
    return [];
  }
  
  return data.results.map((r: Record<string, unknown>) => {
    const geometry = r.geometry as { location: { lat: number; lng: number } } | undefined;
    return {
      placeId: r.place_id as string,
      name: r.name as string,
      address: r.vicinity as string,
      location: {
        lat: geometry?.location?.lat ?? 0,
        lng: geometry?.location?.lng ?? 0,
      },
      types: (r.types as string[]) || [],
      businessStatus: r.business_status as string | undefined,
    };
  });
}

/**
 * Convert place details to POI format
 */
export function placeDetailsToPoiData(details: PlaceDetails): Record<string, unknown> {
  return {
    name: details.name,
    address: details.formattedAddress,
    phone: details.internationalPhoneNumber || details.formattedPhoneNumber,
    website: details.website,
    latitude: details.location.lat,
    longitude: details.location.lng,
    openingHours: details.openingHours?.weekdayText,
    priceLevel: details.priceLevel,
    rating: details.rating,
    reviewCount: details.userRatingsTotal,
    googleMapsUrl: details.url,
    businessStatus: details.businessStatus,
  };
}
