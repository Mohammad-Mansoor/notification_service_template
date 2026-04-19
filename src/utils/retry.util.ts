import { AppLogger } from './logger.util';
import { StructuredLogger } from '../observability/logger.service';

/**
 * Smart Retry System for Providers
 * Distinguishes between transient (network) and permanent (auth) errors
 */
export const withSmartRetry = async <T>(
  operation: () => Promise<T>,
  logger: StructuredLogger,
  context: string,
  eventId: string,
  maxRetries = 4,
  baseDelayMs = 1000
): Promise<T> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      
      const isPermanentError = [400, 401, 403, 422].includes(error?.response?.status);
      if (isPermanentError) {
        logger.error(`Permanent Error format detected. Bypassing retries.`, error.stack, context, eventId);
        throw error; // Move to DLQ immediately without retrying
      }

      if (attempt >= maxRetries) {
        logger.error(`Operation failed after ${maxRetries} strict attempts. Routing to DLQ.`, error.stack, context, eventId);
        throw error;
      }
      
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      logger.warn(`Transient attempt ${attempt} failed. Retrying in ${delay}ms...`, context, eventId);
      
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
};
