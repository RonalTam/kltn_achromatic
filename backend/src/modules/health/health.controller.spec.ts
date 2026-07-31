import type { Response } from 'express';
import { PrismaService } from '../../database/prisma.service';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  const prisma = {
    $queryRaw: jest.fn(),
  };
  const response = {
    status: jest.fn(),
  };
  let controller: HealthController;

  beforeEach(() => {
    jest.clearAllMocks();
    response.status.mockReturnValue(response);
    controller = new HealthController(prisma as unknown as PrismaService);
  });

  it('reports API and database readiness', async () => {
    prisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

    await expect(
      controller.check(response as unknown as Response),
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'ok',
        database: 'up',
        databaseLatencyMs: expect.any(Number) as unknown,
        uptimeSeconds: expect.any(Number) as unknown,
        timestamp: expect.any(String) as unknown,
      }),
    );
    expect(response.status).not.toHaveBeenCalled();
  });

  it('returns a degraded 503 response when the database is unavailable', async () => {
    prisma.$queryRaw.mockRejectedValue(new Error('database offline'));

    await expect(
      controller.check(response as unknown as Response),
    ).resolves.toEqual(
      expect.objectContaining({ status: 'degraded', database: 'down' }),
    );
    expect(response.status).toHaveBeenCalledWith(503);
  });
});
