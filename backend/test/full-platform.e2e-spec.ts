import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { ResponseEnvelopeInterceptor } from '../src/common/interceptors/response-envelope.interceptor';
import { AppModule } from '../src/app.module';

const BASE = '/api/v1';
const ADMIN = { email: 'admin@cybersave.local', password: 'Admin@123456' };
const PHONE = '+919988776655';
const runId = Date.now().toString(36);

type ApiResponse = {
  success: boolean;
  data?: Record<string, unknown>;
  meta?: Record<string, unknown>;
  error?: { message?: string };
};

function unwrap(body: ApiResponse) {
  if (!body.success) {
    throw new Error(body.error?.message ?? 'API request failed');
  }
  return body.data;
}

describe('Cybersave Full Platform (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let citizenToken: string;
  let citizenId: string;
  let mainServiceId: string;
  let subServiceId: string;
  let versionId: string;
  let docRequirementId: string;
  let applicationId: string;
  let paymentId: string;
  let adminUserId: string;

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
  }, 60000);

  afterAll(async () => {
    await app.close();
  });

  describe('1. Health & Auth', () => {
    it('GET /health', async () => {
      const res = await request(app.getHttpServer()).get(`${BASE}/health`).expect(200);
      expect(res.body.data.status).toMatch(/^(ok|degraded)$/);
    });

    it('POST /admin/auth/login', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE}/admin/auth/login`)
        .send(ADMIN)
        .expect(200);
      adminToken = res.body.data.accessToken;
      expect(adminToken).toBeTruthy();
    });

    it('GET /admin/auth/me', async () => {
      const res = await request(app.getHttpServer())
        .get(`${BASE}/admin/auth/me`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      adminUserId = res.body.data.id;
      expect(res.body.data.email).toBe(ADMIN.email);
    });

    it('PATCH /admin/auth/me', async () => {
      await request(app.getHttpServer())
        .patch(`${BASE}/admin/auth/me`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'Super', lastName: 'Admin' })
        .expect(200);
    });

    it('POST /auth/otp/request + verify', async () => {
      const otpRes = await request(app.getHttpServer())
        .post(`${BASE}/auth/otp/request`)
        .send({ phone: PHONE })
        .expect(200);
      const code = otpRes.body.data.devCode;
      expect(code).toBeTruthy();

      const verifyRes = await request(app.getHttpServer())
        .post(`${BASE}/auth/otp/verify`)
        .send({ phone: PHONE, code })
        .expect(200);
      citizenToken = verifyRes.body.data.accessToken;
      expect(citizenToken).toBeTruthy();
    });

    it('GET /auth/me', async () => {
      const res = await request(app.getHttpServer())
        .get(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);
      citizenId = res.body.data.id;
    });

    it('PATCH /auth/me', async () => {
      await request(app.getHttpServer())
        .patch(`${BASE}/auth/me`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ firstName: 'Test', lastName: 'Citizen' })
        .expect(200);
    });
  });

  describe('2. Admin — Service wizard & publish', () => {
    it('POST /admin/main-services', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE}/admin/main-services`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: `E2E Main ${runId}`, description: 'Integration test', isVisible: true })
        .expect(201);
      mainServiceId = res.body.data.id;
    });

    it('POST /admin/main-services/:id/sub-services', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE}/admin/main-services/${mainServiceId}/sub-services`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: `E2E Sub ${runId}`, description: 'Sub service test' })
        .expect(201);
      subServiceId = res.body.data.subService.id;
      versionId = res.body.data.draftVersionId;
    });

    it('PUT overview, form, documents, pricing', async () => {
      await request(app.getHttpServer())
        .put(`${BASE}/admin/service-versions/${versionId}/overview`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          displayName: `E2E Certificate ${runId}`,
          shortDescription: 'Test service',
          department: 'Revenue',
          processingTime: '7 days',
        })
        .expect(200);

      await request(app.getHttpServer())
        .put(`${BASE}/admin/service-versions/${versionId}/form`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fields: [
            {
              key: 'fullName',
              label: 'Full Name',
              type: 'TEXT',
              required: true,
              sortOrder: 0,
            },
            {
              key: 'address',
              label: 'Address',
              type: 'TEXTAREA',
              required: false,
              sortOrder: 1,
            },
          ],
        })
        .expect(200);

      const docRes = await request(app.getHttpServer())
        .put(`${BASE}/admin/service-versions/${versionId}/documents`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          requirements: [
            {
              name: 'Identity Proof',
              required: true,
              allowedFormats: ['pdf'],
              allowedMimeTypes: ['application/pdf'],
              maxFileSizeBytes: 5 * 1024 * 1024,
              sortOrder: 0,
            },
          ],
        })
        .expect(200);

      const bundle = docRes.body.data as { documentRequirements?: Array<{ id: string }> };
      docRequirementId = bundle.documentRequirements?.[0]?.id ?? '';

      await request(app.getHttpServer())
        .put(`${BASE}/admin/service-versions/${versionId}/pricing`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ baseFee: 100, taxEnabled: false, currency: 'INR' })
        .expect(200);
    });

    it('POST validate + publish', async () => {
      const validateRes = await request(app.getHttpServer())
        .post(`${BASE}/admin/service-versions/${versionId}/validate`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);
      expect(validateRes.body.data.valid).toBe(true);

      await request(app.getHttpServer())
        .post(`${BASE}/admin/service-versions/${versionId}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);
    });

    it('GET /admin/main-services list + detail', async () => {
      await request(app.getHttpServer())
        .get(`${BASE}/admin/main-services`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      await request(app.getHttpServer())
        .get(`${BASE}/admin/main-services/${mainServiceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('3. Citizen — Catalogue sync', () => {
    it('GET /services includes published sub-service', async () => {
      const res = await request(app.getHttpServer())
        .get(`${BASE}/services`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);
      const catalog = res.body.data as Array<{ subServices: Array<{ id: string }> }>;
      const found = catalog.some(m => m.subServices.some(s => s.id === subServiceId));
      expect(found).toBe(true);
    });

    it('GET /services/sub/:id/configuration', async () => {
      const res = await request(app.getHttpServer())
        .get(`${BASE}/services/sub/${subServiceId}/configuration`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);
      const config = res.body.data as { form?: { fields?: unknown[] } };
      expect(config.form?.fields?.length).toBeGreaterThan(0);
    });
  });

  describe('4. Citizen — Full application flow', () => {
    it('POST /applications (draft)', async () => {
      const res = await request(app.getHttpServer())
        .post(`${BASE}/applications`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ subServiceId })
        .expect(201);
      applicationId = res.body.data.id;
    });

    it('PATCH /applications/:id/form', async () => {
      await request(app.getHttpServer())
        .patch(`${BASE}/applications/${applicationId}/form`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ values: { fullName: 'Raj Kumar', address: 'Hyderabad' } })
        .expect(200);
    });

    it('POST upload request → PUT file → complete', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post(`${BASE}/applications/${applicationId}/uploads/request`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          documentRequirementId: docRequirementId,
          originalFileName: 'id.pdf',
          mimeType: 'application/pdf',
        })
        .expect(201);

      const session = uploadRes.body.data as {
        uploadUrl: string;
        method: string;
        storedFileId: string;
        uploadSessionId: string;
      };

      const uploadPath = session.uploadUrl.replace(/^https?:\/\/[^/]+/, '');
      await request(app.getHttpServer())
        [session.method.toLowerCase() as 'put'](uploadPath)
        .set('Content-Type', 'application/pdf')
        .send(Buffer.from('%PDF-1.4 e2e test'))
        .expect(200);

      await request(app.getHttpServer())
        .post(`${BASE}/applications/${applicationId}/uploads/complete`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          uploadSessionId: session.uploadSessionId,
          storedFileId: session.storedFileId,
        })
        .expect(201);
    });

    it('POST validate + payment + mock capture + submit', async () => {
      await request(app.getHttpServer())
        .post(`${BASE}/applications/${applicationId}/validate`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(201);

      const payRes = await request(app.getHttpServer())
        .post(`${BASE}/applications/${applicationId}/payment-intent`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ idempotencyKey: `e2e-${runId}` })
        .expect(201);
      paymentId = payRes.body.data.paymentId;

      await request(app.getHttpServer())
        .post(`${BASE}/webhooks/payments/mock`)
        .send({ paymentId })
        .expect(201);

      const submitRes = await request(app.getHttpServer())
        .post(`${BASE}/applications/${applicationId}/submit`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(201);
      expect(submitRes.body.data.status).toBe('SUBMITTED');
    });

    it('GET /applications lists submitted app', async () => {
      const res = await request(app.getHttpServer())
        .get(`${BASE}/applications`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);
      const payload = res.body.data as Array<{ id: string }> | { data?: Array<{ id: string }> };
      const items = Array.isArray(payload) ? payload : payload.data ?? [];
      expect(items.some(a => a.id === applicationId)).toBe(true);
    });
  });

  describe('5. Admin — Application processing & sync', () => {
    it('GET /admin/applications finds citizen submission', async () => {
      const res = await request(app.getHttpServer())
        .get(`${BASE}/admin/applications`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const items = res.body.data as Array<{ id: string }>;
      expect(items.some(a => a.id === applicationId)).toBe(true);
    });

    it('GET detail, transitions, assign, note', async () => {
      await request(app.getHttpServer())
        .get(`${BASE}/admin/applications/${applicationId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const transRes = await request(app.getHttpServer())
        .get(`${BASE}/admin/applications/${applicationId}/transitions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const transitionPayload = transRes.body.data as { transitions?: unknown[] } | unknown[];
      const transitions = Array.isArray(transitionPayload)
        ? transitionPayload
        : transitionPayload.transitions ?? [];
      expect(Array.isArray(transitions)).toBe(true);

      await request(app.getHttpServer())
        .post(`${BASE}/admin/applications/${applicationId}/assign`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ operatorId: adminUserId })
        .expect(201);

      await request(app.getHttpServer())
        .post(`${BASE}/admin/applications/${applicationId}/notes`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: 'E2E internal note' })
        .expect(201);
    });

    it('ACTION_REQUIRED → citizen correction → admin sees update', async () => {
      await request(app.getHttpServer())
        .post(`${BASE}/admin/applications/${applicationId}/action-required`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Address unclear',
          instructions: 'Please provide full address',
          requiredFieldKeys: ['address'],
        })
        .expect(201);

      const citizenDetail = await request(app.getHttpServer())
        .get(`${BASE}/applications/${applicationId}`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);
      expect(citizenDetail.body.data.status).toBe('ACTION_REQUIRED');

      await request(app.getHttpServer())
        .post(`${BASE}/applications/${applicationId}/corrections/submit`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ values: { address: '123 Main Road, Hyderabad' } })
        .expect(201);
    });
  });

  describe('6. Dashboard, audit, payments, users', () => {
    it('Dashboard analytics endpoints', async () => {
      const endpoints = [
        '/admin/dashboard/summary',
        '/admin/dashboard/revenue-trends?days=7',
        '/admin/dashboard/application-trends?days=7',
        '/admin/dashboard/service-share',
        '/admin/dashboard/operator-logs',
        '/admin/dashboard/document-activity?days=7',
      ];
      for (const path of endpoints) {
        await request(app.getHttpServer())
          .get(`${BASE}${path}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);
      }
    });

    it('GET /admin/audit-logs', async () => {
      await request(app.getHttpServer())
        .get(`${BASE}/admin/audit-logs?page=1&limit=10`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /admin/payments', async () => {
      await request(app.getHttpServer())
        .get(`${BASE}/admin/payments?page=1&limit=10`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /admin/citizens + /admin/admin-users', async () => {
      await request(app.getHttpServer())
        .get(`${BASE}/admin/citizens?page=1&limit=10`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      await request(app.getHttpServer())
        .get(`${BASE}/admin/admin-users?page=1&limit=10`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      await request(app.getHttpServer())
        .get(`${BASE}/admin/admin-users/${adminUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('7. Notifications & support', () => {
    it('Citizen notifications + support ticket', async () => {
      await request(app.getHttpServer())
        .get(`${BASE}/notifications?page=1&limit=10`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);

      const ticketRes = await request(app.getHttpServer())
        .post(`${BASE}/support/tickets`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({ subject: 'E2E help', content: 'Test ticket body' })
        .expect(201);
      const ticketId = ticketRes.body.data.id;

      await request(app.getHttpServer())
        .get(`${BASE}/support/tickets`)
        .set('Authorization', `Bearer ${citizenToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`${BASE}/admin/support/tickets`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`${BASE}/admin/support/tickets/${ticketId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('Admin send notification to citizen', async () => {
      await request(app.getHttpServer())
        .post(`${BASE}/admin/notifications/send`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'E2E Notice',
          body: 'Your application is being processed',
          citizenIds: [citizenId],
        })
        .expect(201);
    });
  });
});
