import { Injectable } from '@nestjs/common';
import { AppLogger } from '../../utils/logger.util';

@Injectable()
export class InAppRepository {
  /**
   * Represents writing to PostgreSQL, MongoDB, or Redis 
   * for the user to see the notification bell icon update in the frontend.
   */
  async saveNotification(userId: string | number, message: string): Promise<void> {
    // DB logic goes here
    AppLogger.log(`Saved In-App notification to Database for User ${userId}`, 'InAppRepository');
  }
}
