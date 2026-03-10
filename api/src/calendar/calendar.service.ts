import { google } from 'googleapis';
import { Injectable } from '@nestjs/common';
import { EventSource } from '@prisma/client';
import { TokenService } from '../token/token.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async listUpcomingEvents(userId: string, maxResults = 20) {
    const auth = await this.tokenService.getAuthenticatedClient(userId);
    const calendar = google.calendar({ version: 'v3', auth });

    const { data } = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return data.items ?? [];
  }

  async createEvent(userId: string, dto: CreateEventDto) {
    const event = await this.prisma.event.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        location: dto.location,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        timeZone: dto.timeZone,
        source: dto.source ?? EventSource.APP,
      },
    });

    if (dto.source === EventSource.GOOGLE) {
      const auth = await this.tokenService.getAuthenticatedClient(userId);
      const calendar = google.calendar({ version: 'v3', auth });

      const { data: gcalEvent } = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: dto.title,
          description: dto.description,
          location: dto.location,
          start: { dateTime: dto.startTime, timeZone: dto.timeZone },
          end: { dateTime: dto.endTime, timeZone: dto.timeZone },
          attendees: dto.attendees?.map((email) => ({ email })),
        },
      });

      return this.prisma.event.update({
        where: { id: event.id },
        data: { googleEventId: gcalEvent.id },
      });
    }

    return event;
  }
}
