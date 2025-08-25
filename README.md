# EX3 — Personalized Cart (Node.js)

**Author(s):** Mohammad Amin 
**Date:** 25/08/2025  

## Overview
A small site with **register/login**, a **protected main page**, and a **per-user cart** that **persists across logouts**.
All changes save **instantly** to the server via `fetch`. Frontend is **plain HTML/CSS/JS** (no inline CSS/JS), backend is **Node.js + Express**.

## Features
- Register & Login (cookie session, `httpOnly`, `sameSite: 'lax'`)
- Protected `/main.html` (redirects if not logged in)
- Per-user cart stored as JSON (`data/carts/<username>.json`)
- Instant save on add / + / − / delete (POST `/api/cart`)
- Responsive styling (desktop & mobile), clean separation of files
- Minimal header with **Logout** only

## Tech Stack
- Node.js (LTS), Express, cookie-parser  
- Vanilla HTML/CSS/JS (no frameworks)



## Setup & Run (Windows)
```bash
# in project root
npm install
node index.js
# open:
#  http://localhost:3000/login.html
#  http://localhost:3000/register.html
#  http://localhost:3000/main.html  (after login)


