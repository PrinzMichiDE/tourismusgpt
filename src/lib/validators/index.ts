import { z } from 'zod';

/**
 * Common validation schemas for LDB-DataGuard
 */

// ============================================================================
// Common Schemas
// ============================================================================

export const idSchema = z.string().cuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const searchSchema = z.object({
  query: z.string().min(1).max(200).optional(),
  filters: z.record(z.string(), z.unknown()).optional(),
});

// ============================================================================
// User Schemas
// ============================================================================

export const userRoleSchema = z.enum(['ADMIN', 'EDITOR', 'VIEWER']);

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: userRoleSchema.default('VIEWER'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: userRoleSchema.optional(),
  locale: z.enum(['de', 'en']).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ============================================================================
// POI Schemas
// ============================================================================

export const poiStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED',
  'REVIEW_REQUIRED',
]);

export const createPoiSchema = z.object({
  externalId: z.string().optional(),
  name: z.string().min(1, 'Name is required').max(255),
  category: z.string().optional(),
  street: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().default('DE'),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  priority: z.coerce.number().int().min(0).max(100).default(0),
});

export const updatePoiSchema = createPoiSchema.partial();

export const bulkImportPoiSchema = z.object({
  pois: z.array(createPoiSchema).min(1).max(1000),
  overwrite: z.boolean().default(false),
});

export const poiFilterSchema = z.object({
  category: z.string().optional(),
  region: z.string().optional(),
  status: poiStatusSchema.optional(),
  minScore: z.coerce.number().min(0).max(100).optional(),
  maxScore: z.coerce.number().min(0).max(100).optional(),
  hasWebsite: z.boolean().optional(),
  ...paginationSchema.shape,
});

// ============================================================================
// Data Field Schemas
// ============================================================================

export const dataTypeSchema = z.enum([
  'STRING',
  'NUMBER',
  'BOOLEAN',
  'DATE',
  'TIME',
  'DATETIME',
  'URL',
  'EMAIL',
  'PHONE',
  'ADDRESS',
  'COORDINATES',
  'OPENING_HOURS',
  'PRICE_RANGE',
  'JSON',
]);

export const createDataFieldSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Invalid field name format'),
  displayName: z.object({
    de: z.string().min(1),
    en: z.string().min(1),
  }),
  description: z
    .object({
      de: z.string(),
      en: z.string(),
    })
    .optional(),
  schemaOrgType: z.string().optional(),
  schemaOrgProp: z.string().optional(),
  dataType: dataTypeSchema.default('STRING'),
  isRequired: z.boolean().default(false),
  isCore: z.boolean().default(false),
  displayOrder: z.coerce.number().int().min(0).default(0),
  category: z.string().optional(),
  extractionPrompt: z.string().optional(),
});

export const updateDataFieldSchema = createDataFieldSchema.partial();

// ============================================================================
// Schedule Schemas
// ============================================================================

export const cronExpressionSchema = z
  .string()
  .regex(
    /^(\*|([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])|\*\/([0-9]|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9])) (\*|([0-9]|1[0-9]|2[0-3])|\*\/([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|1[0-9]|2[0-9]|3[0-1])|\*\/([1-9]|1[0-9]|2[0-9]|3[0-1])) (\*|([1-9]|1[0-2])|\*\/([1-9]|1[0-2])) (\*|([0-6])|\*\/([0-6]))$/,
    'Invalid cron expression'
  );

export const createScheduleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  cronExpression: cronExpressionSchema,
  isActive: z.boolean().default(true),
  filters: z
    .object({
      region: z.string().optional(),
      category: z.string().optional(),
      maxScore: z.number().optional(),
    })
    .optional(),
});

export const updateScheduleSchema = createScheduleSchema.partial();

// ============================================================================
// Audit Schemas
// ============================================================================

export const startAuditSchema = z.object({
  poiIds: z.array(idSchema).min(1).max(100),
  priority: z.coerce.number().int().min(0).max(10).default(0),
});

export const auditResultSchema = z.object({
  overallScore: z.number().min(0).max(100),
  fieldScores: z.record(z.string(), z.number()),
  discrepancies: z.array(
    z.object({
      field: z.string(),
      tldbValue: z.string().nullable(),
      websiteValue: z.string().nullable(),
      mapsValue: z.string().nullable(),
      severity: z.enum(['low', 'medium', 'high']),
      recommendation: z.string(),
    })
  ),
  summary: z.string(),
});

// ============================================================================
// Report Schemas
// ============================================================================

export const reportTypeSchema = z.enum(['monthly', 'poi', 'region', 'category']);

export const generateReportSchema = z.object({
  type: reportTypeSchema,
  format: z.enum(['pdf', 'csv', 'json']).default('pdf'),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  filters: z
    .object({
      region: z.string().optional(),
      category: z.string().optional(),
      poiIds: z.array(idSchema).optional(),
    })
    .optional(),
});

// ============================================================================
// Settings Schemas
// ============================================================================

export const appConfigSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown(),
  description: z.string().optional(),
  category: z.string().optional(),
});

export const retentionConfigSchema = z.object({
  resource: z.string().min(1).max(50),
  days: z.coerce.number().int().min(1).max(3650),
  action: z.enum(['delete', 'archive']).default('delete'),
});

export const featureFlagSchema = z.object({
  key: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isEnabled: z.boolean().default(false),
  enabledForRoles: z.array(userRoleSchema).optional(),
  enabledForUsers: z.array(idSchema).optional(),
});

// ============================================================================
// API Response Schemas
// ============================================================================

export const apiErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const apiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  });

// ============================================================================
// Type Exports
// ============================================================================

export type UserRole = z.infer<typeof userRoleSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePoiInput = z.infer<typeof createPoiSchema>;
export type UpdatePoiInput = z.infer<typeof updatePoiSchema>;
export type PoiFilter = z.infer<typeof poiFilterSchema>;
export type CreateDataFieldInput = z.infer<typeof createDataFieldSchema>;
export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type StartAuditInput = z.infer<typeof startAuditSchema>;
export type AuditResult = z.infer<typeof auditResultSchema>;
export type GenerateReportInput = z.infer<typeof generateReportSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
