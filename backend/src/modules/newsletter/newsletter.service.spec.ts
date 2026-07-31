import { PrismaService } from '../../database/prisma.service';
import { NewsletterService } from './newsletter.service';

describe('NewsletterService', () => {
  const prisma = {
    newsletterSubscriber: {
      upsert: jest.fn(),
      updateMany: jest.fn(),
    },
  };
  let service: NewsletterService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NewsletterService(prisma as unknown as PrismaService);
  });

  it('normalizes and idempotently subscribes an email address', async () => {
    prisma.newsletterSubscriber.upsert.mockResolvedValue({
      id: 'subscriber-1',
    });

    await expect(
      service.subscribe('  CUSTOMER@Example.COM  '),
    ).resolves.toEqual(
      expect.objectContaining({ email: 'customer@example.com' }),
    );
    expect(prisma.newsletterSubscriber.upsert).toHaveBeenCalledWith({
      where: { email: 'customer@example.com' },
      update: {
        isActive: true,
        unsubscribedAt: null,
        subscribedAt: expect.any(Date) as unknown,
      },
      create: {
        email: 'customer@example.com',
        source: 'homepage',
      },
    });
  });

  it('makes unsubscribe safe to repeat for unknown addresses', async () => {
    prisma.newsletterSubscriber.updateMany.mockResolvedValue({ count: 0 });

    await expect(service.unsubscribe('CUSTOMER@example.com')).resolves.toEqual(
      expect.objectContaining({ message: expect.any(String) }),
    );
    expect(prisma.newsletterSubscriber.updateMany).toHaveBeenCalledWith({
      where: { email: 'customer@example.com' },
      data: {
        isActive: false,
        unsubscribedAt: expect.any(Date) as unknown,
      },
    });
  });
});
