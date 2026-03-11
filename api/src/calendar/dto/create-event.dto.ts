import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsEmail } from 'class-validator';
import { EventSource } from '@prisma/client';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsNotEmpty()
  startTime: string; // ISO 8601

  @IsString()
  @IsNotEmpty()
  endTime: string; // ISO 8601

  @IsString()
  @IsNotEmpty()
  timeZone: string; // IANA, e.g. 'America/New_York'

  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  attendees?: string[];

  @IsEnum(EventSource)
  @IsOptional()
  source?: EventSource = EventSource.APP;
}
