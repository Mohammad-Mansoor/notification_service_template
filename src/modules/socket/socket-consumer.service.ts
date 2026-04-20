import { Injectable, Logger } from '@nestjs/common';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { SocketGateway } from './socket.gateway';
import { PresenceService } from './presence.service';

@Injectable()
export class SocketConsumer {
  private readonly logger = new Logger(SocketConsumer.name);

  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly presenceService: PresenceService,
  ) {}

  @RabbitSubscribe({
    exchange: 'notifications.exchange',
    routingKey: 'notification.socket',
    queue: 'socket-service-queue',
  })
  public async handleSocketEvent(msg: any) {
    this.logger.log(`Received socket event from RabbitMQ: ${JSON.stringify(msg)}`);

    const { type, payload } = msg;

    if (type === 'SESSION_REVOKED') {
      await this.handleSessionRevoked(payload);
    }
  }

  private async handleSessionRevoked(payload: any) {
    const { userId, sessionId, target, reason } = payload;
    let socketIdsToDisconnect: string[] = [];

    switch (target) {
      case 'SINGLE':
        const sid = await this.presenceService.getSocketBySession(userId, sessionId);
        if (sid) socketIdsToDisconnect.push(sid);
        break;

      case 'ALL':
        socketIdsToDisconnect = await this.presenceService.getAllUserSockets(userId);
        break;

      case 'OTHERS':
        socketIdsToDisconnect = await this.presenceService.getOtherUserSockets(userId, sessionId);
        break;
    }

    for (const socketId of socketIdsToDisconnect) {
      this.logger.log(`Emitting SESSION_TERMINATED to socket ${socketId}`);
      this.socketGateway.emitToSocket(socketId, 'SESSION_TERMINATED', { 
        reason: reason || 'Remote logout triggered' 
      });
      
      // Delay disconnect slightly to ensure the client receives the event
      setTimeout(() => {
        this.socketGateway.disconnectSocket(socketId);
      }, 1000);
    }
  }
}
