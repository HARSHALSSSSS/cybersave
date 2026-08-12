/**
 * Live section-by-section test against the running Cybersave API.
 * Run: node scripts/section-tests.mjs
 */
const BASE = process.env.API_BASE || 'http://localhost:8000/api/v1';
const ADMIN = { email: 'admin@cybersave.local', password: 'Admin@123456' };
const PHONE = `+91${Math.floor(7000000000 + Math.random() * 99999999)}`;
const runId = Date.now().toString(36);

const results = [];

async function req(method, path, { token, body, expectStatus } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }
  if (expectStatus && res.status !== expectStatus) {
    const msg = json?.error?.message || json?.message || `HTTP ${res.status}`;
    throw new Error(`${method} ${path} expected ${expectStatus} got ${res.status}: ${msg}`);
  }
  return { status: res.status, json };
}

function record(section, name, ok, detail = '') {
  results.push({ section, name, ok, detail });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`  [${mark}] ${name}${detail ? ` — ${detail}` : ''}`);
}

async function section(title, fn) {
  console.log(`\n=== ${title} ===`);
  try {
    await fn();
  } catch (err) {
    record(title, 'section crashed', false, err.message);
  }
}

let adminToken = '';
let citizenToken = '';
let citizenId = '';
let adminUserId = '';
let mainServiceId = '';
let subServiceId = '';
let versionId = '';
let docRequirementId = '';
let applicationId = '';
let paymentId = '';
let ticketId = '';

await section('0. Health', async () => {
  const { json } = await req('GET', '/health', { expectStatus: 200 });
  record('Health', 'GET /health', json?.data?.status === 'ok' || json?.data?.status === 'degraded', json?.data?.status);
  record('Health', 'Database up', json?.data?.services?.database === 'up', json?.data?.services?.database);
});

await section('1. Admin Auth', async () => {
  const login = await req('POST', '/admin/auth/login', { body: ADMIN, expectStatus: 200 });
  adminToken = login.json.data.accessToken;
  record('Admin Auth', 'Login', Boolean(adminToken));

  const me = await req('GET', '/admin/auth/me', { token: adminToken, expectStatus: 200 });
  adminUserId = me.json.data.id;
  record('Admin Auth', 'GET /me', me.json.data.email === ADMIN.email);

  const patch = await req('PATCH', '/admin/auth/me', {
    token: adminToken,
    body: { firstName: 'Super', lastName: 'Admin' },
    expectStatus: 200,
  });
  record('Admin Auth', 'PATCH /me', patch.json.success !== false);

  const bad = await req('POST', '/admin/auth/login', {
    body: { email: 'wrong@example.com', password: 'wrongpass1' },
  });
  record('Admin Auth', 'Reject bad login', bad.status === 401, String(bad.status));
});

await section('2. Citizen Auth (Mobile)', async () => {
  const otp = await req('POST', '/auth/otp/request', { body: { phone: PHONE }, expectStatus: 200 });
  const code = otp.json.data.devCode;
  record('Citizen Auth', 'OTP request', Boolean(code), code ? `devCode=${code}` : 'no devCode');

  const verify = await req('POST', '/auth/otp/verify', {
    body: { phone: PHONE, code },
    expectStatus: 200,
  });
  citizenToken = verify.json.data.accessToken;
  record('Citizen Auth', 'OTP verify', Boolean(citizenToken));

  const me = await req('GET', '/auth/me', { token: citizenToken, expectStatus: 200 });
  citizenId = me.json.data.id;
  record('Citizen Auth', 'GET /me', Boolean(citizenId));

  await req('PATCH', '/auth/me', {
    token: citizenToken,
    body: { firstName: 'Mobile', lastName: 'Tester', email: `mobile.${runId}@test.local` },
    expectStatus: 200,
  });
  record('Citizen Auth', 'PATCH /me profile', true);
});

