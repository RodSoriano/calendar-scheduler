import { Credentials } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GoogleOAuthFactory } from '../google/google-oauth.factory';

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly oauthFactory: GoogleOAuthFactory,
  ) {}

  async saveTokens(userId: string, tokens: Credentials): Promise<void> {
    await this.prisma.googleToken.upsert({
      where: { userId },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? undefined,
        expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : undefined,
        tokenType: tokens.token_type ?? undefined,
        scope: tokens.scope ?? undefined,
      },
      create: {
        userId,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? undefined,
        expiryDate: tokens.expiry_date ? BigInt(tokens.expiry_date) : undefined,
        tokenType: tokens.token_type ?? undefined,
        scope: tokens.scope ?? undefined,
      },
    });
  }

  async getAuthenticatedClient(userId: string) {
    const record = await this.prisma.googleToken.findUnique({ where: { userId } });

    if (!record) {
      throw new UnauthorizedException('Google account not connected. Please visit /auth/google.');
    }

    const client = this.oauthFactory.create();

    client.setCredentials({
      access_token: record.accessToken,
      refresh_token: record.refreshToken ?? undefined,
      expiry_date: record.expiryDate ? Number(record.expiryDate) : undefined,
      token_type: record.tokenType ?? undefined,
      scope: record.scope ?? undefined,
    });

    // Persist auto-refreshed tokens so they survive app restarts
    client.on('tokens', async (newTokens: Credentials) => {
      await this.saveTokens(userId, {
        ...newTokens,
        refresh_token: newTokens.refresh_token ?? record.refreshToken ?? undefined,
      });
    });

    return client;
  }
}
