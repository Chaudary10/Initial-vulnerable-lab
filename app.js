// ============================================================
//  SECURITY LAB — app.js
//  ⚠️  PURPOSEFULLY VULNERABLE — for educational use only ⚠️
// ============================================================

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ── Mock "Database" (in-memory array) ────────────────────
// VULNERABILITY #2 — passwords stored as plain text
const users = [
  { id: 1, email: 'alice@example.com', password: 'password123', name: 'Alice' },
  { id: 2, email: 'bob@example.com',   password: 'hunter2',     name: 'Bob'   },
];
let nextId = 3;

// ── Routes ────────────────────────────────────────────────

// Serve the frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// VULNERABILITY #1 — No input validation on email or password
app.post('/register', (req, res) => {
  const { email, password, name } = req.body;

  // No check: is email a valid format? Is password long enough?
  // Anyone can register with `notAnEmail` or a blank password.

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  // VULNERABILITY #2 — Password stored in plain text, no hashing
  const newUser = { id: nextId++, email, password, name };
  users.push(newUser);

  res.status(201).json({
    message: `User "${name}" registered successfully.`,
    user: { id: newUser.id, email: newUser.email, name: newUser.name },
  });
});

// VULNERABILITY #1 (continued) — No validation on login inputs
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Plain-text comparison — no bcrypt, no timing-safe compare
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // VULNERABILITY #3 — No real session or JWT issued.
  // We just hand back the user object and trust the client.
  res.json({
    message: `Welcome back, ${user.name}!`,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

// VULNERABILITY #3 — Profile accessible by URL param, no auth required
// Anyone can visit /profile?id=1 and read any user's data.
app.get('/profile', (req, res) => {
  const id = parseInt(req.query.id, 10);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Returns the password too — oops!
  res.json({ id: user.id, email: user.email, name: user.name, password: user.password });
});

// Debug route — exposes entire "database"
// VULNERABILITY #3 (bonus) — No access control whatsoever
app.get('/users', (req, res) => {
  res.json(users); // plain-text passwords visible to anyone
});

// ── VULNERABILITY #4 — No Helmet / security headers ──────
// The app ships without any of the following headers:
//   X-Frame-Options, X-Content-Type-Options,
//   Content-Security-Policy, Strict-Transport-Security, etc.
// This leaves it open to clickjacking, MIME sniffing, XSS, etc.

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n⚠️  Security Lab running at http://localhost:${PORT}`);
  console.log('   This app is INTENTIONALLY VULNERABLE — do not deploy publicly.\n');
});
