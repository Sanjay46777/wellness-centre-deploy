const BASE = 'http://localhost:3001';
let pass = 0, fail = 0;
const results = [];
function check(name, cond, extra = '') {
  if (cond) { pass++; results.push(`  PASS  ${name}`); }
  else { fail++; results.push(`  FAIL  ${name} ${extra}`); }
}
async function api(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  let body = null;
  try { body = await res.json(); } catch {}
  return { status: res.status, body };
}
const suffix = Date.now();
const NEW_STUDENT = `e2e-student-${suffix}@wellness.local`;
const NEW_HC = `e2e-hc-${suffix}@wellness.local`;
const PW = 'E2ETestPass1!';

console.log('=== 1. Health ===');
check('GET /api/health', (await api('/api/health')).status === 200);

console.log('=== 2. Student registration ===');
let r = await api('/api/auth/register/student', { method: 'POST', body: JSON.stringify({ email: NEW_STUDENT, password: PW, full_name: 'E2E Student', student_id: 'CS22S' + suffix, phone: '9000000000' }) });
check('register new student 201', r.status === 201, JSON.stringify(r.body));
const newStudentId = r.body?.user_id;
r = await api('/api/auth/register/student', { method: 'POST', body: JSON.stringify({ email: NEW_STUDENT, password: PW, full_name: 'Dup', student_id: 'X' }) });
check('duplicate student register 409', r.status === 409, `got ${r.status}`);
r = await api('/api/auth/register/student', { method: 'POST', body: JSON.stringify({ email: 'bad-email', password: 'short', full_name: '' }) });
check('invalid student register 400', r.status === 400, `got ${r.status}`);

console.log('=== 3. Student login (new + demo) ===');
r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: NEW_STUDENT, password: PW, role: 'student' }) });
check('new student login 200', r.status === 200 && !!r.body?.token, JSON.stringify(r.body));
r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: NEW_STUDENT, password: 'WrongPass1!', role: 'student' }) });
check('wrong password 401', r.status === 401, `got ${r.status}`);
r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'student-demo@wellness.local', password: 'StudentDemo1!', role: 'student' }) });
check('demo student login 200', r.status === 200 && !!r.body?.token, JSON.stringify(r.body));

console.log('=== 4. Head counsellor registration (pending) ===');
r = await api('/api/auth/register/head-counsellor', { method: 'POST', body: JSON.stringify({ email: NEW_HC, password: PW, full_name: 'E2E Head Counsellor', phone: '9000000001' }) });
check('register new head counsellor 201', r.status === 201 && r.body?.status === 'pending', JSON.stringify(r.body));
const newHcId = r.body?.user_id;
r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: NEW_HC, password: PW, role: 'head_counsellor' }) });
check('pending HC login blocked 403', r.status === 403, `got ${r.status} ${JSON.stringify(r.body)}`);

console.log('=== 5. Admin login ===');
r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'wellness1@smail.iitm.ac.in', password: '0&nMlqX3&yFkkHVx', role: 'admin' }) });
check('admin login 200', r.status === 200 && !!r.body?.token, JSON.stringify(r.body));
const adminToken = r.body?.token;
r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'wellness1@smail.iitm.ac.in', password: '0&nMlqX3&yFkkHVx', role: 'student' }) });
check('admin email with wrong role 401', r.status === 401, `got ${r.status}`);
r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'nobody@wellness.local', password: 'whatever1!', role: 'admin' }) });
check('unknown user login 401', r.status === 401, `got ${r.status}`);

console.log('=== 6. Admin approval workflow ===');
r = await api('/api/admin/pending-registrations', { headers: { Authorization: `Bearer ${adminToken}` } });
const pendingList = (r.body?.registrations || []).map((x) => x.id);
check('pending registrations listed', r.status === 200 && pendingList.includes(newHcId), JSON.stringify(r.body));
r = await api(`/api/admin/approve-registration/${newHcId}`, { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } });
check('approve HC 200', r.status === 200, JSON.stringify(r.body));
r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: NEW_HC, password: PW, role: 'head_counsellor' }) });
check('approved HC login 200', r.status === 200 && !!r.body?.token, JSON.stringify(r.body));
const hcToken = r.body?.token;

console.log('=== 7. Demo head counsellor login ===');
r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'wo@smail.iitm.ac.in', password: '6hxkTs&1*CuE&ot@', role: 'head_counsellor' }) });
check('demo HC login 200', r.status === 200 && !!r.body?.token, JSON.stringify(r.body));

