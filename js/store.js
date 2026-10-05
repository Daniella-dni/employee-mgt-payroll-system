/* Data Store & Audit Logger */

'use strict';

/* ── In-Memory Database ── */
let store = {
  employees: [],       // Employee records
  payrollRecords: [],  // Payment records
  activityLog: [],     // Audit log
  authState: {
    failedAttempts: 0,
    lockedUntil: null,
    currentUser: null
  }
};

/* ── Seed Demo Data ── */
function seedDemoData() {
  const seed = [
    { id: 'EMP001', name: 'John Doe',      role: 'Software Engineer',  dept: 'IT',         salary: 5000.00, startDate: '2026-09-01', status: 'Active' },
    { id: 'EMP002', name: 'Jane Smith',    role: 'HR Manager',         dept: 'HR',         salary: 4500.00, startDate: '2026-08-15', status: 'Active' },
    { id: 'EMP003', name: 'Carlos Rivera', role: 'Accountant',         dept: 'Finance',    salary: 4200.00, startDate: '2026-07-01', status: 'Active' },
    { id: 'EMP004', name: 'Aisha Patel',   role: 'Operations Lead',    dept: 'Operations', salary: 5500.00, startDate: '2026-06-01', status: 'Active' },
    { id: 'EMP005', name: 'Leo Nguyen',    role: 'QA Engineer',        dept: 'IT',         salary: 3800.00, startDate: '2026-09-10', status: 'Active' },
  ];

  seed.forEach(emp => {
    store.employees.push({ ...emp, createdAt: new Date().toISOString() });
  });

  // Seed payroll records for September
  const payDates = ['2026-09-15', '2026-09-22'];
  payDates.forEach((date, di) => {
    store.employees.forEach(emp => {
      const netPay = calculateNetPay(emp.salary, true, true);
      store.payrollRecords.push({
        id: `PAY-${Date.now()}-${emp.id}-${di}`,
        employeeId: emp.id,
        employeeName: emp.name,
        dept: emp.dept,
        grossSalary: emp.salary,
        tax: emp.salary * TAX_RATE,
        insurance: emp.salary * INSURANCE_RATE,
        netPay,
        paymentDate: date,
        processedAt: new Date().toISOString()
      });
    });
  });

  logActivity('System', 'Initialized with 5 demo employees', 'success');
}

/* ── Audit Activity Logger ── */
function logActivity(actor, message, type = 'info') {
  store.activityLog.unshift({
    actor: actor || 'System',
    message,
    type,
    time: new Date().toISOString()
  });
  if (store.activityLog.length > 50) store.activityLog.pop();
}

/* ── Formatting Helpers ── */
const fmt = n => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const timeAgo = iso => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};
