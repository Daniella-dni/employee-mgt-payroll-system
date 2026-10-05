/* Test Suite Runner */

'use strict';

const TEST_CASES = [
  { id:'BB-01', type:'Black-Box', req:'FR1', desc:'Add valid employee',            status:'PASS', note:'EMP001 added, record visible in DB' },
  { id:'BB-02', type:'Black-Box', req:'FR1', desc:'Empty name validation',          status:'PASS', note:'Error: "Employee name is required"' },
  { id:'BB-03', type:'Black-Box', req:'FR2/FR3', desc:'Salary calculation (valid)',    status:'PASS', note:'Net=$4000 | Tax=$750 | Ins=$250' },
  { id:'BB-04', type:'Black-Box', req:'FR2', desc:'Zero hours input → $0 pay',    status:'PASS', note:'Net Pay = 0.00 returned' },
  { id:'BB-05', type:'Black-Box', req:'FR4', desc:'Generate payroll report',        status:'PASS', note:'Report with correct totals generated' },
  { id:'BB-06', type:'Black-Box', req:'FR5', desc:'Valid login (admin/Admin@1234)', status:'PASS', note:'Dashboard rendered, welcome shown' },
  { id:'BB-07', type:'Black-Box', req:'FR5', desc:'Invalid login rejection',        status:'PASS', note:'Error: "Invalid username or password"' },
  { id:'WB-01', type:'White-Box', req:'FR2/FR3', desc:'calculateNetPay() — true/true branch', status:'PASS', note:'5000→4000 both deductions applied' },
  { id:'WB-02', type:'White-Box', req:'FR2', desc:'calculateNetPay() — false/false branch',  status:'PASS', note:'3000→3000 no deductions' },
  { id:'WB-03', type:'White-Box', req:'FR1', desc:'getAllEmployees() — empty list (0 iters)', status:'PASS', note:'Returns [] not null' },
  { id:'WB-04', type:'White-Box', req:'FR1', desc:'getAllEmployees() — 5 employees',          status:'PASS', note:'List size = 5 confirmed' },
  { id:'WB-05', type:'White-Box', req:'FR1', desc:'findEmployeeById(null) — throws',          status:'PASS', note:'IllegalArgumentException raised' },
  { id:'WB-06', type:'White-Box', req:'FR2', desc:'Negative salary validation',               status:'FAIL', note:'BUG: system returned -600 instead of throwing — INC-005' },
  { id:'WB-07', type:'White-Box', req:'FR4', desc:'Reversed date range — throws',             status:'PASS', note:'Error: "Start date cannot be after end date"' },
  { id:'WB-08', type:'White-Box', req:'FR5', desc:'BCrypt password hash comparison',          status:'PASS', note:'authenticate() returned true' },
  { id:'WB-09', type:'White-Box', req:'FR5', desc:'Account lockout after 3 fails',            status:'PASS', note:'Locked on 3rd attempt — INC-007' },
  { id:'WB-10', type:'White-Box', req:'FR2', desc:'Payment DB persistence check',             status:'PASS', note:'Record saved and queried from store' },
];

function renderTestLog() {
  const pass = TEST_CASES.filter(t => t.status === 'PASS').length;
  const fail = TEST_CASES.filter(t => t.status === 'FAIL').length;

  document.getElementById('tc-pass').textContent = pass;
  document.getElementById('tc-fail').textContent = fail;
  document.getElementById('tc-total').textContent = TEST_CASES.length;
  document.getElementById('tc-pct').textContent = Math.round((pass / TEST_CASES.length) * 100) + '%';

  const tbody = document.getElementById('tc-tbody');
  tbody.innerHTML = TEST_CASES.map(tc => `
    <tr>
      <td><span class="badge badge-neutral font-mono" style="font-size:11px">${tc.id}</span></td>
      <td><span class="badge ${tc.type === 'Black-Box' ? 'badge-info' : 'badge-accent'}">${tc.type}</span></td>
      <td><span class="badge badge-neutral" style="font-size:10px">${tc.req}</span></td>
      <td style="max-width:240px">${tc.desc}</td>
      <td>
        <span class="badge ${tc.status === 'PASS' ? 'badge-success' : 'badge-danger'}">
          ${tc.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}
        </span>
      </td>
      <td style="font-size:12px;color:var(--text-muted);max-width:220px">${tc.note}</td>
    </tr>
  `).join('');
}
