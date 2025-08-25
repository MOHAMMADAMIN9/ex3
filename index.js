/*
  Project: EX3 - Personalized Cart Site
  File: index.js
  Author: Mohammad Amin 208650283
  Date: 25/08/2025
  Description: Node.js + Express server for registration/login, cookie-based sessions,
               protected main page, and per-user cart stored as JSON with instant fetch saves.
  Imports:
    - express
    - path
    - fs
    - crypto
    - cookie-parser
  GitHub: https://github.com/MOHAMMADAMIN9/ex3
*/

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');

const app = express();

//JSON DB ---
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const CARTS_DIR = path.join(DATA_DIR, 'carts');

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}
function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Ensure data files/dirs exist
ensureDir(DATA_DIR);
ensureDir(CARTS_DIR);
if (!fs.existsSync(USERS_FILE)) writeJson(USERS_FILE, {});      // { username: { password } }
if (!fs.existsSync(SESSIONS_FILE)) writeJson(SESSIONS_FILE, {}); // { token: { username, createdAt } }

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static assets from /public
app.use(express.static(path.join(__dirname, 'public')));


// Root -> login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// -------- session helper + auth middleware --------
function getUserFromSession(req) {
  const token = req.cookies?.session;
  if (!token) return null;
  const sessions = readJson(SESSIONS_FILE, {});
  const entry = sessions[token];
  return entry ? entry.username : null;
}

function requireAuth(req, res, next) {
  const username = getUserFromSession(req);
  if (!username) {
    return res.status(401).sendFile(path.join(__dirname, 'public', 'login.html'));
  }
  req.username = username;
  next();
}

// -------- API: auth --------
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || username.length < 3 || password.length < 6) {
    return res.status(400).json({ ok: false, error: 'Invalid username or password.' });
  }

  const users = readJson(USERS_FILE, {});
  if (users[username]) {
    return res.status(409).json({ ok: false, error: 'Username already exists.' });
  }

  // Coursework simplification: store plain password (real apps: hash)
  users[username] = { password };
  writeJson(USERS_FILE, users);

  res.json({ ok: true, message: 'Registered successfully. You can now log in.' });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const users = readJson(USERS_FILE, {});
  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ ok: false, error: 'Invalid username or password.' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  const sessions = readJson(SESSIONS_FILE, {});
  sessions[token] = { username, createdAt: Date.now() };
  writeJson(SESSIONS_FILE, sessions);

  res.cookie('session', token, { httpOnly: true, sameSite: 'lax' });
  res.json({ ok: true, message: 'Logged in', username });
});

app.post('/api/logout', (req, res) => {
  const token = req.cookies?.session;
  if (token) {
    const sessions = readJson(SESSIONS_FILE, {});
    delete sessions[token];
    writeJson(SESSIONS_FILE, sessions);
  }
  res.clearCookie('session', { httpOnly: true, sameSite: 'lax' });
  res.json({ ok: true });
});

// who am I?
app.get('/api/me', (req, res) => {
  const username = getUserFromSession(req);
  if (!username) return res.status(401).json({ ok: false });
  res.json({ ok: true, username });
});

// -------- Protected main page --------
app.get('/main.html', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

// -------- per-user cart API --------
app.get('/api/cart', requireAuth, (req, res) => {
  const cartFile = path.join(CARTS_DIR, `${req.username}.json`);
  const cart = readJson(cartFile, []);
  res.json({ ok: true, cart });
});

app.post('/api/cart', requireAuth, (req, res) => {
  const cart = req.body?.cart;
  if (!Array.isArray(cart)) {
    return res.status(400).json({ ok: false, error: 'Cart must be an array.' });
  }
  for (const item of cart) {
    const nameOk = typeof item.name === 'string' && item.name.trim().length >= 1 && item.name.trim().length <= 40;
    const qtyOk = Number.isInteger(item.qty) && item.qty >= 1 && item.qty <= 99;
    if (!nameOk || !qtyOk) {
      return res.status(400).json({ ok: false, error: 'Invalid item. Check name (1-40 chars) and qty (1-99).' });
    }
  }
  const cartFile = path.join(CARTS_DIR, `${req.username}.json`);
  writeJson(cartFile, cart);
  res.json({ ok: true, saved: cart.length });
});

// --- Start server ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
/* NOTE: Portions of this server logic were designed with guidance from ChatGPT.
   I reviewed and adapted the code. */
