/* Reporting Module */

'use strict';

/**
 * generatePayrollReport — BB-05, WB-07 (reversed dates → throws)
 * @param {string} startDate
 * @param {string} endDate
 * @returns {Object}
 */
function generatePayrollReport(startDate, endDate) {
  const start = new Date(startDate);
  const end   = new Date(endDate);

  // WB-07: validate date range
  if (start > end) {
    throw new Error('Start date cannot be after end date');
  }

  const records = store.payrollRecords.filter(r => {
    const d = new Date(r.paymentDate);
    return d >= start && d <= end;
  });

  const totalGross   = records.reduce((s, r) => s + r.grossSalary, 0);
  const totalTax     = records.reduce((s, r) => s + r.tax, 0);
  const totalInsur   = records.reduce((s, r) => s + r.insurance, 0);
  const totalNet     = records.reduce((s, r) => s + r.netPay, 0);

  return {
    startDate, endDate,
    records,
    summary: {
      count: records.length,
      totalGross: Math.round(totalGross * 100) / 100,
      totalTax:   Math.round(totalTax   * 100) / 100,
      totalInsur: Math.round(totalInsur * 100) / 100,
      totalNet:   Math.round(totalNet   * 100) / 100
    }
  };
}

/* ── DOM Rendering for Reports ── */
function renderReports() {
  const now = new Date();
  const y = now.getFullYear(), m = String(now.getMonth()+1).padStart(2,'0');
  document.getElementById('report-start').value = `${y}-${m}-01`;
  document.getElementById('report-end').value   = `${y}-${m}-${new Date(y, now.getMonth()+1, 0).getDate()}`;
  document.getElementById('report-output').style.display = 'none';
}

function handleGenerateReport(e) {
  e.preventDefault();
  const startDate = document.getElementById('report-start').value;
  const endDate   = document.getElementById('report-end').value;

  if (!startDate || !endDate) {
    showToast('warning', 'Missing Dates', 'Please enter both start and end dates');
    return;
  }

  try {
    const report = generatePayrollReport(startDate, endDate); // BB-05, WB-07

    document.getElementById('rpt-total-gross').textContent = '$' + fmt(report.summary.totalGross);
    document.getElementById('rpt-total-tax').textContent   = '$' + fmt(report.summary.totalTax);
    document.getElementById('rpt-total-net').textContent   = '$' + fmt(report.summary.totalNet);
    document.getElementById('rpt-record-count').textContent = report.summary.count;
    document.getElementById('rpt-date-range').textContent  = `${fmtDate(startDate)} — ${fmtDate(endDate)}`;

    const tbody = document.getElementById('report-tbody');
    if (report.records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
        <div class="empty-icon">📊</div><h3>No records found</h3>
        <p>No payroll records in the selected date range</p>
      </div></td></tr>`;
    } else {
      tbody.innerHTML = report.records.map(r => `
        <tr>
          <td>${fmtDate(r.paymentDate)}</td>
          <td>${r.employeeId}</td>
          <td>${r.employeeName}</td>
          <td><span class="badge badge-accent">${r.dept}</span></td>
          <td class="font-mono">$${fmt(r.grossSalary)}</td>
          <td class="font-mono text-danger">-$${fmt(r.tax + r.insurance)}</td>
          <td class="font-mono text-success">$${fmt(r.netPay)}</td>
        </tr>
      `).join('');
    }

    document.getElementById('report-output').style.display = 'block';
    showToast('success', 'Report Generated', `${report.summary.count} records found`);
    logActivity(store.authState.currentUser, `Generated payroll report (${fmtDate(startDate)} – ${fmtDate(endDate)})`, 'info');
  } catch(err) {
    showToast('error', 'Report Error', err.message);
  }
}
