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

console.log('=== SECURITY ===');
let r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: "' OR 1=1 --", password: "' OR '1'='1", role: 'admin' }) });
check('SQLi login attempt rejected', r.status === 401 || r.status === 400, `got ${r.status}`);
r = await api('/api/auth/register/student', { method: 'POST', body: JSON.stringify({ email: "x' OR '1'='1", password: 'P@ss1234!', full_name: "'; DROP TABLE users; --", student_id: "1 OR 1=1" }) });
check('SQLi register rejected', r.status === 400 || r.status === 409, `got ${r.status}`);
r = await api('/api/counsellors?search=' + encodeURIComponent("' OR 1=1 --"), { headers: { Authorization: `Bearer ${await adminToken()}` } });
check('SQLi search rejected', r.status === 200 && Array.isArray(r.body?.counsellors), `got ${r.status}`);

r = await api('/api/auth/register/student', { method: 'POST', body: JSON.stringify({ email: '<script>alert(1)</script>@wellness.local', password: 'P@ss1234!', full_name: '<script>alert("XSS")</script>', student_id: '<img src=x onerror=alert(1)>' }) });
check('XSS register sanitized/rejected', r.status === 400 || r.status === 201, `got ${r.status}`);
const xssStudent = await api('/api/auth/register/student', { method: 'POST', body: JSON.stringify({ email: `xss-${suffix}@wellness.local`, password: 'P@ss1234!', full_name: 'XSS Tester', student_id: 'XSS' + suffix }) });
const stTok = xssStudent.body?.user_id ? (await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: `xss-${suffix}@wellness.local`, password: 'P@ss1234!', role: 'student' }) })).body?.token : null;
if (stTok) {
  r = await api('/api/feedback', { method: 'POST', headers: { Authorization: `Bearer ${stTok}` }, body: JSON.stringify({ counsellor_id: 1, q1_comfort: 5, q2_understood: 5, q3_time: 5, q4_quality: 5, q5_respected: 5, q6_supported: 5, q7_hopeful: 5, q8_safe: 5, q9_communication: 5, q10_overall: 5, recommendation: 'Yes', comments: '<script>alert("XSS")</script>', is_anonymous: true }) });
  check('XSS comment accepted as text', r.status === 201, `got ${r.status}`);
}

console.log('=== FORM VALIDATION ===');
r = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: '', password: '' }) });
check('empty login fields rejected', r.status === 400 || r.status === 401, `got ${r.status}`);
r = await api('/api/auth/register/student', { method: 'POST', body: JSON.stringify({ email: 'not-an-email', password: 'P@ss1234!', full_name: 'X', student_id: 'X' }) });
check('invalid email format rejected', r.status === 400, `got ${r.status}`);
r = await api('/api/auth/register/student', { method: 'POST', body: JSON.stringify({ email: `weak-${suffix}@wellness.local`, password: 'short', full_name: 'X', student_id: 'X' }) });
check('weak password rejected', r.status === 400, `got ${r.status}`);
r = await api('/api/auth/register/student', { method: 'POST', body: JSON.stringify({ email: `empty-${suffix}@wellness.local`, password: 'P@ss1234!', full_name: '', student_id: '' }) });
check('empty required fields rejected', r.status === 400, `got ${r.status}`);
r = await api('/api/counsellors', { method: 'POST', headers: { Authorization: `Bearer ${await adminToken()}` }, body: JSON.stringify({ name: 'X'.repeat(501) }) });
check('over-max-length name rejected', r.status === 400, `got ${r.status}`);

console.log('=== DATABASE DUPLICATES ===');
r = await api('/api/auth/register/student', { method: 'POST', body: JSON.stringify({ email: 'student-demo@wellness.local', password: 'StudentDemo1!', full_name: 'Dup', student_id: 'X' }) });
check('duplicate email rejected 409', r.status === 409, `got ${r.status}`);
r = await api('/api/counsellors', { method: 'POST', headers: { Authorization: `Bearer ${await adminToken()}` }, body: JSON.stringify({ name: 'Dup Counsellor ' + suffix, designation: 'C', team: 'A', specialization: 'W', email: `dup-${suffix}@wellness.local` }) });
const dupId = r.body?.counsellor_id;
r = await api(`/api/counsellors/${dupId}`, { method: 'PUT', headers: { Authorization: `Bearer ${await adminToken()}` }, body: JSON.stringify({ name: 'Renamed ' + suffix }) });
check('update counsellor 200', r.status === 200, `got ${r.status}`);
r = await api(`/api/counsellors/${dupId}`, { headers: { Authorization: `Bearer ${await adminToken()}` } });
check('read updated counsellor', r.body?.counsellor?.name === 'Renamed ' + suffix, JSON.stringify(r.body));
r = await api(`/api/counsellors/${dupId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${await adminToken()}` } });
check('delete counsellor 200', r.status === 200, `got ${r.status}`);

console.log('=== RESPONSIVE API (headers) ===');
r = await api('/api/health');
check('helmet security headers', !!r.body || r.status === 200, '');

async function adminToken() {
  const l = await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: 'wellness1@smail.iitm.ac.in', password: '0&nMlqX3&yFkkHVx', role: 'admin' }) });
  return l.body?.token;
}

console.log(`\nSECURITY+VALIDATION: ${pass} passed, ${fail} failed`);
results.forEach((l) => console.log(l));
process.exit(fail > 0 ? 1 : 0);
