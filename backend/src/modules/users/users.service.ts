import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UserUncheckedCreateInput): Promise<User> { return this.prisma.user.create({ data }); }
  findByEmail(email: string): Promise<User | null> { return this.prisma.user.findUnique({ where: { email } }); }
  findById(id: string): Promise<User | null> { return this.prisma.user.findUnique({ where: { id } }); }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshTokenHash: await bcrypt.hash(refreshToken, 10) } });
  }
}
