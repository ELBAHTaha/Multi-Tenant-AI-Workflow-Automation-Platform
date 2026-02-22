import { Module } from '@nestjs/common';
import { ExecutionsService } from './executions.service';

@Module({ providers: [ExecutionsService], exports: [ExecutionsService] })
export class ExecutionsModule {}
