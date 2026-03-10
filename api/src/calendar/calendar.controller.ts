import type { Request } from 'express';
import { CalendarService } from './calendar.service';
import { CreateEventDto } from './dto/create-event.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import type { AuthUser } from '../auth/types/auth-user.interface';
import { Controller, Get, Post, Body, HttpCode, HttpStatus, UseGuards, Req } from '@nestjs/common';

@Controller('calendar')
@UseGuards(JwtAccessGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  listEvents(@Req() req: Request) {
    const { userId } = req.user as AuthUser;
    return this.calendarService.listUpcomingEvents(userId);
  }

  @Post('events')
  @HttpCode(HttpStatus.CREATED)
  createEvent(@Req() req: Request, @Body() dto: CreateEventDto) {
    const { userId } = req.user as AuthUser;
    return this.calendarService.createEvent(userId, dto);
  }
}
