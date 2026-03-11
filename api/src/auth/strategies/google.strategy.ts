import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UsersService } from '../../users/users.service';
import { TokenService } from '../../token/token.service';
import { Strategy, StrategyOptions, Profile, VerifyCallback } from 'passport-google-oauth20';

interface GoogleStrategyOptions extends StrategyOptions {
  accessType?: string;
  prompt?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
  ) {
    const options: GoogleStrategyOptions = {
      clientID: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: config.getOrThrow<string>('GOOGLE_REDIRECT_URI'),
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar.events'],
      accessType: 'offline',
      prompt: 'consent',
    };
    super(options);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const user = await this.usersService.findOrCreate({
        googleId: profile.id,
        email: profile.emails?.[0]?.value ?? '',
        name: profile.displayName,
      });

      await this.tokenService.saveTokens(user.id, {
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      done(null, user);
    } catch (err) {
      done(err as Error, false);
    }
  }
}
