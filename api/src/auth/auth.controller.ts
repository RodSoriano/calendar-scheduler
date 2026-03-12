import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { AuthUser, RefreshUser } from './types/auth-user.interface';
import { CalendarService } from '../calendar/calendar.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
    private readonly calendarService: CalendarService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Passport handles the redirect to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as User;
    const { accessToken, refreshToken } = await this.authService.issueTokens(user, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    try {
      const { count } = await this.calendarService.syncFromGoogle(user.id);
      this.logger.log(`[Auth] Initial sync for userId=${user.id}: ${count} events synced`);
    } catch (err) {
      this.logger.error(`[Auth] Initial sync failed for userId=${user.id}`, err);
    }

    const frontendUrl = this.config.getOrThrow<string>('FRONTEND_URL');
    return res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  refresh(@Req() req: Request) {
    const { userId, refreshToken } = req.user as RefreshUser;
    return this.authService.refreshTokens(userId, refreshToken, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAccessGuard)
  async logout(@Req() req: Request) {
    const { userId } = req.user as AuthUser;
    const refreshToken = req.headers['x-refresh-token'] as string | undefined;
    if (refreshToken) {
      await this.authService.logout(userId, refreshToken);
    }
  }

  @Get('me')
  @UseGuards(JwtAccessGuard)
  me(@Req() req: Request) {
    return req.user as AuthUser;
  }
}