console.log('=== 8. Counsellor CRUD (admin) ===');
r = await api('/api/counsellors', { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ name: 'E2E Counsellor', designation: 'Counsellor', team: 'Team A', specialization: 'Wellness', email: 'e2e-coun@wellness.local' }) });
check('create counsellor 201', r.status === 201 && !!r.body?.counsellor_id, JSON.stringify(r.body));
const newCounId = r.body?.counsellor_id;
r = await api('/api/counsellors', { headers: { Authorization: `Bearer ${adminToken}` } });
check('counsellor list 13 rows', r.body?.counsellors?.length === 13, `got ${r.body?.counsellors?.length}`);
r = await api(`/api/counsellors/${newCounId}`, { method: 'PUT', headers: { Authorization: `Bearer ${adminToken}` }, body: JSON.stringify({ name: 'E2E Counsellor 2', is_active: false }) });
check('update counsellor 200', r.status === 200, JSON.stringify(r.body));
r = await api(`/api/counsellors/${newCounId}`, { headers: { Authorization: `Bearer ${adminToken}` } });
check('counsellor shows updated + inactive', r.body?.counsellor?.name === 'E2E Counsellor 2' && r.body?.counsellor?.is_active === 0, JSON.stringify(r.body?.counsellor));
r = await api('/api/counsellors?active=true', { headers: { Authorization: `Bearer ${adminToken}` } });
check('active filter excludes inactive', !(r.body?.counsellors || []).some((c) => c.id === newCounId));
r = await api(`/api/counsellors/${newCounId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${adminToken}` } });
check('delete counsellor 200', r.status === 200, JSON.stringify(r.body));

console.log('=== 9. Feedback + analytics (student → HC) ===');
const studentLogin = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: NEW_STUDENT, password: PW, role: 'student' }) });
const studentToken = studentLogin.body?.token;
r = await api('/api/feedback', { method: 'POST', headers: { Authorization: `Bearer ${studentToken}` }, body: JSON.stringify({ counsellor_id: 1, q1_comfort: 5, q2_understood: 4, q3_time: 4, q4_quality: 5, q5_respected: 5, q6_supported: 4, q7_hopeful: 4, q8_safe: 5, q9_communication: 4, q10_overall: 5, recommendation: 'Yes', comments: 'Comprehensive E2E test', is_anonymous: false, respondent_email: NEW_STUDENT }) });
check('submit feedback 201', r.status === 201, JSON.stringify(r.body));
r = await api('/api/feedback/my-history', { headers: { Authorization: `Bearer ${studentToken}` } });
check('my-history has 1', r.body?.feedback?.length === 1, `got ${r.body?.feedback?.length}`);
r = await api('/api/analytics/institution', { headers: { Authorization: `Bearer ${hcToken}` } });
check('HC institution analytics 200', r.status === 200 && Array.isArray(r.body?.feedback), JSON.stringify(r.body).slice(0, 120));
r = await api('/api/analytics/counsellor/1', { headers: { Authorization: `Bearer ${hcToken}` } });
check('HC counsellor analytics 200', r.status === 200 && !!r.body?.counsellor, JSON.stringify(r.body));
r = await api('/api/analytics/leaderboard', { headers: { Authorization: `Bearer ${hcToken}` } });
check('HC leaderboard 200', r.status === 200 && Array.isArray(r.body?.leaderboard), JSON.stringify(r.body));
r = await api('/api/qr-code/1', { headers: { Authorization: `Bearer ${studentToken}` } });
check('QR code endpoint 200', r.status === 200, `got ${r.status}`);

console.log('=== 10. RBAC / authorization ===');
r = await api('/api/admin/pending-registrations', { headers: { Authorization: `Bearer ${studentToken}` } });
check('student on admin endpoint 403', r.status === 403, `got ${r.status}`);
r = await api('/api/analytics/institution', { headers: { Authorization: `Bearer ${studentToken}` } });
check('student on analytics 403', r.status === 403, `got ${r.status}`);
r = await api('/api/analytics/institution');
check('no token analytics 401', r.status === 401, `got ${r.status}`);
r = await api('/api/counsellors', { method: 'POST', headers: { Authorization: `Bearer ${studentToken}` }, body: JSON.stringify({ name: 'X' }) });
check('student cannot create counsellor 403', r.status === 403, `got ${r.status}`);
r = await api('/api/counsellors', { method: 'POST', headers: { Authorization: `Bearer ${hcToken}` }, body: JSON.stringify({ name: 'HC Created' }) });
check('HC can create counsellor 201', r.status === 201, `got ${r.status}`);

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
results.forEach((l) => console.log(l));
process.exit(fail > 0 ? 1 : 0);
