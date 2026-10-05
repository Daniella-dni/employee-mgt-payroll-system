/* Payment Processing & Payroll Deductions Module */

'use strict';

/**
 * calculateNetPay — FR2/FR3
 * Matches WB-01 (true/true), WB-02 (false/false), WB-06 (negative → throws)
 *
 * @param {number}  grossSalary
 * @param {boolean} hasTax
 * @param {boolean} hasInsurance
 * @returns {number} netPay
 * @throws {Error} if grossSalary < 0
 */
function calculateNetPay(grossSalary, hasTax, hasInsurance) {
  // WB-06 fix: validate negative salary
  if (grossSalary < 0) {
    throw new Error('Salary cannot be negative');
  }

  let netPay = grossSalary;

  if (hasTax && hasInsurance) {
    netPay = grossSalary - (grossSalary * TAX_RATE) - (grossSalary * INSURANCE_RATE);
  } else if (hasTax && !hasInsurance) {
    netPay = grossSalary - (grossSalary * TAX_RATE);
  } else if (!hasTax && hasInsurance) {
    netPay = grossSalary - (grossSalary * INSURANCE_RATE);
  } else {
    // WB-02: !hasTax && !hasInsurance → gross = net
    netPay = grossSalary;
  }

  return Math.round(netPay * 100) / 100;
}

/**
 * processPayroll — FR2/FR3, WB-10
 */
function processPayroll(employeeId, hoursWorked, hasTax, hasInsurance) {
  const emp = findEmployeeById(employeeId);
  if (!emp) throw new Error('Employee not found');

  const hours = parseFloat(hoursWorked);
  if (isNaN(hours) || hours < 0) throw new Error('Hours worked must be a non-negative number');

  // BB-04: 0 hours → 0 pay
  const grossSalary = hours === 0 ? 0 : emp.salary;
  const netPay = calculateNetPay(grossSalary, hasTax, hasInsurance);
  const taxAmt = hasTax ? grossSalary * TAX_RATE : 0;
  const insuranceAmt = hasInsurance ? grossSalary * INSURANCE_RATE : 0;

  const record = {
    id: `PAY-${Date.now()}-${emp.id}`,
    employeeId: emp.id,
    employeeName: emp.name,
    dept: emp.dept,
    grossSalary,
    hoursWorked: hours,
    tax: Math.round(taxAmt * 100) / 100,
    insurance: Math.round(insuranceAmt * 100) / 100,
    netPay,
    paymentDate: new Date().toISOString().split('T')[0],
    processedAt: new Date().toISOString()
  };

  // WB-10: DB persistence in store
  store.payrollRecords.push(record);
  logActivity(store.authState.currentUser, `Processed payroll for ${emp.name} — Net Pay: $${netPay.toFixed(2)}`, 'success');
  return record;
}

/* ── DOM Rendering for Payroll ── */
function renderPayroll() {
  populateEmployeeSelect('payroll-emp-select');
  clearBreakdown();
  renderPayrollHistoryTable();
}

