(function () {
  'use strict';

  function formatPrice(value) {
    return Number(value).toFixed(2) + ' ₾';
  }

  function renderCart() {
    var cart = window.TechGrid.readCart();
    var itemsContainer = document.getElementById('cart-items');
    var emptyState = document.getElementById('cart-empty');
    var cartContent = document.getElementById('cart-content');
    var subtotalEl = document.getElementById('cart-subtotal');
    var orderBtn = document.getElementById('order-whatsapp');

    if (!cart.length) {
      emptyState.hidden = false;
      cartContent.hidden = true;
      return;
    }

    emptyState.hidden = true;
    cartContent.hidden = false;

    var html = '';
    var subtotal = 0;

    cart.forEach(function (item) {
      var lineTotal = Number(item.price) * Number(item.qty);
      subtotal += lineTotal;

      html += `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item__image">
            ${item.image 
                ? `<img src="${item.image}" alt="${item.name}" width="90" height="70" style="width:100%; height:100%; object-fit:cover; border-radius:6px;">` 
                : ''}
          </div> 
          <div class="cart-item__info">
            <h3>${item.name}</h3>
            <div class="cart-item__meta">SKU: ${item.sku}</div>
            <div class="cart-item__price">${formatPrice(item.price)}</div>
            <div style="margin-top:0.75rem;">
              <div class="qty-control">
                <button type="button" data-action="decrease" aria-label="Decrease quantity">−</button>
                <span>${item.qty}</span>
                <button type="button" data-action="increase" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <button type="button" class="cart-item__remove" data-action="remove">Remove</button>
          </div>
        </div>
      `;
    });

    itemsContainer.innerHTML = html;
    subtotalEl.textContent = formatPrice(subtotal);
    orderBtn.disabled = false;
  }

  function updateCart(cart) {
    localStorage.setItem(window.TechGrid.CART_KEY, JSON.stringify(cart));
    window.TechGrid.updateCartBadge();
    document.dispatchEvent(new Event('cart:updated'));
    renderCart();
  }

  document.addEventListener('click', function (e) {
    var button = e.target.closest('[data-action]');
    if (!button) return;

    var itemEl = button.closest('.cart-item');
    if (!itemEl) return;

    var id = itemEl.getAttribute('data-id');
    var cart = window.TechGrid.readCart();
    var item = cart.find(function (i) { return String(i.id) === String(id); });
    if (!item) return;

    var action = button.getAttribute('data-action');

    if (action === 'increase') {
      item.qty = Number(item.qty) + 1;
    }

    if (action === 'decrease') {
      item.qty = Number(item.qty) - 1;
      if (item.qty < 1) {
        cart = cart.filter(function (i) { return String(i.id) !== String(id); });
      }
    }

    if (action === 'remove') {
      cart = cart.filter(function (i) { return String(i.id) !== String(id); });
    }

    updateCart(cart);
  });

  // Initial render
  document.addEventListener('DOMContentLoaded', renderCart);
})();