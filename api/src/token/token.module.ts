import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { GoogleModule } from '../google/google.module';

@Module({
  imports: [GoogleModule],
  providers: [TokenService],
  exports: [TokenService],
})

export class TokenModule {}