function renderPayrollHistoryTable() {
  const tbody = document.getElementById('payroll-history-tbody');
  if (!tbody) return;

  const records = store.payrollRecords.slice().reverse().slice(0, 20);
  if (records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">💰</div><h3>No payroll records yet</h3><p>Process your first payroll above</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = records.map(r => `
    <tr>
      <td class="font-mono" style="font-size:11px;color:var(--text-muted)">${r.id.split('-').slice(-2).join('-')}</td>
      <td>${r.employeeName}</td>
      <td><span class="badge badge-accent">${r.dept}</span></td>
      <td class="font-mono">$${fmt(r.grossSalary)}</td>
      <td class="font-mono text-danger">-$${fmt(r.tax)}</td>
      <td class="font-mono text-warning">-$${fmt(r.insurance)}</td>
      <td class="font-mono text-success" style="font-weight:700">$${fmt(r.netPay)}</td>
      <td>${fmtDate(r.paymentDate)}</td>
    </tr>
  `).join('');

  const countBadge = document.getElementById('nav-emp-count');
  if (countBadge) countBadge.textContent = getAllEmployees().length;
}

function populateEmployeeSelect(selectId) {
  const select = document.getElementById(selectId);
  const employees = getAllEmployees().filter(e => e.status === 'Active');
  select.innerHTML = '<option value="">— Select Employee —</option>' +
    employees.map(e => `<option value="${e.id}">${e.name} (${e.id}) — ${e.dept}</option>`).join('');
}

function clearBreakdown() {
  ['payroll-gross','payroll-tax','payroll-insurance','payroll-net'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '$0.00';
  });
  const card = document.getElementById('payroll-result-card');
  if (card) card.style.display = 'none';
}

async function handlePayrollCalc(e) {
  e.preventDefault();

  const empId  = document.getElementById('payroll-emp-select').value;
  const hours  = document.getElementById('payroll-hours').value;
  const hasTax = document.getElementById('payroll-tax-check').checked;
  const hasIns = document.getElementById('payroll-ins-check').checked;

  if (!empId) { showToast('warning', 'Select Employee', 'Please choose an employee first'); return; }

  try {
    let record;
    if (await Api.isBackendAvailable()) {
      record = await Api.processPayroll({
        employeeId: empId,
        hoursWorked: parseFloat(hours),
        hasTax,
        hasInsurance: hasIns
      });
      // also add to local store if not present
      const exists = store.payrollRecords.find(r => r.id === record.id);
      if (!exists) store.payrollRecords.unshift(record);
    } else {
      record = processPayroll(empId, hours, hasTax, hasIns);
    }

    document.getElementById('payroll-gross').textContent    = '$' + fmt(record.grossSalary);
    document.getElementById('payroll-tax').textContent      = '-$' + fmt(record.tax);
    document.getElementById('payroll-insurance').textContent = '-$' + fmt(record.insurance);
    document.getElementById('payroll-net').textContent      = '$' + fmt(record.netPay);
    document.getElementById('payroll-result-card').style.display = 'block';
    document.getElementById('payroll-emp-display').textContent = record.employeeName;
    document.getElementById('payroll-date-display').textContent = fmtDate(record.paymentDate);

    renderPayrollHistoryTable();
    showToast('success', 'Payroll Processed', `Net pay for ${record.employeeName}: $${fmt(record.netPay)}`);
  } catch(err) {
    showToast('error', 'Payroll Error', err.message);
  }
}

function updatePayrollPreview() {
  const empId  = document.getElementById('payroll-emp-select').value;
  const hours  = parseFloat(document.getElementById('payroll-hours').value) || 0;
  const hasTax = document.getElementById('payroll-tax-check').checked;
  const hasIns = document.getElementById('payroll-ins-check').checked;

  if (!empId) { clearBreakdown(); return; }

  try {
    const emp = findEmployeeById(empId);
    if (!emp) return;
    const gross = hours === 0 ? 0 : emp.salary;
    const net = calculateNetPay(gross, hasTax, hasIns);
    const taxAmt = hasTax ? gross * TAX_RATE : 0;
    const insAmt = hasIns ? gross * INSURANCE_RATE : 0;

    document.getElementById('payroll-gross').textContent    = '$' + fmt(gross);
    document.getElementById('payroll-tax').textContent      = '-$' + fmt(taxAmt);
    document.getElementById('payroll-insurance').textContent = '-$' + fmt(insAmt);
    document.getElementById('payroll-net').textContent      = '$' + fmt(net);
    document.getElementById('payroll-result-card').style.display = 'block';
    document.getElementById('payroll-emp-display').textContent = emp.name + ' (Preview)';
    document.getElementById('payroll-date-display').textContent = 'Not yet saved';
  } catch(err) {
    clearBreakdown();
  }
}
