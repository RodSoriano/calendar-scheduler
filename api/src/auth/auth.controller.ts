import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { AuthUser, RefreshUser } from './types/auth-user.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {
    // Passport handles the redirect to Google
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.issueTokens(req.user as User, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

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
