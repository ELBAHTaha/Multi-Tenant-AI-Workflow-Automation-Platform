import { PrismaClient, Role, ExecutionStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function seed(): Promise<void> {
  const prisma = new PrismaClient();
  const organization = await prisma.organization.upsert({
    where: { slug: 'default-org' },
    update: {},
    create: { name: 'Default Organization', slug: 'default-org' },
  });

  const user = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: await bcrypt.hash('password123', 10),
      role: Role.ADMIN,
      organizationId: organization.id,
    },
  });

  const workflow = await prisma.workflow.create({
    data: {
      name: 'Sample Workflow',
      definition: { nodes: [{ id: 'start', type: 'trigger', data: { label: 'Start' } }], edges: [] },
      organizationId: organization.id,
      createdById: user.id,
    },
  });

  await prisma.workflowExecution.create({
    data: {
      workflowId: workflow.id,
      organizationId: organization.id,
      status: ExecutionStatus.PENDING,
      logs: { create: [{ message: 'Execution queued', stepName: 'queue', status: ExecutionStatus.PENDING }] },
    },
  });

  await prisma.$disconnect();
}

void seed();
