/* Navigation & Controller */

'use strict';

/* ── Toast Notification Helper ── */
function showToast(type, title, msg, duration = 4000) {
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <div class="toast-text">
      <div class="toast-title">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
    </div>
    <span class="toast-dismiss" onclick="dismissToast(this)">✕</span>
  `;

  container.appendChild(toast);
  setTimeout(() => dismissToast(toast.querySelector('.toast-dismiss')), duration);
}

function dismissToast(btn) {
  if (!btn) return;
  const toast = btn.closest('.toast');
  if (!toast) return;
  toast.classList.add('hiding');
  toast.addEventListener('animationend', () => toast.remove());
}

/* ── Modal System Helpers ── */
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
}

/* ── Login UI Initialization ── */
function initLogin() {
  const form      = document.getElementById('login-form');
  const usernameI = document.getElementById('login-username');
  const passwordI = document.getElementById('login-password');
  const errorDiv  = document.getElementById('login-error');
  const btnLogin  = document.getElementById('btn-login');
  const togglePw  = document.getElementById('toggle-pw');

  if (togglePw) {
    togglePw.addEventListener('click', () => {
      const type = passwordI.type === 'password' ? 'text' : 'password';
      passwordI.type = type;
      togglePw.textContent = type === 'password' ? '👁️' : '🙈';
    });
  }

  checkLockState();

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      errorDiv.style.display = 'none';
      btnLogin.disabled = true;
      btnLogin.innerHTML = '<div class="spinner"></div> Authenticating…';

      await new Promise(r => setTimeout(r, 600));

      try {
        const result = authenticate(usernameI.value.trim(), passwordI.value);
        showApp(result.user);
      } catch (err) {
        const msg = err.message;
        if (msg.startsWith('LOCKED:')) {
          showLockBanner(msg.replace('LOCKED:', ''));
        } else {
          const clean = msg.replace('INVALID:', '');
          errorDiv.textContent = clean;
          errorDiv.style.display = 'block';

          const att = document.getElementById('attempt-badge');
          if (att) {
            att.textContent = `Failed attempts: ${store.authState.failedAttempts} / ${MAX_ATTEMPTS}`;
            att.style.display = 'block';
          }
        }
      } finally {
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<span>🔐</span> Sign In';
      }
    });
  }
}

function showLockBanner(msg) {
  const banner = document.getElementById('lock-banner');
  const msgEl = document.getElementById('lock-msg');
  const btn = document.getElementById('btn-login');

  if (msgEl) msgEl.textContent = msg;
  if (banner) banner.style.display = 'flex';
  if (btn) btn.disabled = true;
}

function checkLockState() {
  if (store.authState.lockedUntil && new Date() < new Date(store.authState.lockedUntil)) {
    showLockBanner('Account locked. Contact administrator.');
  }
}

/* ── App Initialization & View Switch ── */
function showApp(user) {
  document.getElementById('login-page').style.display = 'none';
  const app = document.getElementById('app');
  app.style.display = 'block';

  document.getElementById('sidebar-user-name').textContent = user.name;
  document.getElementById('sidebar-user-role').textContent = user.role;
  document.getElementById('sidebar-user-avatar').textContent = user.name.split(' ').map(n => n[0]).join('').slice(0,2);

  document.getElementById('topbar-user').textContent = user.name;
  document.getElementById('topbar-date').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  navigateTo('dashboard');
}

function doLogout() {
  logout();
  document.getElementById('app').style.display = 'none';
  const lp = document.getElementById('login-page');
  lp.style.display = 'flex';
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').style.display = 'none';
  document.getElementById('lock-banner').style.display = 'none';
  const att = document.getElementById('attempt-badge');
  if (att) att.style.display = 'none';
}

/* ── Navigation Routing ── */
function navigateTo(page) {
  document.querySelectorAll('.page-content').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const target = document.getElementById(`page-${page}`);
  if (target) target.classList.add('active');

  const navItem = document.querySelector(`[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  const titles = {
    dashboard:   { title: 'Dashboard',            sub: 'Overview of your organization' },
    employees:   { title: 'Employee Management',  sub: 'Manage employee records — FR1' },
    payroll:     { title: 'Process Payroll',       sub: 'Calculate salaries & deductions — FR2/FR3' },
    reports:     { title: 'Payroll Reports',       sub: 'Generate reports by date range — FR4' },
    testlog:     { title: 'Test Case Log',         sub: 'QA results from test suite execution' },
  };

  if (titles[page]) {
    document.getElementById('topbar-title').textContent    = titles[page].title;
    document.getElementById('topbar-subtitle').textContent = titles[page].sub;
  }

  switch (page) {
    case 'dashboard': renderDashboard(); break;
    case 'employees': renderEmployees(); break;
    case 'payroll':   renderPayroll();   break;
    case 'reports':   renderReports();  break;
    case 'testlog':   renderTestLog();  break;
  }
}

/* ── Dashboard Rendering ── */
function renderDashboard() {
  const employees = getAllEmployees();
  const active = employees.filter(e => e.status === 'Active').length;
  const records = store.payrollRecords;
  const thisMonth = records.filter(r => r.paymentDate.startsWith('2026-09')).reduce((s, r) => s + r.netPay, 0);

  document.getElementById('stat-employees').textContent  = employees.length;
  document.getElementById('stat-active').textContent     = active;
  document.getElementById('stat-payroll').textContent    = '$' + fmt(thisMonth);
  document.getElementById('stat-records').textContent    = records.length;

  const deptMap = {};
  employees.forEach(e => { deptMap[e.dept] = (deptMap[e.dept] || 0) + 1; });
  const deptContainer = document.getElementById('dept-bars');
  const colors = ['#6366f1','#10b981','#f59e0b','#f43f5e','#38bdf8'];
  let deptHtml = '';
  Object.entries(deptMap).sort((a,b) => b[1]-a[1]).forEach(([dept, count], i) => {
    const pct = Math.round((count / employees.length) * 100);
    deptHtml += `
      <div class="dept-bar">
        <div class="dept-bar-header">
          <span class="dept-bar-name">${dept}</span>
          <span class="dept-bar-count">${count} employee${count !== 1 ? 's' : ''}</span>
        </div>
        <div class="dept-bar-track">
          <div class="dept-bar-fill" style="width:0%;background:${colors[i%colors.length]}" data-w="${pct}%"></div>
        </div>
      </div>
    `;
  });
  deptContainer.innerHTML = deptHtml || '<p class="text-muted" style="font-size:13px">No data yet</p>';

  requestAnimationFrame(() => {
    document.querySelectorAll('.dept-bar-fill').forEach(b => {
      b.style.width = b.dataset.w;
    });
  });

  const actContainer = document.getElementById('activity-list');
  const typeColors = { success:'#10b981', danger:'#f43f5e', warning:'#f59e0b', info:'#38bdf8' };
  if (store.activityLog.length === 0) {
    actContainer.innerHTML = '<div class="empty-state"><div class="empty-icon">📋</div><p>No activity yet</p></div>';
  } else {
    actContainer.innerHTML = store.activityLog.slice(0, 10).map(a => `
      <div class="activity-item">
        <div class="activity-dot" style="background:${typeColors[a.type]||'#94a3b8'}"></div>
        <div class="activity-text">
          <strong>${a.actor}</strong> — ${a.message}
          <div class="activity-time">${timeAgo(a.time)}</div>
        </div>
      </div>
    `).join('');
  }
}

/* ── DOM Ready Event Listeners ── */
document.addEventListener('DOMContentLoaded', () => {
  seedDemoData();
  initLogin();

  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
  });

  document.getElementById('btn-logout')?.addEventListener('click', doLogout);

  document.getElementById('emp-search')?.addEventListener('input', e => {
    empSearch = e.target.value.toLowerCase();
    renderEmployeeTable();
  });

  document.getElementById('emp-form')?.addEventListener('submit', handleEmpFormSubmit);
  document.getElementById('btn-add-employee')?.addEventListener('click', openAddEmployee);

  document.getElementById('payroll-form')?.addEventListener('submit', handlePayrollCalc);
  document.getElementById('payroll-emp-select')?.addEventListener('change', updatePayrollPreview);
  document.getElementById('payroll-hours')?.addEventListener('input', updatePayrollPreview);
  document.getElementById('payroll-tax-check')?.addEventListener('change', updatePayrollPreview);
  document.getElementById('payroll-ins-check')?.addEventListener('change', updatePayrollPreview);

  document.getElementById('report-form')?.addEventListener('submit', handleGenerateReport);

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  document.addEventListener('click', e => {
    if (e.target.classList.contains('modal-overlay')) {
      e.target.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
});
