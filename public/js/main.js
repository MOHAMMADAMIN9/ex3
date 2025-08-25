// Project: EX3 - Personalized Cart Site
// File: public/js/main.js
// Authors: Mohammad Amin 208650283
// Date: 25/08/2025
// Description: Protected cart UI. Loads with GET /api/cart, saves instantly with POST /api/cart.
// Note: Portions of this file were developed with guidance from ChatGPT (tutor). I reviewed and adapted the code.


document.addEventListener('DOMContentLoaded', async () => {
  // Check who is logged in
  const me = await fetch('/api/me');
  if (me.status === 401) {
    window.location.href = '/login.html';
    return;
  }
  const meData = await me.json();
  if (!meData.ok) {
    window.location.href = '/login.html';
    return;
  }
  const username = meData.username;

  const welcome = document.getElementById('welcome');
  const cartArea = document.getElementById('cart-area');
  const list = document.getElementById('cart-list');
  const form = document.getElementById('add-item-form');
  const totalSpan = document.getElementById('total');
  const clearBtn = document.getElementById('btn-clear');

  welcome.textContent = `Welcome, ${username}!`;
  cartArea.style.display = '';

  let cart = [];

  function updateTotal(){
    const total = cart.reduce((sum, it) => sum + it.qty, 0);
    if (totalSpan) totalSpan.textContent = `Total items: ${total}`;
  }

  function addOrInc(name, qty) {
    const i = cart.findIndex(it => it.name.toLowerCase() === name.toLowerCase());
    if (i >= 0) {
      cart[i].qty = Math.min(99, cart[i].qty + qty);
    } else {
      cart.push({ name, qty });
    }
  }

  function render() {
    list.innerHTML = '';
    cart.forEach((item, i) => {
      const li = document.createElement('li');

      const left = document.createElement('div');
      left.className = 'item-left';
      const name = document.createElement('span');
      name.className = 'item-name';
      name.textContent = item.name;
      const qtyPill = document.createElement('span');
      qtyPill.className = 'item-qty';
      qtyPill.textContent = `x${item.qty}`;
      left.appendChild(name);
      left.appendChild(qtyPill);

      const ctrls = document.createElement('div');
      ctrls.className = 'controls';

      const minus = document.createElement('button');
      minus.type = 'button';
      minus.className = 'icon-btn';
      minus.textContent = '−';
      minus.title = 'Subtract 1';
      minus.addEventListener('click', async () => {
        if (cart[i].qty > 1) {
          cart[i].qty -= 1;
        } else {
          cart.splice(i, 1);
        }
        render();
        updateTotal();
        await saveCart();
      });

      const plus = document.createElement('button');
      plus.type = 'button';
      plus.className = 'icon-btn';
      plus.textContent = '+';
      plus.title = 'Add 1';
      plus.addEventListener('click', async () => {
        if (cart[i].qty < 99) {
          cart[i].qty += 1;
          render();
          updateTotal();
          await saveCart();
        } else {
          alert('Max quantity is 99.');
        }
      });

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'delete danger';
      del.textContent = 'Delete';
      del.title = 'Remove item';
      del.addEventListener('click', async () => {
        cart.splice(i, 1);
        render();
        updateTotal();
        await saveCart();
      });

      ctrls.appendChild(minus);
      ctrls.appendChild(plus);
      ctrls.appendChild(del);

      li.appendChild(left);
      li.appendChild(ctrls);
      list.appendChild(li);
    });
  }

  async function loadCart() {
    const res = await fetch('/api/cart');
    if (!res.ok) return;
    const data = await res.json();
    cart = Array.isArray(data.cart) ? data.cart : [];
    render();
    updateTotal();
  }

  async function saveCart() {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart })
    });
    if (!res.ok) console.warn('Save failed');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = (fd.get('name') || '').toString().trim();
    const qty = parseInt(fd.get('qty'), 10);

    if (!name || name.length > 40 || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      alert('Please enter a valid item name (1–40 chars) and quantity (1–99).');
      return;
    }

    addOrInc(name, qty);
    form.reset();
    render();
    updateTotal();
    await saveCart();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', async () => {
      if (!cart.length) return;
      if (!confirm('Clear all items?')) return;
      cart = [];
      render();
      updateTotal();
      await saveCart();
    });
  }

  await loadCart();
});