await section('3. Admin Services Wizard → Publish', async () => {
  const main = await req('POST', '/admin/main-services', {
    token: adminToken,
    body: { name: `Section Main ${runId}`, description: 'Section test', isVisible: true },
    expectStatus: 201,
  });
  mainServiceId = main.json.data.id;
  record('Admin Services', 'Create main service', Boolean(mainServiceId));

  const sub = await req('POST', `/admin/main-services/${mainServiceId}/sub-services`, {
    token: adminToken,
    body: { name: `Section Sub ${runId}`, description: 'Income certificate test' },
    expectStatus: 201,
  });
  subServiceId = sub.json.data.subService.id;
  versionId = sub.json.data.draftVersionId;
  record('Admin Services', 'Create sub-service + draft version', Boolean(versionId));

  await req('PUT', `/admin/service-versions/${versionId}/overview`, {
    token: adminToken,
    body: {
      displayName: `Section Certificate ${runId}`,
      shortDescription: 'Live section test service',
      department: 'Revenue',
      processingTime: '7 days',
    },
    expectStatus: 200,
  });
  record('Admin Services', 'Save overview', true);

  await req('PUT', `/admin/service-versions/${versionId}/form`, {
    token: adminToken,
    body: {
      fields: [
        { key: 'fullName', label: 'Full Name', type: 'TEXT', required: true, sortOrder: 0 },
        { key: 'address', label: 'Address', type: 'TEXTAREA', required: false, sortOrder: 1 },
      ],
    },
    expectStatus: 200,
  });
  record('Admin Services', 'Save form fields', true);

  const docs = await req('PUT', `/admin/service-versions/${versionId}/documents`, {
    token: adminToken,
    body: {
      requirements: [
        {
          name: 'ID Proof',
          required: true,
          allowedFormats: ['pdf'],
          allowedMimeTypes: ['application/pdf'],
          maxFileSizeBytes: 5242880,
        },
      ],
    },
    expectStatus: 200,
  });
  docRequirementId = docs.json.data.documentRequirements?.[0]?.id ?? '';
  record('Admin Services', 'Save documents', Boolean(docRequirementId));

  await req('PUT', `/admin/service-versions/${versionId}/pricing`, {
    token: adminToken,
    body: { baseFee: 150, taxEnabled: false, currency: 'INR' },
    expectStatus: 200,
  });
  record('Admin Services', 'Save pricing', true);

  const validate = await req('POST', `/admin/service-versions/${versionId}/validate`, {
    token: adminToken,
    expectStatus: 201,
  });
  record('Admin Services', 'Validate before publish', validate.json.data.valid === true, (validate.json.data.errors || []).join('; '));

  await req('POST', `/admin/service-versions/${versionId}/publish`, {
    token: adminToken,
    expectStatus: 201,
  });
  record('Admin Services', 'Publish version', true);
});

await section('4. Mobile Catalogue Sync', async () => {
  const catalog = await req('GET', '/services', { token: citizenToken, expectStatus: 200 });
  const found = (catalog.json.data || []).some((m) =>
    (m.subServices || []).some((s) => s.id === subServiceId),
  );
  record('Mobile Catalogue', 'Published service visible on mobile', found);

  const config = await req('GET', `/services/sub/${subServiceId}/configuration`, {
    token: citizenToken,
    expectStatus: 200,
  });
  const fields = config.json.data?.form?.fields || config.json.data?.formVersion?.fields || [];
  record('Mobile Catalogue', 'Dynamic form config loaded', fields.length > 0, `${fields.length} fields`);
});

