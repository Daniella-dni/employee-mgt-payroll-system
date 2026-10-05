/* Employee Management Module */

'use strict';

let empSearch = '';

/**
 * getAllEmployees — WB-03 (empty returns []), WB-04 (returns all)
 * @returns {Array}
 */
function getAllEmployees() {
  return [...store.employees]; // Always returns array, never null
}

/**
 * findEmployeeById — WB-05 (null id → throws)
 * @param {string|null} id
 * @returns {Object|null}
 */
function findEmployeeById(id) {
  if (id == null) {
    throw new Error('Employee ID cannot be null');
  }
  return store.employees.find(e => e.id === id) || null;
}

/**
 * addEmployee — BB-01 (valid), BB-02 (empty name → error)
 */
function addEmployee(data) {
  // BB-02: Validate required fields
  if (!data.name || data.name.trim() === '') {
    throw new Error('Employee name is required');
  }
  if (!data.id || data.id.trim() === '') {
    throw new Error('Employee ID is required');
  }
  if (!data.role || data.role.trim() === '') {
    throw new Error('Role/Position is required');
  }
  if (!data.dept || data.dept.trim() === '') {
    throw new Error('Department is required');
  }
  if (data.salary === undefined || data.salary === '' || isNaN(+data.salary)) {
    throw new Error('Valid salary is required');
  }
  if (+data.salary < 0) {
    throw new Error('Salary cannot be negative');
  }

  // Check duplicate ID
  if (store.employees.find(e => e.id === data.id)) {
    throw new Error(`Employee ID "${data.id}" already exists`);
  }

  const employee = {
    id: data.id.trim().toUpperCase(),
    name: data.name.trim(),
    role: data.role.trim(),
    dept: data.dept.trim(),
    salary: parseFloat(data.salary),
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  store.employees.push(employee);
  logActivity(store.authState.currentUser, `Added employee "${employee.name}" (${employee.id})`, 'success');
  return employee;
}

function deleteEmployee(id) {
  const idx = store.employees.findIndex(e => e.id === id);
  if (idx === -1) throw new Error('Employee not found');
  const emp = store.employees.splice(idx, 1)[0];
  logActivity(store.authState.currentUser, `Removed employee "${emp.name}" (${emp.id})`, 'danger');
  return emp;
}

function toggleEmployeeStatus(id) {
  const emp = findEmployeeById(id);
  if (!emp) throw new Error('Employee not found');
  emp.status = emp.status === 'Active' ? 'Inactive' : 'Active';
  return emp;
}

/* ── DOM Rendering for Employee Management ── */
function renderEmployees() {
  document.getElementById('emp-count').textContent = getAllEmployees().length;
  renderEmployeeTable();
}

function renderEmployeeTable() {
  const employees = getAllEmployees(); // WB-03/WB-04
  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(empSearch) ||
    e.id.toLowerCase().includes(empSearch) ||
    e.dept.toLowerCase().includes(empSearch) ||
    e.role.toLowerCase().includes(empSearch)
  );

  const tbody = document.getElementById('emp-tbody');

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>${empSearch ? 'No results found' : 'No employees yet'}</h3>
        <p>${empSearch ? 'Try adjusting your search' : 'Add your first employee to get started'}</p>
      </div>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(emp => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:34px;height:34px;border-radius:50%;background:var(--accent-gradient);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0">
            ${emp.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
          </div>
          <div>
            <div style="font-weight:600;color:var(--text-primary)">${emp.name}</div>
            <div style="font-size:11px;color:var(--text-muted)">${emp.id}</div>
          </div>
        </div>
      </td>
      <td>${emp.role}</td>
      <td><span class="badge badge-accent">${emp.dept}</span></td>
      <td class="font-mono">$${fmt(emp.salary)}</td>
      <td>${fmtDate(emp.startDate)}</td>
      <td>
        <span class="badge ${emp.status === 'Active' ? 'badge-success' : 'badge-neutral'}" style="cursor:pointer" onclick="handleToggleStatus('${emp.id}')">
          ${emp.status === 'Active' ? '● Active' : '○ Inactive'}
        </span>
      </td>
      <td class="text-right">
        <button class="btn btn-ghost btn-sm" onclick="openEditModal('${emp.id}')" title="Edit">✏️</button>
        <button class="btn btn-danger btn-sm" onclick="handleDeleteEmp('${emp.id}')" title="Delete">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function openAddEmployee() {
  document.getElementById('modal-emp-title').textContent = 'Add New Employee';
  document.getElementById('emp-form').reset();
  document.getElementById('emp-id').readOnly = false;
  document.getElementById('emp-id').value = `EMP00${store.employees.length + 1}`;
  document.getElementById('emp-start-date').value = new Date().toISOString().split('T')[0];
  openModal('modal-employee');
}

function openEditModal(id) {
  const emp = findEmployeeById(id);
  if (!emp) return;

  document.getElementById('modal-emp-title').textContent = 'Edit Employee';
  document.getElementById('emp-id').value = emp.id;
  document.getElementById('emp-id').readOnly = true;
  document.getElementById('emp-name').value = emp.name;
  document.getElementById('emp-role').value = emp.role;
  document.getElementById('emp-dept').value = emp.dept;
  document.getElementById('emp-salary').value = emp.salary;
  document.getElementById('emp-start-date').value = emp.startDate;
  openModal('modal-employee');
}

async function handleEmpFormSubmit(e) {
  e.preventDefault();
  const id        = document.getElementById('emp-id').value.trim();
  const name      = document.getElementById('emp-name').value.trim();
  const role      = document.getElementById('emp-role').value.trim();
  const dept      = document.getElementById('emp-dept').value;
  const salary    = document.getElementById('emp-salary').value;
  const startDate = document.getElementById('emp-start-date').value;

  const isEdit = store.employees.some(e => e.id === id);

  try {
    if (await Api.isBackendAvailable()) {
      if (isEdit) {
        const emp = findEmployeeById(id);
        emp.name = name; emp.role = role; emp.dept = dept;
        emp.salary = parseFloat(salary); emp.startDate = startDate;
        showToast('success', 'Employee Updated', `${emp.name}'s record has been updated`);
      } else {
        const created = await Api.addEmployee({ id, name, role, dept, salary: parseFloat(salary), startDate });
        const exists = store.employees.find(e => e.id === created.id);
        if (!exists) store.employees.push(created);
        showToast('success', 'Employee Added', `BB-01: ${name} added to Java Backend`);
      }
    } else {
      if (isEdit) {
        const emp = findEmployeeById(id);
        emp.name = name; emp.role = role; emp.dept = dept;
        emp.salary = parseFloat(salary); emp.startDate = startDate;
        logActivity(store.authState.currentUser, `Updated employee "${emp.name}" (${emp.id})`, 'info');
        showToast('success', 'Employee Updated', `${emp.name}'s record has been updated`);
      } else {
        addEmployee({ id, name, role, dept, salary, startDate });
        showToast('success', 'Employee Added', `BB-01: ${name} added successfully`);
      }
    }
    closeModal('modal-employee');
    renderEmployees();
  } catch (err) {
    showToast('error', 'Validation Error', err.message);
  }
}

async function handleDeleteEmp(id) {
  const emp = findEmployeeById(id);
  if (!emp) return;

  if (confirm(`Are you sure you want to remove ${emp.name} (${emp.id})?`)) {
    try {
      if (await Api.isBackendAvailable()) {
        await Api.deleteEmployee(id);
      }
      deleteEmployee(id);
      showToast('info', 'Employee Removed', `${emp.name} was deleted from database`);
      renderEmployees();
    } catch (err) {
      showToast('error', 'Delete Error', err.message);
    }
  }
}

function handleToggleStatus(id) {
  try {
    const emp = toggleEmployeeStatus(id);
    showToast('info', 'Status Changed', `${emp.name} is now ${emp.status}`);
    renderEmployeeTable();
  } catch (err) {
    showToast('error', 'Error', err.message);
  }
}
