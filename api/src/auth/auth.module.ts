import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { TokenModule } from '../token/token.module';
import { UsersModule } from '../users/users.module';
import { GoogleModule } from '../google/google.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
  imports: [
    PassportModule,
    // JwtModule is registered here but strategies read secrets from ConfigService directly
    // so we don't pass a secret here, each strategy handles its own secret
    JwtModule.register({}),
    GoogleModule,
    TokenModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    GoogleStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
  ],
  exports: [AuthService],
})

export class AuthModule {}
