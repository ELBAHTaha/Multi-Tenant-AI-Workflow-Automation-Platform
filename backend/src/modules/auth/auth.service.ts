import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { OrganizationsService } from '../organizations/organizations.service';

interface AuthTokens { accessToken: string; refreshToken: string; }

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly organizationsService: OrganizationsService,
  ) {}

  async register(dto: RegisterDto): Promise<{ userId: string } & AuthTokens> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new BadRequestException('Email already registered');

    const orgSlug = dto.organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const organization = await this.organizationsService.create(dto.organizationName, orgSlug);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email, name: dto.name, passwordHash, role: Role.ADMIN, organizationId: organization.id,
    });

    const tokens = await this.generateTokens({ userId: user.id, email: user.email, role: user.role, organizationId: user.organizationId });
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return { userId: user.id, ...tokens };
  }

  async login(dto: LoginDto): Promise<{ userId: string } & AuthTokens> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens({ userId: user.id, email: user.email, role: user.role, organizationId: user.organizationId });
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return { userId: user.id, ...tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    let payload: { userId: string; email: string; role: Role; organizationId: string; type: 'refresh' };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, { secret: this.configService.get<string>('auth.refreshSecret') });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid refresh token type');

    const user = await this.usersService.findById(payload.userId);
    if (!user || !user.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateTokens({ userId: user.id, email: user.email, role: user.role, organizationId: user.organizationId });
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  private async generateTokens(payload: { userId: string; email: string; role: Role; organizationId: string }): Promise<AuthTokens> {
    const accessSecret = this.configService.get<string>('auth.accessSecret');
    const refreshSecret = this.configService.get<string>('auth.refreshSecret');
    const accessExpiresIn = this.configService.get<number>('auth.accessExpiresIn');
    const refreshExpiresIn = this.configService.get<number>('auth.refreshExpiresIn');

    if (!accessSecret || !refreshSecret || !accessExpiresIn || !refreshExpiresIn) throw new BadRequestException('Auth configuration is incomplete');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ ...payload, type: 'access' }, { secret: accessSecret, expiresIn: `${accessExpiresIn}s` }),
      this.jwtService.signAsync({ ...payload, type: 'refresh' }, { secret: refreshSecret, expiresIn: `${refreshExpiresIn}s` }),
    ]);

    return { accessToken, refreshToken };
  }
}