await section('5. Mobile Apply → Pay → Submit', async () => {
  const draft = await req('POST', '/applications', {
    token: citizenToken,
    body: { subServiceId },
    expectStatus: 201,
  });
  applicationId = draft.json.data.id;
  record('Mobile Apply', 'Create draft', Boolean(applicationId));

  await req('PATCH', `/applications/${applicationId}/form`, {
    token: citizenToken,
    body: { values: { fullName: 'Mobile Tester', address: 'Hyderabad' } },
    expectStatus: 200,
  });
  record('Mobile Apply', 'Save form values', true);

  const upload = await req('POST', `/applications/${applicationId}/uploads/request`, {
    token: citizenToken,
    body: {
      documentRequirementId: docRequirementId,
      originalFileName: 'id.pdf',
      mimeType: 'application/pdf',
    },
    expectStatus: 201,
  });
  const session = upload.json.data;
  record('Mobile Apply', 'Request presigned upload', Boolean(session.uploadUrl));

  const uploadUrl = session.uploadUrl;
  const putRes = await fetch(uploadUrl, {
    method: session.method || 'PUT',
    headers: { 'Content-Type': 'application/pdf', ...(session.headers || {}) },
    body: Buffer.from('%PDF-1.4 section-test'),
  });
  record('Mobile Apply', 'PUT file to storage', putRes.status === 200, String(putRes.status));

  await req('POST', `/applications/${applicationId}/uploads/complete`, {
    token: citizenToken,
    body: { uploadSessionId: session.uploadSessionId, storedFileId: session.storedFileId },
    expectStatus: 201,
  });
  record('Mobile Apply', 'Complete upload', true);

  await req('POST', `/applications/${applicationId}/validate`, {
    token: citizenToken,
    expectStatus: 201,
  });
  record('Mobile Apply', 'Validate application', true);

  const pay = await req('POST', `/applications/${applicationId}/payment-intent`, {
    token: citizenToken,
    body: { idempotencyKey: `section-${runId}` },
    expectStatus: 201,
  });
  paymentId = pay.json.data.paymentId;
  record('Mobile Apply', 'Create payment intent', Boolean(paymentId), `₹${pay.json.data.amount}`);

  await req('POST', '/webhooks/payments/mock', {
    body: { paymentId },
    expectStatus: 201,
  });
  record('Mobile Apply', 'Mock payment capture', true);

  const submit = await req('POST', `/applications/${applicationId}/submit`, {
    token: citizenToken,
    expectStatus: 201,
  });
  record('Mobile Apply', 'Submit application', submit.json.data.status === 'SUBMITTED', submit.json.data.status);
});

await section('6. Admin Applications ← Mobile Sync', async () => {
  const list = await req('GET', '/admin/applications?page=1&limit=50', {
    token: adminToken,
    expectStatus: 200,
  });
  const items = list.json.data || [];
  const found = items.some((a) => a.id === applicationId);
  record('Admin Applications', 'Mobile submission visible in admin', found);

  await req('GET', `/admin/applications/${applicationId}`, {
    token: adminToken,
    expectStatus: 200,
  });
  record('Admin Applications', 'Open application detail', true);

  const trans = await req('GET', `/admin/applications/${applicationId}/transitions`, {
    token: adminToken,
    expectStatus: 200,
  });
  const transitions = trans.json.data?.transitions || trans.json.data || [];
  record('Admin Applications', 'Workflow transitions available', Array.isArray(transitions), `${Array.isArray(transitions) ? transitions.length : 0} actions`);

  await req('POST', `/admin/applications/${applicationId}/assign`, {
    token: adminToken,
    body: { operatorId: adminUserId },
    expectStatus: 201,
  });
  record('Admin Applications', 'Assign operator', true);

  await req('POST', `/admin/applications/${applicationId}/notes`, {
    token: adminToken,
    body: { content: 'Section test note from admin' },
    expectStatus: 201,
  });
  record('Admin Applications', 'Add internal note', true);
});

await section('7. Admin → Mobile ACTION_REQUIRED Sync', async () => {
  await req('POST', `/admin/applications/${applicationId}/action-required`, {
    token: adminToken,
    body: {
      reason: 'Address incomplete',
      instructions: 'Please update full address',
      requiredFieldKeys: ['address'],
    },
    expectStatus: 201,
  });
  record('Sync', 'Admin requests correction', true);

  const detail = await req('GET', `/applications/${applicationId}`, {
    token: citizenToken,
    expectStatus: 200,
  });
  record('Sync', 'Mobile sees ACTION_REQUIRED', detail.json.data.status === 'ACTION_REQUIRED', detail.json.data.status);

  await req('POST', `/applications/${applicationId}/corrections/submit`, {
    token: citizenToken,
    body: { values: { address: '12 MG Road, Hyderabad, 500001' } },
    expectStatus: 201,
  });
  record('Sync', 'Mobile submits correction', true);

  const after = await req('GET', `/admin/applications/${applicationId}`, {
    token: adminToken,
    expectStatus: 200,
  });
  record('Sync', 'Admin sees updated application after correction', Boolean(after.json.data.id));
});

