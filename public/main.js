// ============================================================
//  Security Lab — main.js
//  Frontend fetch logic for Register, Login, and Attack panel
// ============================================================

function showResp(id, data, isOk) {
  const el = document.getElementById(id);
  el.textContent = JSON.stringify(data, null, 2);
  el.className = 'response ' + (isOk ? 'ok' : 'error');
}

async function register() {
  const body = {
    name:     document.getElementById('reg-name').value,
    email:    document.getElementById('reg-email').value,
    password: document.getElementById('reg-password').value,
  };
  try {
    const res  = await fetch('/register', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    showResp('reg-resp', data, res.ok);
  } catch (e) {
    showResp('reg-resp', { error: e.message }, false);
  }
}

async function login() {
  const body = {
    email:    document.getElementById('log-email').value,
    password: document.getElementById('log-password').value,
  };
  try {
    const res  = await fetch('/login', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    });
    const data = await res.json();
    showResp('log-resp', data, res.ok);
  } catch (e) {
    showResp('log-resp', { error: e.message }, false);
  }
}

async function fetchProfile() {
  const id = document.getElementById('profile-id').value;
  try {
    const res  = await fetch(`/profile?id=${id}`);
    const data = await res.json();
    showResp('attack-resp', data, res.ok);
  } catch (e) {
    showResp('attack-resp', { error: e.message }, false);
  }
}

async function dumpUsers() {
  try {
    const res  = await fetch('/users');
    const data = await res.json();
    showResp('attack-resp', data, true);
  } catch (e) {
    showResp('attack-resp', { error: e.message }, false);
  }
}
