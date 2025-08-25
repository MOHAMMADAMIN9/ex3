// Project: EX3 - Personalized Cart Site
// File: public/js/nav.js
// Authors: Mohammad Amin 208650283
// Date: 25/08/2025
// Description: Minimal header controller. Shows Logout only when logged in.
// Note: Portions of this file were developed with guidance from ChatGPT (tutor). I reviewed and adapted the code.

document.addEventListener('DOMContentLoaded', async () => {
  const btnLogout = document.getElementById('btn-logout');

  // Show Logout only if logged in
  let loggedIn = false;
  try {
    const res = await fetch('/api/me');
    loggedIn = res.ok;
  } catch { /* ignore */ }

  if (btnLogout) btnLogout.style.display = loggedIn ? '' : 'none';

  // Logout action
  if (btnLogout) {
    btnLogout.addEventListener('click', async () => {
      try { await fetch('/api/logout', { method: 'POST' }); }
      finally { window.location.href = '/login.html'; }
    });
  }
});
