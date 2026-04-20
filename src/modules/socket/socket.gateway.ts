import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { Logger, OnModuleInit } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  },
  transports: ['websocket'],
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SocketGateway.name);

  constructor(
    private readonly presenceService: PresenceService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    this.logger.log('Socket.io Gateway initialized (Attached to main HTTP server)');
  }

  /**
   * Handle incoming socket connections.
   * Extracts identity (userId, sessionId) and registers in Redis.
   */
  async handleConnection(client: Socket) {
    try {
      const auth = client.handshake.auth;
      const token = auth?.token;

      this.logger.debug(`New connection attempt (Socket ID: ${client.id})`);

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided (Socket ID: ${client.id})`);
        client.disconnect();
        return;
      }

      // Verify JWT
      this.logger.debug(`Verifying token for socket ${client.id}...`);
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      const userId = payload.userId;
      const sessionId = payload.sessionId;

      this.logger.debug(`Token verified. UserId: ${userId}, SessionId: ${sessionId}`);

      if (!userId || !sessionId) {
        this.logger.warn(`Connection rejected: Invalid token payload (Socket ID: ${client.id})`);
        client.disconnect();
        return;
      }

      // Metadata from handshake
      const metadata = {
        fingerprint: auth.fingerprint,
        deviceName: auth.deviceName,
        deviceType: auth.deviceType,
      };

      // Check for existing socket in this session (One socket per session rule)
      const existingSocketId = await this.presenceService.getSocketBySession(userId, sessionId);
      if (existingSocketId) {
        this.logger.log(`Session ${sessionId} already has socket ${existingSocketId}. Overwriting with ${client.id}.`);
        
        // Use broadcast instead of local-only to ensure it works across cluster
        this.server.to(existingSocketId).emit('SESSION_TERMINATED', { 
          reason: 'New connection in another tab' 
        });
        
        // disconnectSockets works across cluster with Redis Adapter
        this.server.in(existingSocketId).disconnectSockets(true);
      }

      // Register in Redis
      await this.presenceService.register(userId, sessionId, client.id, metadata);

      // Save user info on socket instance
      client.data.userId = userId;
      client.data.sessionId = sessionId;

      this.logger.log(`User ${userId} (Session: ${sessionId}) connected via socket ${client.id}`);
    } catch (error) {
      this.logger.error(`Handshake error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const { userId, sessionId } = client.data;
    if (userId && sessionId) {
      await this.presenceService.unregister(userId, sessionId);
      this.logger.log(`User ${userId} (Session: ${sessionId}) disconnected (Socket ID: ${client.id})`);
    }
  }

  emitToSocket(socketId: string, event: string, data: any) {
    this.server.to(socketId).emit(event, data);
  }

  disconnectSocket(socketId: string) {
    this.server.in(socketId).disconnectSockets(true);
  }
}
