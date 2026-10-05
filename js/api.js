/* REST API Integration Client */

'use strict';

const Api = {
  /**
   * Check if Java backend is running
   */
  async isBackendAvailable() {
    try {
      const res = await fetch(`${API_BASE_URL}/employees`, { method: 'GET' });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  /**
   * Authenticate via Java Backend REST API
   */
  async login(username, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Authentication failed');
    }
    return data;
  },

  /**
   * Fetch all employees from Java Backend
   */
  async getEmployees() {
    const res = await fetch(`${API_BASE_URL}/employees`);
    if (!res.ok) throw new Error('Failed to fetch employees from backend');
    return await res.json();
  },

  /**
   * Add new employee to Java Backend
   */
  async addEmployee(empData) {
    const res = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add employee');
    return data.data;
  },

  /**
   * Delete employee from Java Backend
   */
  async deleteEmployee(id) {
    const res = await fetch(`${API_BASE_URL}/employees/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete employee');
    return data.data;
  },

  /**
   * Toggle employee status in Java Backend
   */
  async toggleStatus(id) {
    const res = await fetch(`${API_BASE_URL}/employees/${encodeURIComponent(id)}/status`, {
      method: 'PATCH'
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update employee status');
    return data.data;
  },

  /**
   * Process payroll record via Java Backend
   */
  async processPayroll(payload) {
    const res = await fetch(`${API_BASE_URL}/payroll/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to process payroll');
    return data.data;
  },

  /**
   * Get payroll records from Java Backend
   */
  async getPayrollRecords() {
    const res = await fetch(`${API_BASE_URL}/payroll/records`);
    if (!res.ok) throw new Error('Failed to fetch payroll records');
    return await res.json();
  },

  /**
   * Get activity logs from Java Backend
   */
  async getLogs() {
    const res = await fetch(`${API_BASE_URL}/logs`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return await res.json();
  }
};
