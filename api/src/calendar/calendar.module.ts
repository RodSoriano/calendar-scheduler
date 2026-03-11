import { Module } from '@nestjs/common';
import { TokenModule } from '../token/token.module';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';

@Module({
  imports: [TokenModule],
  controllers: [CalendarController],
  providers: [CalendarService],
})

export class CalendarModule {}
