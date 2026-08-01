const BASE = 'http://localhost:3001';
let pass = 0, fail = 0;
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name} ${extra}`); }
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
const studentEmail = `e2e-student-${suffix}@wellness.local`;

console.log('1. Health');
check('GET /api/health', (await api('/api/health')).status === 200);

console.log('2. Register student');
const reg = await api('/api/auth/register/student', {
  method: 'POST',
  body: JSON.stringify({ email: studentEmail, password: 'StudentDemo1!', full_name: 'E2E Student', student_id: 'CS23S' + suffix }),
});
check('register student 201', reg.status === 201, JSON.stringify(reg.body));

console.log('3. Admin login + counsellor list');
const adminLogin = await api('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'wellness1@smail.iitm.ac.in', password: '0&nMlqX3&yFkkHVx', role: 'admin' }),
});
check('admin login 200', adminLogin.status === 200, JSON.stringify(adminLogin.body));
const adminToken = adminLogin.body?.token;
check('admin token present', !!adminToken);
const couns = await api('/api/counsellors', { headers: { Authorization: `Bearer ${adminToken}` } });
check('counsellor list 200 + 12 rows', couns.status === 200 && couns.body?.counsellors?.length === 12, `got ${couns.body?.counsellors?.length}`);
const counsellorId = couns.body?.counsellors?.[0]?.id;

console.log('4. Student login + feedback submit');
const studentLogin = await api('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: studentEmail, password: 'StudentDemo1!', role: 'student' }),
});
check('student login 200', studentLogin.status === 200, JSON.stringify(studentLogin.body));
const studentToken = studentLogin.body?.token;
const fb = await api('/api/feedback', {
  method: 'POST',
  headers: { Authorization: `Bearer ${studentToken}` },
  body: JSON.stringify({
    counsellor_id: counsellorId, q1_comfort: 5, q2_understood: 4, q3_time: 4, q4_quality: 5,
    q5_respected: 5, q6_supported: 4, q7_hopeful: 4, q8_safe: 5, q9_communication: 4, q10_overall: 5,
    recommendation: 'Yes', comments: 'E2E test feedback', is_anonymous: true,
  }),
});
check('submit feedback 201', fb.status === 201, JSON.stringify(fb.body));
const myHistory = await api('/api/feedback/my-history', { headers: { Authorization: `Bearer ${studentToken}` } });
check('my-history has 1', myHistory.body?.feedback?.length === 1);

console.log('5. Head counsellor login + analytics');
const hcLogin = await api('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email: 'wo@smail.iitm.ac.in', password: '6hxkTs&1*CuE&ot@', role: 'head_counsellor' }),
});
check('head counsellor login 200', hcLogin.status === 200, JSON.stringify(hcLogin.body));
const hcToken = hcLogin.body?.token;
const analytics = await api('/api/analytics/institution', { headers: { Authorization: `Bearer ${hcToken}` } });
check('analytics 200', analytics.status === 200, JSON.stringify(analytics.body));

console.log('6. Security: unauth access rejected');
const noToken = await api('/api/analytics/institution');
check('analytics w/o token 401', noToken.status === 401, `got ${noToken.status}`);

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
