import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '@prisma/client';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService, private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: unknown;
      tenant?: { organizationId: string; userId: string };
    }>();
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedException('Missing bearer token');

    const token = authHeader.slice(7);
    try {
      const payload = await this.jwtService.verifyAsync<{
        userId: string;
        email: string;
        role: Role;
        organizationId: string;
        type: 'access';
      }>(token, { secret: this.configService.get<string>('auth.accessSecret') });
      request.user = payload;
      request.tenant = {
        organizationId: payload.organizationId,
        userId: payload.userId,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
