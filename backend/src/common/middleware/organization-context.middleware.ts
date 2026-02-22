import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class OrganizationContextMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/health')) {
      next();
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const token = authHeader.slice(7);
    const [, payloadB64] = token.split('.');

    if (payloadB64) {
      try {
        const payloadJson = Buffer.from(payloadB64, 'base64url').toString('utf-8');
        const payload = JSON.parse(payloadJson) as { organizationId?: string };
        if (payload.organizationId) {
          (req as Request & { organizationId?: string }).organizationId = payload.organizationId;
        }
      } catch {
        // JwtAuthGuard performs full verification. Middleware only enriches request context.
      }
    }

    next();
  }
}