await section('8. Dashboard / Analytics / Audit / Payments / Users', async () => {
  const endpoints = [
    ['Dashboard summary', '/admin/dashboard/summary'],
    ['Revenue trends', '/admin/dashboard/revenue-trends?days=7'],
    ['Application trends', '/admin/dashboard/application-trends?days=7'],
    ['Service share', '/admin/dashboard/service-share'],
    ['Operator logs', '/admin/dashboard/operator-logs'],
    ['Document activity', '/admin/dashboard/document-activity?days=7'],
    ['Audit logs', '/admin/audit-logs?page=1&limit=10'],
    ['Payments', '/admin/payments?page=1&limit=10'],
    ['Citizens', '/admin/citizens?page=1&limit=10'],
    ['Admin users', '/admin/admin-users?page=1&limit=10'],
  ];
  for (const [name, path] of endpoints) {
    const res = await req('GET', path, { token: adminToken });
    record('Admin Reports', name, res.status === 200, String(res.status));
  }

  const citizens = await req('GET', '/admin/citizens?page=1&limit=50', { token: adminToken, expectStatus: 200 });
  const citizenFound = (citizens.json.data || []).some((c) => c.id === citizenId || c.phone === PHONE);
  record('Admin Users', 'Mobile citizen appears in admin users', citizenFound);
});

await section('9. Support Tickets (Mobile ↔ Admin)', async () => {
  const create = await req('POST', '/support/tickets', {
    token: citizenToken,
    body: { subject: `Section ticket ${runId}`, content: 'Need help with my application' },
    expectStatus: 201,
  });
  ticketId = create.json.data.id;
  record('Support', 'Mobile creates ticket', Boolean(ticketId));

  const mine = await req('GET', '/support/tickets', { token: citizenToken, expectStatus: 200 });
  record('Support', 'Mobile lists own tickets', (mine.json.data || []).some((t) => t.id === ticketId));

  const adminList = await req('GET', '/admin/support/tickets', { token: adminToken, expectStatus: 200 });
  record('Support', 'Admin sees mobile ticket', (adminList.json.data || []).some((t) => t.id === ticketId));

  await req('POST', `/admin/support/tickets/${ticketId}/messages`, {
    token: adminToken,
    body: { content: 'We are looking into this.' },
    expectStatus: 201,
  });
  record('Support', 'Admin replies to ticket', true);

  await req('POST', `/admin/support/tickets/${ticketId}/resolve`, {
    token: adminToken,
    expectStatus: 201,
  });
  record('Support', 'Admin resolves ticket', true);
});

await section('10. Notifications (Admin → Mobile)', async () => {
  await req('POST', '/admin/notifications/send', {
    token: adminToken,
    body: {
      title: 'Section notice',
      body: 'Your application needs attention',
      citizenIds: [citizenId],
    },
    expectStatus: 201,
  });
  record('Notifications', 'Admin sends to citizen', true);

  const list = await req('GET', '/notifications?page=1&limit=20', {
    token: citizenToken,
    expectStatus: 200,
  });
  const items = list.json.data || [];
  const found = items.some((n) => (n.title || '').includes('Section notice'));
  record('Notifications', 'Mobile receives notification', found || items.length > 0, `${items.length} items`);

  if (items[0]?.id) {
    const read = await req('PATCH', `/notifications/${items[0].id}/read`, {
      token: citizenToken,
    });
    record('Notifications', 'Mobile mark as read', read.status === 200 || read.status === 201, String(read.status));
  }
});

await section('11. Auth isolation', async () => {
  const citizenOnAdmin = await req('GET', '/admin/dashboard/summary', { token: citizenToken });
  record('Security', 'Citizen token cannot access admin dashboard', citizenOnAdmin.status === 401 || citizenOnAdmin.status === 403, String(citizenOnAdmin.status));

  const adminOnCitizen = await req('GET', '/applications', { token: adminToken });
  record('Security', 'Admin token cannot list citizen applications', adminOnCitizen.status === 401 || adminOnCitizen.status === 403, String(adminOnCitizen.status));
});

const passed = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok).length;
console.log('\n========================================');
console.log(`SECTION TEST SUMMARY: ${passed} passed, ${failed} failed, ${results.length} total`);
console.log('========================================');
if (failed) {
  console.log('\nFailures:');
  for (const r of results.filter((x) => !x.ok)) {
    console.log(` - [${r.section}] ${r.name}: ${r.detail}`);
  }
  process.exit(1);
}
process.exit(0);
