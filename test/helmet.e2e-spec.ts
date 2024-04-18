import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupHelmet } from 'src/helmet.config';

describe('Helmet HTTP Headers', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    setupHelmet(app);  // Apply your custom Helmet configuration
    await app.init();
  });

  it('should include security headers on a public endpoint', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/items')  // public endpoint
      .expect(200);

    expect(response.headers['x-frame-options']).toEqual('DENY');
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
  });

  afterAll(async () => {
    await app.close();
  });
});
