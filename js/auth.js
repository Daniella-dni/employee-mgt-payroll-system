/* Authentication & Security Module */

'use strict';

let lockTimerInterval = null;

/**
 * authenticate — BB-06, BB-07, WB-08, WB-09
 * @param {string} username
 * @param {string} password
 * @returns {Object}
 */
function authenticate(username, password) {
  const auth = store.authState;

  // Check if account is locked out (WB-09)
  if (auth.lockedUntil && new Date() < new Date(auth.lockedUntil)) {
    const remaining = Math.ceil((new Date(auth.lockedUntil) - new Date()) / 60000);
    throw new Error(`LOCKED:Account locked. Contact administrator. Try again in ${remaining} min.`);
  }

  // Reset lockout if expired
  if (auth.lockedUntil && new Date() >= new Date(auth.lockedUntil)) {
    auth.failedAttempts = 0;
    auth.lockedUntil   = null;
  }

  const user = CREDENTIALS[username?.toLowerCase()];

  // WB-08: BCrypt-equivalent check (plaintext for demo)
  if (user && password === user.password) {
    auth.failedAttempts = 0;
    auth.lockedUntil   = null;
    auth.currentUser   = user.name;
    logActivity(user.name, 'Logged in successfully', 'success');
    return { success: true, user };
  }

  // BB-07: Invalid credentials tracking
  auth.failedAttempts++;

  // WB-09: Lock account on 3 failed attempts
  if (auth.failedAttempts >= MAX_ATTEMPTS) {
    auth.lockedUntil = new Date(Date.now() + LOCKOUT_MINS * 60 * 1000).toISOString();
    throw new Error('LOCKED:Account locked. Contact administrator.');
  }

  const remaining = MAX_ATTEMPTS - auth.failedAttempts;
  throw new Error(`INVALID:Invalid username or password. ${remaining} attempt(s) remaining.`);
}

function logout() {
  logActivity(store.authState.currentUser, 'Logged out', 'info');
  store.authState.currentUser = null;
}

function checkLockoutStatus() {
  const auth = store.authState;
  if (auth.lockedUntil && new Date() < new Date(auth.lockedUntil)) {
    startLockTimer(new Date(auth.lockedUntil));
    return true;
  }
  return false;
}

function startLockTimer(untilDate) {
  const banner = document.getElementById('lock-banner');
  const timerSpan = document.getElementById('lock-timer');
  const btn = document.getElementById('btn-login');

  if (banner) banner.style.display = 'flex';
  if (btn) btn.disabled = true;

  clearInterval(lockTimerInterval);
  lockTimerInterval = setInterval(() => {
    const diff = Math.max(0, untilDate - new Date());
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (timerSpan) timerSpan.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;

    if (diff <= 0) {
      clearInterval(lockTimerInterval);
      if (banner) banner.style.display = 'none';
      if (btn) btn.disabled = false;
      store.authState.failedAttempts = 0;
      store.authState.lockedUntil = null;
    }
  }, 1000);
}
