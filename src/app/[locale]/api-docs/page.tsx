'use client';

import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// OpenAPI spec inline - in production, generate from zod-to-openapi
const apiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'LDB-DataGuard API',
    version: '1.0.0',
    description: 'API for POI quality assurance platform',
  },
  servers: [
    { url: '/api/v1', description: 'API v1' },
  ],
  paths: {
    '/pois': {
      get: {
        summary: 'List POIs',
        description: 'Get a paginated list of POIs with optional filtering',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20, maximum: 100 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'region', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED'] } },
          { name: 'minScore', in: 'query', schema: { type: 'number', minimum: 0, maximum: 100 } },
          { name: 'maxScore', in: 'query', schema: { type: 'number', minimum: 0, maximum: 100 } },
        ],
        responses: {
          '200': { description: 'Paginated list of POIs' },
          '400': { description: 'Validation error' },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        summary: 'Create POI',
        description: 'Create a new POI',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  externalId: { type: 'string' },
                  name: { type: 'string' },
                  category: { type: 'string' },
                  street: { type: 'string' },
                  postalCode: { type: 'string' },
                  city: { type: 'string' },
                  region: { type: 'string' },
                  website: { type: 'string', format: 'uri' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'POI created' },
          '400': { description: 'Validation error' },
          '409': { description: 'Duplicate external ID' },
        },
      },
    },
    '/pois/{id}': {
      get: {
        summary: 'Get POI',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'POI details' },
          '404': { description: 'Not found' },
        },
      },
      patch: {
        summary: 'Update POI',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'POI updated' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        summary: 'Delete POI',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '204': { description: 'POI deleted' },
          '404': { description: 'Not found' },
        },
      },
    },
    '/audits': {
      post: {
        summary: 'Start Audit',
        description: 'Queue audit jobs for specified POIs',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['poiIds'],
                properties: {
                  poiIds: { type: 'array', items: { type: 'string' } },
                  priority: { type: 'integer', minimum: 0, maximum: 10 },
                },
              },
            },
          },
        },
        responses: {
          '202': { description: 'Audits queued' },
        },
      },
    },
    '/health': {
      get: {
        summary: 'Health Check',
        responses: {
          '200': { description: 'System healthy' },
          '503': { description: 'System degraded' },
        },
      },
    },
  },
};

export default function ApiDocsPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'de';
  const isGerman = locale === 'de';
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-10 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">API {isGerman ? 'Dokumentation' : 'Documentation'}</h1>
            <p className="text-muted-foreground">
              {isGerman ? 'REST API Referenz für LDB-DataGuard' : 'REST API Reference for LDB-DataGuard'}
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/${locale}/dashboard`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {isGerman ? 'Zurück' : 'Back'}
            </Link>
          </Button>
        </div>
        
        {/* API Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {apiSpec.info.title}
              <Badge>v{apiSpec.info.version}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{apiSpec.info.description}</p>
            <p><strong>Base URL:</strong> <code>{apiSpec.servers[0].url}</code></p>
          </CardContent>
        </Card>
        
        {/* Endpoints */}
        <div className="space-y-6">
          {Object.entries(apiSpec.paths).map(([path, methods]) => (
            <Card key={path}>
              <CardHeader>
                <CardTitle className="font-mono text-lg">{path}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(methods).map(([method, details]: [string, any]) => (
                  <div key={method} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={method === 'get' ? 'default' : method === 'post' ? 'success' : method === 'delete' ? 'destructive' : 'secondary'}>
                        {method.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{details.summary}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{details.description}</p>
                    
                    {details.parameters && (
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-2">{isGerman ? 'Parameter' : 'Parameters'}</h4>
                        <div className="bg-muted rounded p-2 text-sm">
                          {details.parameters.map((p: any) => (
                            <div key={p.name} className="flex gap-2">
                              <code>{p.name}</code>
                              <span className="text-muted-foreground">({p.in})</span>
                              {p.required && <Badge variant="outline" className="text-xs">required</Badge>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">{isGerman ? 'Antworten' : 'Responses'}</h4>
                      <div className="flex gap-2 flex-wrap">
                        {Object.entries(details.responses).map(([code, resp]: [string, any]) => (
                          <Badge key={code} variant={code.startsWith('2') ? 'success' : 'outline'}>
                            {code}: {resp.description}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
