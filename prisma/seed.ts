import { PrismaClient, DataType, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Schema.org Standard Data Fields
 * Based on Place, LocalBusiness, Restaurant types
 */
const schemaOrgFields = [
  // Basic Information
  {
    name: 'name',
    displayName: { de: 'Name', en: 'Name' },
    description: { de: 'Der offizielle Name des POI', en: 'The official name of the POI' },
    schemaOrgType: 'Place',
    schemaOrgProp: 'name',
    dataType: DataType.STRING,
    isRequired: true,
    isCore: true,
    displayOrder: 1,
    category: 'basic',
  },
  {
    name: 'description',
    displayName: { de: 'Beschreibung', en: 'Description' },
    description: { de: 'Eine kurze Beschreibung des POI', en: 'A short description of the POI' },
    schemaOrgType: 'Place',
    schemaOrgProp: 'description',
    dataType: DataType.STRING,
    isRequired: false,
    isCore: true,
    displayOrder: 2,
    category: 'basic',
  },
  
  // Address
  {
    name: 'streetAddress',
    displayName: { de: 'Straße', en: 'Street Address' },
    description: { de: 'Straße und Hausnummer', en: 'Street and house number' },
    schemaOrgType: 'PostalAddress',
    schemaOrgProp: 'streetAddress',
    dataType: DataType.STRING,
    isRequired: true,
    isCore: true,
    displayOrder: 10,
    category: 'address',
  },
  {
    name: 'postalCode',
    displayName: { de: 'PLZ', en: 'Postal Code' },
    description: { de: 'Postleitzahl', en: 'Postal/ZIP code' },
    schemaOrgType: 'PostalAddress',
    schemaOrgProp: 'postalCode',
    dataType: DataType.STRING,
    isRequired: true,
    isCore: true,
    displayOrder: 11,
    category: 'address',
  },
  {
    name: 'addressLocality',
    displayName: { de: 'Ort', en: 'City' },
    description: { de: 'Stadt oder Gemeinde', en: 'City or municipality' },
    schemaOrgType: 'PostalAddress',
    schemaOrgProp: 'addressLocality',
    dataType: DataType.STRING,
    isRequired: true,
    isCore: true,
    displayOrder: 12,
    category: 'address',
  },
  {
    name: 'addressRegion',
    displayName: { de: 'Region', en: 'Region' },
    description: { de: 'Bundesland oder Region', en: 'State or region' },
    schemaOrgType: 'PostalAddress',
    schemaOrgProp: 'addressRegion',
    dataType: DataType.STRING,
    isRequired: false,
    isCore: true,
    displayOrder: 13,
    category: 'address',
  },
  {
    name: 'addressCountry',
    displayName: { de: 'Land', en: 'Country' },
    description: { de: 'Land (ISO Code)', en: 'Country (ISO code)' },
    schemaOrgType: 'PostalAddress',
    schemaOrgProp: 'addressCountry',
    dataType: DataType.STRING,
    isRequired: false,
    isCore: true,
    displayOrder: 14,
    category: 'address',
  },
  
  // Coordinates
  {
    name: 'latitude',
    displayName: { de: 'Breitengrad', en: 'Latitude' },
    description: { de: 'Geografischer Breitengrad', en: 'Geographic latitude' },
    schemaOrgType: 'GeoCoordinates',
    schemaOrgProp: 'latitude',
    dataType: DataType.NUMBER,
    isRequired: false,
    isCore: true,
    displayOrder: 15,
    category: 'address',
  },
  {
    name: 'longitude',
    displayName: { de: 'Längengrad', en: 'Longitude' },
    description: { de: 'Geografischer Längengrad', en: 'Geographic longitude' },
    schemaOrgType: 'GeoCoordinates',
    schemaOrgProp: 'longitude',
    dataType: DataType.NUMBER,
    isRequired: false,
    isCore: true,
    displayOrder: 16,
    category: 'address',
  },
  
  // Contact
  {
    name: 'telephone',
    displayName: { de: 'Telefon', en: 'Phone' },
    description: { de: 'Telefonnummer', en: 'Phone number' },
    schemaOrgType: 'LocalBusiness',
    schemaOrgProp: 'telephone',
    dataType: DataType.PHONE,
    isRequired: false,
    isCore: true,
    displayOrder: 20,
    category: 'contact',
  },
  {
    name: 'email',
    displayName: { de: 'E-Mail', en: 'Email' },
    description: { de: 'E-Mail-Adresse', en: 'Email address' },
    schemaOrgType: 'LocalBusiness',
    schemaOrgProp: 'email',
    dataType: DataType.EMAIL,
    isRequired: false,
    isCore: true,
    displayOrder: 21,
    category: 'contact',
  },
  {
    name: 'url',
    displayName: { de: 'Website', en: 'Website' },
    description: { de: 'Offizielle Website', en: 'Official website' },
    schemaOrgType: 'LocalBusiness',
    schemaOrgProp: 'url',
    dataType: DataType.URL,
    isRequired: false,
    isCore: true,
    displayOrder: 22,
    category: 'contact',
  },
  
  // Business Details
  {
    name: 'openingHours',
    displayName: { de: 'Öffnungszeiten', en: 'Opening Hours' },
    description: { de: 'Reguläre Öffnungszeiten', en: 'Regular opening hours' },
    schemaOrgType: 'LocalBusiness',
    schemaOrgProp: 'openingHoursSpecification',
    dataType: DataType.OPENING_HOURS,
    isRequired: false,
    isCore: true,
    displayOrder: 30,
    category: 'business',
    normalization: {
      format: 'Mo-Fr 09:00-18:00',
      examples: ['Mo-Fr 9-18', 'Monday-Friday 9am-6pm', 'Montag bis Freitag 9-18 Uhr'],
    },
  },
  {
    name: 'priceRange',
    displayName: { de: 'Preisklasse', en: 'Price Range' },
    description: { de: 'Preiskategorie (€ bis €€€€)', en: 'Price category (€ to €€€€)' },
    schemaOrgType: 'LocalBusiness',
    schemaOrgProp: 'priceRange',
    dataType: DataType.PRICE_RANGE,
    isRequired: false,
    isCore: true,
    displayOrder: 31,
    category: 'business',
  },
  {
    name: 'paymentAccepted',
    displayName: { de: 'Zahlungsmethoden', en: 'Payment Methods' },
    description: { de: 'Akzeptierte Zahlungsmethoden', en: 'Accepted payment methods' },
    schemaOrgType: 'LocalBusiness',
    schemaOrgProp: 'paymentAccepted',
    dataType: DataType.JSON,
    isRequired: false,
    isCore: true,
    displayOrder: 32,
    category: 'business',
  },
  
  // Restaurant-specific
  {
    name: 'servesCuisine',
    displayName: { de: 'Küche', en: 'Cuisine' },
    description: { de: 'Art der Küche', en: 'Type of cuisine' },
    schemaOrgType: 'Restaurant',
    schemaOrgProp: 'servesCuisine',
    dataType: DataType.STRING,
    isRequired: false,
    isCore: false,
    displayOrder: 40,
    category: 'restaurant',
  },
  {
    name: 'hasMenu',
    displayName: { de: 'Speisekarte', en: 'Menu' },
    description: { de: 'Link zur Speisekarte', en: 'Link to menu' },
    schemaOrgType: 'Restaurant',
    schemaOrgProp: 'hasMenu',
    dataType: DataType.URL,
    isRequired: false,
    isCore: false,
    displayOrder: 41,
    category: 'restaurant',
  },
  {
    name: 'acceptsReservations',
    displayName: { de: 'Reservierungen', en: 'Reservations' },
    description: { de: 'Akzeptiert Reservierungen', en: 'Accepts reservations' },
    schemaOrgType: 'Restaurant',
    schemaOrgProp: 'acceptsReservations',
    dataType: DataType.BOOLEAN,
    isRequired: false,
    isCore: false,
    displayOrder: 42,
    category: 'restaurant',
  },
];

/**
 * Default Retention Configurations
 */
const retentionConfigs = [
  { resource: 'audit_logs', days: 365, action: 'archive' },
  { resource: 'extracted_values', days: 90, action: 'delete' },
  { resource: 'failed_jobs', days: 30, action: 'delete' },
  { resource: 'scraped_content', days: 7, action: 'delete' },
  { resource: 'mail_outbox', days: 90, action: 'archive' },
  { resource: 'cost_tracking', days: 365, action: 'archive' },
];

/**
 * Default Feature Flags
 */
const featureFlags = [
  { 
    key: '2fa_enabled', 
    name: 'Two-Factor Authentication',
    description: 'Enable 2FA for user accounts',
    isEnabled: false,
  },
  { 
    key: 'google_oauth', 
    name: 'Google OAuth',
    description: 'Allow login with Google',
    isEnabled: false,
  },
  { 
    key: 'github_oauth', 
    name: 'GitHub OAuth',
    description: 'Allow login with GitHub',
    isEnabled: false,
  },
  { 
    key: 'pdf_reports', 
    name: 'PDF Reports',
    description: 'Enable PDF report generation',
    isEnabled: true,
  },
  { 
    key: 'cost_tracking', 
    name: 'Cost Tracking',
    description: 'Track API costs',
    isEnabled: true,
  },
  { 
    key: 'auto_audit', 
    name: 'Automatic Audits',
    description: 'Enable scheduled automatic audits',
    isEnabled: true,
  },
];

/**
 * Default App Configuration
 */
const appConfigs = [
  { 
    key: 'scraper.rate_limit_ms', 
    value: 1000,
    description: 'Rate limit between scraper requests in milliseconds',
    category: 'scraper',
  },
  { 
    key: 'scraper.max_depth', 
    value: 3,
    description: 'Maximum crawl depth for website scraping',
    category: 'scraper',
  },
  { 
    key: 'audit.score_threshold', 
    value: 80,
    description: 'Score threshold for triggering notifications',
    category: 'audit',
  },
  { 
    key: 'audit.llm_model', 
    value: 'gpt-4o',
    description: 'LLM model for auditing',
    category: 'audit',
  },
  { 
    key: 'mail.spam_protection_days', 
    value: 30,
    description: 'Days between duplicate notification emails',
    category: 'mail',
  },
  { 
    key: 'ui.default_theme', 
    value: 'system',
    description: 'Default UI theme (light, dark, system)',
    category: 'ui',
  },
  { 
    key: 'ui.default_locale', 
    value: 'de',
    description: 'Default UI language',
    category: 'ui',
  },
];

async function main() {
  console.log('🌱 Starting seed...');
  
  // Create admin user
  console.log('👤 Creating admin user...');
  const passwordHash = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@ldb-dataguard.de' },
    update: {},
    create: {
      email: 'admin@ldb-dataguard.de',
      name: 'Admin User',
      passwordHash,
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });
  
  // Create Schema.org data fields
  console.log('📋 Creating Schema.org data fields...');
  for (const field of schemaOrgFields) {
    await prisma.dataField.upsert({
      where: { name: field.name },
      update: field,
      create: field,
    });
  }
  console.log(`   ✓ Created ${schemaOrgFields.length} data fields`);
  
  // Create retention configs
  console.log('🗄️ Creating retention configurations...');
  for (const config of retentionConfigs) {
    await prisma.retentionConfig.upsert({
      where: { resource: config.resource },
      update: config,
      create: config,
    });
  }
  console.log(`   ✓ Created ${retentionConfigs.length} retention configs`);
  
  // Create feature flags
  console.log('🚩 Creating feature flags...');
  for (const flag of featureFlags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: flag,
      create: flag,
    });
  }
  console.log(`   ✓ Created ${featureFlags.length} feature flags`);
  
  // Create app configs
  console.log('⚙️ Creating app configurations...');
  for (const config of appConfigs) {
    await prisma.appConfig.upsert({
      where: { key: config.key },
      update: { value: config.value, description: config.description, category: config.category },
      create: config,
    });
  }
  console.log(`   ✓ Created ${appConfigs.length} app configs`);
  
  // Create default schedule
  console.log('📅 Creating default schedule...');
  await prisma.scheduleConfig.upsert({
    where: { name: 'daily-audit' },
    update: {},
    create: {
      name: 'daily-audit',
      description: 'Daily audit of all POIs with score < 80',
      cronExpression: '0 2 * * *', // Every day at 2 AM
      isActive: false,
      filters: { maxScore: 80 },
    },
  });
  
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
