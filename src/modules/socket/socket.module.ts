import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SocketGateway } from './socket.gateway';
import { PresenceService } from './presence.service';
import { SocketConsumer } from './socket-consumer.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('SESSION_EXPIRY', '24h') as any },
      }),
    }),
  ],
  providers: [SocketGateway, PresenceService, SocketConsumer],
  exports: [SocketGateway, PresenceService],
})
export class SocketModule {}
