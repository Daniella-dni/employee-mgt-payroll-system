/* System Configuration & Constants */

'use strict';

const TAX_RATE       = 0.15;
const INSURANCE_RATE = 0.05;
const MAX_ATTEMPTS   = 3;
const LOCKOUT_MINS   = 5;

const API_BASE_URL = 'http://localhost:8080/api';

/* Valid credentials — matches test case BB-06 / WB-08 */
const CREDENTIALS = {
  admin: {
    password: 'Admin@1234',
    role: 'System Administrator',
    name: 'Admin User'
  }
};

