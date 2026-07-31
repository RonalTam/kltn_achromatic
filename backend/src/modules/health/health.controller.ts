import { Controller, Get, Header, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  @Header('Cache-Control', 'no-store')
  @ApiOperation({ summary: 'Check API and database readiness' })
  async check(@Res({ passthrough: true }) response: Response) {
    const startedAt = process.hrtime.bigint();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const latencyMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      return {
        status: 'ok',
        database: 'up',
        databaseLatencyMs: Number(latencyMs.toFixed(2)),
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      };
    } catch {
      response.status(HttpStatus.SERVICE_UNAVAILABLE);
      return {
        status: 'degraded',
        database: 'down',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      };
    }
  }
}
