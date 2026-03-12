import { google } from 'googleapis';
import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { EventSource } from '@prisma/client';
import { TokenService } from '../token/token.service';
import { CreateEventDto } from './dto/create-event.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  private async fetchFromGoogle(userId: string, maxResults = 100) {
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

  async syncFromGoogle(userId: string): Promise<{ count: number }> {
    let items: Awaited<ReturnType<typeof this.fetchFromGoogle>>;
    try {
      items = await this.fetchFromGoogle(userId);
    } catch (err) {
      this.logger.error(`[Sync] Failed to fetch from Google for userId=${userId}`, err);
      throw err;
    }

    let count = 0;
    for (const item of items) {
      if (!item.id) continue;

      const startRaw = item.start?.dateTime ?? item.start?.date;
      const endRaw = item.end?.dateTime ?? item.end?.date;
      if (!startRaw || !endRaw) continue;

      const startTime = new Date(startRaw);
      const endTime = new Date(endRaw);
      const timeZone = item.start?.timeZone ?? item.end?.timeZone ?? 'UTC';
      const title = item.summary ?? '(No title)';

      const existing = await this.prisma.event.findFirst({
        where: { userId, googleEventId: item.id },
      });

      if (existing) {
        await this.prisma.event.update({
          where: { id: existing.id },
          data: { title, startTime, endTime, timeZone, description: item.description ?? null, location: item.location ?? null },
        });
      } else {
        await this.prisma.event.create({
          data: {
            userId,
            googleEventId: item.id,
            source: EventSource.GOOGLE,
            title,
            startTime,
            endTime,
            timeZone,
            description: item.description ?? null,
            location: item.location ?? null,
          },
        });
      }

      count++;
    }

    this.logger.log(`[Sync] userId=${userId}: ${count}/${items.length} events synced`);
    return { count };
  }

  async listEventsFromDb(userId: string) {
    return this.prisma.event.findMany({
      where: { userId },
      orderBy: { startTime: 'asc' },
    });
  }

  async createEvent(userId: string, dto: CreateEventDto) {
    const conflict = await this.prisma.event.findFirst({
      where: {
        userId,
        startTime: { lt: new Date(dto.endTime) },
        endTime: { gt: new Date(dto.startTime) },
      },
    });

    if (conflict) {
      throw new ConflictException(
        `Time conflict with existing event "${conflict.title}" (${conflict.startTime.toISOString()} – ${conflict.endTime.toISOString()})`,
      );
    }

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

    this.logger.log(`[Calendar] Event created: googleEventId=${gcalEvent.id} title="${dto.title}"`);

    return this.prisma.event.update({
      where: { id: event.id },
      data: { googleEventId: gcalEvent.id },
    });
  }
}
