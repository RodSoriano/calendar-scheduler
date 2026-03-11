import { User } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface GoogleProfile {
  googleId: string;
  email: string;
  name?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Creates the user on first login, updates profile info on subsequent logins
  async findOrCreate(profile: GoogleProfile): Promise<User> {
    return this.prisma.user.upsert({
      where: { googleId: profile.googleId },
      update: {
        email: profile.email,
        name: profile.name,
      },
      create: {
        googleId: profile.googleId,
        email: profile.email,
        name: profile.name,
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }
}
