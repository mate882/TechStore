/* ==========================================================================
   TechGrid: main.js
   Basic structure only. Each feature is a small function started by init().
   Contents
   1. Cart storage helpers (localStorage)
   2. Cart badge in the header
   3. Mobile menu
   4. Categories dropdown
   5. Start-up
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Cart storage helpers
     The cart is a list of { id, sku, qty } objects saved under CART_KEY.
     The full cart logic (add, remove, WhatsApp message) will live in its own
     file later. This file only needs to read the item count.
     ------------------------------------------------------------------------ */
  var CART_KEY = 'techgrid_cart';

  function readCart() {
    try {
      var raw = window.localStorage.getItem(CART_KEY);
      var items = raw ? JSON.parse(raw) : [];
      return Array.isArray(items) ? items : [];
    } catch (error) {
      // Private mode, blocked storage or corrupted JSON: behave like an empty cart.
      return [];
    }
  }

  function getCartCount() {
    return readCart().reduce(function (total, item) {
      var qty = Number(item && item.qty);
      return total + (Number.isFinite(qty) && qty > 0 ? Math.floor(qty) : 0);
    }, 0);
  }

  /* ------------------------------------------------------------------------
     2. Cart badge
     Updates every [data-cart-count] badge and the accessible label of every
     [data-cart-link]. Call TechGrid.updateCartBadge() after any cart change.
     ------------------------------------------------------------------------ */
  function updateCartBadge() {
    var count = getCartCount();
    var label = 'Cart, ' + count + (count === 1 ? ' item' : ' items');

    document.querySelectorAll('[data-cart-count]').forEach(function (badge) {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.setAttribute('data-count', String(count));
    });
    document.querySelectorAll('[data-cart-link]').forEach(function (link) {
      link.setAttribute('aria-label', label);
    });
  }

  /* ------------------------------------------------------------------------
     3. Mobile menu
     The toggle shows or hides #site-nav on small screens. On wide screens the
     menu is always visible (CSS), so we close it when the window grows.
     ------------------------------------------------------------------------ */
  function initMobileMenu() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var nav = document.getElementById('site-nav');
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    var desktop = window.matchMedia('(min-width: 56rem)');
    desktop.addEventListener('change', function (event) {
      if (event.matches) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------------
     4. Categories dropdown
     <details> already opens and closes without JavaScript. We only add the
     usual extras: close on outside click and on Escape.
     ------------------------------------------------------------------------ */
  function initDropdowns() {
    var dropdowns = document.querySelectorAll('[data-dropdown]');
    if (!dropdowns.length) return;

    document.addEventListener('click', function (event) {
      dropdowns.forEach(function (dropdown) {
        if (dropdown.open && !dropdown.contains(event.target)) dropdown.open = false;
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      dropdowns.forEach(function (dropdown) {
        if (dropdown.open) {
          dropdown.open = false;
          var summary = dropdown.querySelector('summary');
          if (summary) summary.focus();
        }
      });
    });
  }

    /* ------------------------------------------------------------------------
     Add to Cart
     Listens for clicks on [data-add-to-cart] buttons and saves the product
     into localStorage. Uses the existing TechGrid helpers.
     ------------------------------------------------------------------------ */
    function initAddToCart() {
      document.addEventListener('click', function (event) {
        var button = event.target.closest('[data-add-to-cart]');
        if (!button || button.disabled) {
          console.log('No button or disabled');
          return;
        }

        var id = button.getAttribute('data-product-id');
        var sku = button.getAttribute('data-sku');
        var name = button.getAttribute('data-name');
        var price = button.getAttribute('data-price');
        var image = button.getAttribute('data-image') || '';

        console.log('Data:', { id: id, sku: sku, name: name, price: price });

        if (!id || !sku || !name || !price) {
          console.log('Missing data');
          return;
        }

        var cart = window.TechGrid.readCart();
        console.log('Current cart:', cart);

        var existing = cart.find(function (item) {
          return String(item.id) === String(id);
        });

        if (existing) {
          existing.qty = (Number(existing.qty) || 0) + 1;
          console.log('Increased quantity');
        } else {
          cart.push({
            id: id,
            sku: sku,
            name: name,
            price: price,
            image: button.getAttribute('data-image') || '',
            qty: 1
          });
          console.log('Added new product');
        }

        try {
          window.localStorage.setItem(window.TechGrid.CART_KEY, JSON.stringify(cart));
          console.log('Saved to localStorage');
        } catch (error) {
          console.log('Error saving:', error);
          return;
        }

        window.TechGrid.updateCartBadge();
        console.log('Badge updated');

        var originalText = button.textContent;
        button.textContent = 'Added';
        button.disabled = true;

        setTimeout(function () {
          button.textContent = originalText;
          button.disabled = false;
        }, 1200);

        document.dispatchEvent(new Event('cart:updated'));
      });
    }

  /* ------------------------------------------------------------------------
     5. Start-up
     ------------------------------------------------------------------------ */
  function init() {
    updateCartBadge();
    initMobileMenu();
    initDropdowns();
    initAddToCart();

    // Keep the badge correct when the cart changes in another tab,
    // or when later code announces a change with: document.dispatchEvent(new Event('cart:updated'))
    window.addEventListener('storage', function (event) {
      if (event.key === CART_KEY) updateCartBadge();
    });
    document.addEventListener('cart:updated', updateCartBadge);
  }

  // Small public surface for the cart, filter and WhatsApp scripts added later.
  window.TechGrid = window.TechGrid || {};
  window.TechGrid.CART_KEY = CART_KEY;
  window.TechGrid.readCart = readCart;
  window.TechGrid.updateCartBadge = updateCartBadge;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();