import { Injectable } from '@nestjs/common';
import CircuitBreaker from 'opossum';
import { StructuredLogger } from '../observability/logger.service';

@Injectable()
export class CircuitBreakerService {
  private readonly breakers = new Map<string, CircuitBreaker<any, any>>();

  constructor(private readonly logger: StructuredLogger) {}

  /**
   * Wraps an external API call in a persistent Circuit Breaker.
   */
  getBreaker<TArgs extends any[], TResult>(
    name: string,
    action: (...args: TArgs) => Promise<TResult>,
    options: CircuitBreaker.Options = {}
  ): CircuitBreaker<TArgs, TResult> {
    if (this.breakers.has(name)) {
      return this.breakers.get(name) as CircuitBreaker<TArgs, TResult>;
    }

    const defaultOptions: CircuitBreaker.Options = {
      timeout: 5000,          // Time out after 5s
      errorThresholdPercentage: 50, // Open breaker if 50% operations fail
      resetTimeout: 30000,    // Try again after 30s
      ...options,
    };


    

    const breaker = new CircuitBreaker(action, defaultOptions);

    breaker.fallback(() => {
      this.logger.warn(`Circuit [${name}] is currently OPEN/FAILING. Executed fallback mode.`);
      throw new Error(`[CIRCUIT BREAKER OPEN] ${name} is unavailable.`);
    });

    breaker.on('open', () => this.logger.error(`Circuit [${name}] OPENED! External provider is down.`));
    breaker.on('halfOpen', () => this.logger.warn(`Circuit [${name}] HALF-OPEN. Testing provider health...`));
    breaker.on('close', () => this.logger.log(`Circuit [${name}] CLOSED. Provider recovered.`));

    this.breakers.set(name, breaker);
    return breaker;
  }
}
