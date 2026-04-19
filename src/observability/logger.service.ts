import { Injectable, LoggerService } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class StructuredLogger implements LoggerService {
  private generateContext(context?: string, correlationId?: string) {
    return {
      timestamp: new Date().toISOString(),
      correlationId: correlationId || crypto.randomUUID(),
      context: context || 'Application',
    };
  }

  log(message: any, context?: string, correlationId?: string, meta?: any) {
    console.log(JSON.stringify({ level: 'info', message, ...this.generateContext(context, correlationId), ...meta }));
  }

  error(message: any, trace?: string, context?: string, correlationId?: string, meta?: any) {
    console.error(JSON.stringify({ level: 'error', message, trace, ...this.generateContext(context, correlationId), ...meta }));
  }

  warn(message: any, context?: string, correlationId?: string, meta?: any) {
    console.warn(JSON.stringify({ level: 'warn', message, ...this.generateContext(context, correlationId), ...meta }));
  }

  debug?(message: any, context?: string, correlationId?: string, meta?: any) {
    console.debug(JSON.stringify({ level: 'debug', message, ...this.generateContext(context, correlationId), ...meta }));
  }
}
