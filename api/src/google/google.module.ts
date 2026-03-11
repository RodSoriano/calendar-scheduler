import { Module } from '@nestjs/common';
import { GoogleOAuthFactory } from './google-oauth.factory';

@Module({
  providers: [GoogleOAuthFactory],
  exports: [GoogleOAuthFactory],
})

export class GoogleModule {}
