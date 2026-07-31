import 'reflect-metadata';
import { validate } from './env.validation';

const requiredConfig = {
  DATABASE_URL: 'postgresql://postgres:password@localhost:5432/achromatic',
  JWT_SECRET: 'test-access-secret',
  JWT_REFRESH_SECRET: 'test-refresh-secret',
};

describe('environment validation', () => {
  it('preserves SMTP_SECURE=false from dotenv strings', () => {
    const config = validate({
      ...requiredConfig,
      SMTP_SECURE: 'false',
    });

    expect(config.SMTP_SECURE).toBe(false);
  });

  it('parses SMTP_SECURE=true from dotenv strings', () => {
    const config = validate({
      ...requiredConfig,
      SMTP_SECURE: 'true',
    });

    expect(config.SMTP_SECURE).toBe(true);
  });

  it('rejects ambiguous SMTP_SECURE values', () => {
    expect(() =>
      validate({
        ...requiredConfig,
        SMTP_SECURE: 'yes',
      }),
    ).toThrow('SMTP_SECURE must be either "true" or "false"');
  });
});
