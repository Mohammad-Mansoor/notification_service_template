import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PresenceService {
  private readonly PRESENCE_PREFIX = 'presence:user:';
  private readonly logger = new Logger(PresenceService.name);
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.redis = new Redis(redisUrl);
  }

  /**
   * Register a socketId for a specific user session.
   */
  async register(userId: string, sessionId: string, socketId: string, metadata: any = {}) {
    const key = `${this.PRESENCE_PREFIX}${userId}`;
    const value = JSON.stringify({
      socketId,
      ...metadata,
      connectedAt: new Date().toISOString(),
    });

    await this.redis.hset(key, sessionId, value);
    // Set expiry for the whole hash to eventually clean up zombie data (e.g. 24h)
    await this.redis.expire(key, 86400); 
    
    this.logger.log(`Registered session ${sessionId} for user ${userId} (Socket: ${socketId}) in Redis`);
  }

  /**
   * Unregister a session.
   */
  async unregister(userId: string, sessionId: string) {
    const key = `${this.PRESENCE_PREFIX}${userId}`;
    await this.redis.hdel(key, sessionId);
    this.logger.log(`Unregistered session ${sessionId} for user ${userId}`);
  }

  /**
   * Get socketId for a specific user session.
   */
  async getSocketBySession(userId: string, sessionId: string): Promise<string | null> {
    const key = `${this.PRESENCE_PREFIX}${userId}`;
    const data = await this.redis.hget(key, sessionId);
    if (!data) return null;
    return JSON.parse(data).socketId;
  }

  /**
   * Get all active socketIds for a user (across all sessions).
   */
  async getAllUserSockets(userId: string): Promise<string[]> {
    const key = `${this.PRESENCE_PREFIX}${userId}`;
    const allSessions = await this.redis.hgetall(key);
    return Object.values(allSessions).map((val) => JSON.parse(val).socketId);
  }

  /**
   * Get all socketIds for a user EXCEPT a specific session.
   */
  async getOtherUserSockets(userId: string, excludeSessionId: string): Promise<string[]> {
    const key = `${this.PRESENCE_PREFIX}${userId}`;
    const allSessions = await this.redis.hgetall(key);
    return Object.entries(allSessions)
      .filter(([sessId]) => sessId !== excludeSessionId)
      .map(([_, val]) => JSON.parse(val).socketId);
  }
}
