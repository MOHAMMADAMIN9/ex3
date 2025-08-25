// Project: EX3 - Personalized Cart Site
// File: public/js/auth.js
// Authors: Mohammad Amin 208650283
// Date: 25/08/2025
// Description: Front-end logic for register/login via fetch to /api/register and /api/login.
// Note: Portions of this file were developed with guidance from ChatGPT (tutor). I reviewed and adapted the code.

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('#login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(loginForm);
      const payload = Object.fromEntries(form.entries());

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          alert(data.error || 'Login failed');
          return;
        }
        window.location.href = '/main.html';
      } catch {
        alert('Network error. Try again.');
      }
    });
  }

  const registerForm = document.querySelector('#register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(registerForm);
      const payload = Object.fromEntries(form.entries());

      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          alert(data.error || 'Registration failed');
          return;
        }
        alert('Registered! Please log in.');
        window.location.href = '/login.html';
      } catch {
        alert('Network error. Try again.');
      }
    });
  }
});
