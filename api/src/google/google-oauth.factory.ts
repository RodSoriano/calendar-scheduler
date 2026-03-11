import { google } from 'googleapis';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleOAuthFactory {
  constructor(private readonly config: ConfigService) {}

  create() {
    return new google.auth.OAuth2(
      this.config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      this.config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      this.config.getOrThrow<string>('GOOGLE_REDIRECT_URI'),
    );
  }
}
