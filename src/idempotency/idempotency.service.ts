import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IdempotencyService {
  private readonly redisClient: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redisClient = new Redis(this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379');
  }

  /**
   * Checks if an event has already been processed for a specific channel.
   * Atomic SETNX prevents race conditions inside horizontally scaled clusters.
   */
  async checkAndSet(eventId: string, channel: string, ttlSeconds = 86400): Promise<boolean> {
    const key = `idempotency:notification:${eventId}:${channel}`;
    
    // Set Only If Not Exists (SETNX equivalent via ioredis)
    const result = await this.redisClient.set(key, 'PROCESSED', 'EX', ttlSeconds, 'NX');
    
    // If result is OK, it was just set. If null, it already existed (Duplicate Message!)
    return result === 'OK';
  }

  async clearRedisConnection() {
    await this.redisClient.quit();
  }
}
