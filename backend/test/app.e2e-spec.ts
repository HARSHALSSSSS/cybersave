import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { ResponseEnvelopeInterceptor } from '../src/common/interceptors/response-envelope.interceptor';
import { AppModule } from '../src/app.module';

describe('Cybersave API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns status payload', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toMatchObject({
          status: expect.stringMatching(/^(ok|degraded)$/),
          services: expect.objectContaining({
            database: expect.stringMatching(/^(up|down)$/),
          }),
        });
      });
  });

  it('POST /api/v1/auth/otp/request validates phone', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/otp/request')
      .send({})
      .expect(400);
  });

  it('POST /api/v1/admin/auth/login rejects invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/api/v1/admin/auth/login')
      .send({ email: 'invalid@example.com', password: 'wrong' })
      .expect(401);
  });
});
