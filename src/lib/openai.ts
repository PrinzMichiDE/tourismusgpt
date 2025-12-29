import OpenAI from 'openai';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';
import { createLogger } from './logger';
import { retry } from './utils';
import prisma from './db';

const logger = createLogger('openai');

/**
 * OpenAI Client with custom base URL support
 */
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
});

/**
 * Default model configuration
 */
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';
const DEFAULT_MAX_TOKENS = parseInt(process.env.OPENAI_MAX_TOKENS || '4096', 10);
const DEFAULT_TEMPERATURE = parseFloat(process.env.OPENAI_TEMPERATURE || '0');

/**
 * Cost per 1K tokens (approximate, update as needed)
 */
const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
};

/**
 * Calculate cost from token usage
 */
function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = TOKEN_COSTS[model] || TOKEN_COSTS['gpt-4o'];
  return (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output;
}

/**
 * Track API cost
 */
async function trackCost(
  operation: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  poiId?: string
): Promise<void> {
  const totalCost = calculateCost(model, inputTokens, outputTokens);
  
  await prisma.costTracking.create({
    data: {
      service: 'openai',
      operation,
      poiId,
      units: inputTokens + outputTokens,
      unitCost: totalCost / (inputTokens + outputTokens),
      totalCost,
      metadata: {
        model,
        inputTokens,
        outputTokens,
      },
    },
  });
  
  logger.debug(
    { operation, model, inputTokens, outputTokens, totalCost },
    'API cost tracked'
  );
}

/**
 * Chat completion with structured output
 */
export async function chatCompletion<T extends z.ZodTypeAny>(options: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  schema: T;
  schemaName: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  poiId?: string;
}): Promise<z.infer<T>> {
  const {
    messages,
    schema,
    schemaName,
    model = DEFAULT_MODEL,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    poiId,
  } = options;
  
  return retry(
    async () => {
      const startTime = Date.now();
      
      const completion = await openai.beta.chat.completions.parse({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
        response_format: zodResponseFormat(schema, schemaName),
      });
      
      const duration = Date.now() - startTime;
      const usage = completion.usage;
      
      if (usage) {
        await trackCost(
          schemaName,
          model,
          usage.prompt_tokens,
          usage.completion_tokens,
          poiId
        );
      }
      
      logger.info(
        {
          model,
          duration,
          inputTokens: usage?.prompt_tokens,
          outputTokens: usage?.completion_tokens,
        },
        'Chat completion successful'
      );
      
      const parsed = completion.choices[0]?.message?.parsed;
      
      if (!parsed) {
        throw new Error('Failed to parse structured output');
      }
      
      return parsed;
    },
    {
      maxAttempts: 3,
      baseDelay: 1000,
      onRetry: (error, attempt) => {
        logger.warn({ error: error.message, attempt }, 'Retrying chat completion');
      },
    }
  );
}

/**
 * Simple text completion (no structured output)
 */
export async function textCompletion(options: {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  poiId?: string;
}): Promise<string> {
  const {
    prompt,
    systemPrompt = 'You are a helpful assistant.',
    model = DEFAULT_MODEL,
    maxTokens = DEFAULT_MAX_TOKENS,
    temperature = DEFAULT_TEMPERATURE,
    poiId,
  } = options;
  
  return retry(
    async () => {
      const startTime = Date.now();
      
      const completion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature,
      });
      
      const duration = Date.now() - startTime;
      const usage = completion.usage;
      
      if (usage) {
        await trackCost(
          'text_completion',
          model,
          usage.prompt_tokens,
          usage.completion_tokens,
          poiId
        );
      }
      
      logger.info(
        {
          model,
          duration,
          inputTokens: usage?.prompt_tokens,
          outputTokens: usage?.completion_tokens,
        },
        'Text completion successful'
      );
      
      return completion.choices[0]?.message?.content || '';
    },
    {
      maxAttempts: 3,
      baseDelay: 1000,
      onRetry: (error, attempt) => {
        logger.warn({ error: error.message, attempt }, 'Retrying text completion');
      },
    }
  );
}

/**
 * Embedding generation
 */
export async function createEmbedding(
  text: string,
  model = 'text-embedding-3-small'
): Promise<number[]> {
  const response = await openai.embeddings.create({
    model,
    input: text,
  });
  
  return response.data[0].embedding;
}

export default openai;
