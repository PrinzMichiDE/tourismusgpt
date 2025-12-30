import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    pOI: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    dataField: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn(),
    },
    scheduleConfig: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    audit: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
    costTracking: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
    },
  },
}));

// Mock Auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({
    user: { id: 'test-user', role: 'ADMIN', email: 'admin@test.com' },
  })),
}));

describe('API Validators', () => {
  describe('POI Validation', () => {
    it('should validate POI creation data', async () => {
      const { createPoiSchema } = await import('@/lib/validators');
      
      const validData = {
        name: 'Test Hotel',
        category: 'Hotel',
        street: 'Teststraße 1',
        city: 'Kiel',
        postalCode: '24103',
      };
      
      const result = createPoiSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject POI without name', async () => {
      const { createPoiSchema } = await import('@/lib/validators');
      
      const invalidData = {
        category: 'Hotel',
        city: 'Kiel',
      };
      
      const result = createPoiSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate website URL format', async () => {
      const { createPoiSchema } = await import('@/lib/validators');
      
      const dataWithInvalidUrl = {
        name: 'Test Hotel',
        website: 'not-a-url',
      };
      
      const result = createPoiSchema.safeParse(dataWithInvalidUrl);
      expect(result.success).toBe(false);
    });

    it('should accept valid website URL', async () => {
      const { createPoiSchema } = await import('@/lib/validators');
      
      const dataWithValidUrl = {
        name: 'Test Hotel',
        website: 'https://example.com',
      };
      
      const result = createPoiSchema.safeParse(dataWithValidUrl);
      expect(result.success).toBe(true);
    });
  });

  describe('User Validation', () => {
    it('should validate user creation with strong password', async () => {
      const { createUserSchema } = await import('@/lib/validators');
      
      const validUser = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass123',
        role: 'EDITOR',
      };
      
      const result = createUserSchema.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('should reject weak password', async () => {
      const { createUserSchema } = await import('@/lib/validators');
      
      const weakPasswordUser = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'weak',
        role: 'EDITOR',
      };
      
      const result = createUserSchema.safeParse(weakPasswordUser);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', async () => {
      const { createUserSchema } = await import('@/lib/validators');
      
      const invalidEmailUser = {
        email: 'not-an-email',
        name: 'Test User',
        password: 'SecurePass123',
      };
      
      const result = createUserSchema.safeParse(invalidEmailUser);
      expect(result.success).toBe(false);
    });
  });

  describe('Audit Validation', () => {
    it('should validate audit start request', async () => {
      const { startAuditSchema } = await import('@/lib/validators');
      
      // Use valid CUID format
      const validAudit = {
        poiIds: ['clx1234567890abcdefghijk', 'clx0987654321zyxwvutsrqp'],
        priority: 5,
      };
      
      const result = startAuditSchema.safeParse(validAudit);
      expect(result.success).toBe(true);
    });

    it('should reject empty poiIds', async () => {
      const { startAuditSchema } = await import('@/lib/validators');
      
      const invalidAudit = {
        poiIds: [],
        priority: 5,
      };
      
      const result = startAuditSchema.safeParse(invalidAudit);
      expect(result.success).toBe(false);
    });
  });

  describe('Pagination', () => {
    it('should validate pagination params', async () => {
      const { paginationSchema } = await import('@/lib/validators');
      
      const validParams = {
        page: 1,
        limit: 20,
        sortOrder: 'asc',
      };
      
      const result = paginationSchema.safeParse(validParams);
      expect(result.success).toBe(true);
    });

    it('should enforce max limit', async () => {
      const { paginationSchema } = await import('@/lib/validators');
      
      const params = {
        page: 1,
        limit: 500, // exceeds max of 100
      };
      
      const result = paginationSchema.safeParse(params);
      expect(result.success).toBe(false);
    });

    it('should use default values', async () => {
      const { paginationSchema } = await import('@/lib/validators');
      
      const result = paginationSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
        expect(result.data.sortOrder).toBe('desc');
      }
    });
  });
});

describe('Cost Tracker', () => {
  it('should calculate OpenAI costs correctly', async () => {
    const { calculateOpenAICost } = await import('@/lib/cost-tracker');
    
    // 1000 input tokens, 500 output tokens for gpt-4o-mini
    const cost = calculateOpenAICost('gpt-4o-mini', 1000, 500);
    
    // input: 1 * 0.00015 = 0.00015
    // output: 0.5 * 0.0006 = 0.0003
    // total: 0.00045
    expect(cost).toBeCloseTo(0.00045, 5);
  });

  it('should handle unknown model with fallback', async () => {
    const { calculateOpenAICost } = await import('@/lib/cost-tracker');
    
    // Unknown model should fall back to gpt-4o-mini rates
    const cost = calculateOpenAICost('unknown-model', 1000, 1000);
    
    expect(cost).toBeGreaterThan(0);
  });
});
