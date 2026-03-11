import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import type { StringValue } from 'ms';
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

interface TokenMeta {
  userAgent?: string;
  ipAddress?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async issueTokens(user: User, meta?: TokenMeta) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.getOrThrow<StringValue>('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.getOrThrow<StringValue>('JWT_REFRESH_EXPIRES_IN'),
    });

    const { exp } = this.jwt.decode(refreshToken) as { exp: number };

    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, BCRYPT_ROUNDS),
        expiresAt: new Date(exp * 1000),
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: string, incomingToken: string, meta?: TokenMeta) {
    const stored = await this.prisma.refreshToken.findMany({
      where: { userId, revoked: false, expiresAt: { gt: new Date() } },
    });

    let matched: (typeof stored)[number] | null = null;
    for (const t of stored) {
      if (await bcrypt.compare(incomingToken, t.tokenHash)) {
        matched = t;
        break;
      }
    }

    if (!matched) {
      // Possible token reuse attack, revoke all sessions
      await this.prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
      throw new UnauthorizedException('Invalid refresh token. All sessions revoked.');
    }

    await this.prisma.refreshToken.update({ where: { id: matched.id }, data: { revoked: true } });

    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return this.issueTokens(user, meta);
  }

  async logout(userId: string, incomingToken: string): Promise<void> {
    const stored = await this.prisma.refreshToken.findMany({
      where: { userId, revoked: false },
    });

    for (const t of stored) {
      if (await bcrypt.compare(incomingToken, t.tokenHash)) {
        await this.prisma.refreshToken.update({ where: { id: t.id }, data: { revoked: true } });
        return;
      }
    }
  }
}
