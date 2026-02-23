import { Injectable } from '@nestjs/common';
import { Organization } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string, slug: string): Promise<Organization> {
    let candidate = slug;
    let i = 1;
    while (await this.prisma.organization.findUnique({ where: { slug: candidate } })) {
      candidate = `${slug}-${i}`;
      i += 1;
    }
    return this.prisma.organization.create({ data: { name, slug: candidate } });
  }
}
