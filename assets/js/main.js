(function () {
  'use strict';

  function $(selector, root) { return (root || document).querySelector(selector); }
  function $all(selector, root) { return Array.from((root || document).querySelectorAll(selector)); }

  function setActiveNav() {
    const path = location.pathname.split('/').pop() || 'index.html';
    $all('.navlinks a').forEach(a => {
      const href = a.getAttribute('href');
      if ((path === '' && href.endsWith('index.html')) || href.endsWith(path)) {
        a.classList.add('active');
      }
    });
  }

  function setupHeaderShadow() {
    const header = $('.header');
    if (!header) return;
    let last = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      if (y > 4 && last <= 4) {
        header.style.boxShadow = '0 2px 12px rgba(11,27,63,0.18)';
      } else if (y <= 4 && last > 4) {
        header.style.boxShadow = '0 2px 8px rgba(11,27,63,0.15)';
      }
      last = y;
    }, { passive: true });
  }

  // Toasts
  function createToastContainer() {
    let el = $('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    return el;
  }
  function showToast(message, type) {
    const el = createToastContainer();
    el.textContent = message;
    el.classList.remove('success', 'error', 'show');
    if (type) el.classList.add(type);
    requestAnimationFrame(() => el.classList.add('show'));
    window.clearTimeout(el._t);
    el._t = window.setTimeout(() => el.classList.remove('show'), 3200);
  }
  window.AuraToast = { show: showToast };

  // Forms: interest (index) and contact (support)
  function setupForms() {
    const interest = $('#interest-form');
    if (interest) {
      interest.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = interest.querySelector('[name="name"]').value.trim();
        const email = interest.querySelector('[name="email"]').value.trim();
        const location = interest.querySelector('[name="location"]').value.trim();
        if (!name || !email || !location) {
          showToast('Please fill out all fields.', 'error');
          return;
        }
        showToast('Thanks! We\'ll be in touch as coverage expands.', 'success');
        interest.reset();
      });
    }

    const contact = $('#contact-form');
    if (contact) {
      contact.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = contact.querySelector('[name="name"]').value.trim();
        const email = contact.querySelector('[name="email"]').value.trim();
        const message = contact.querySelector('[name="message"]').value.trim();
        if (!name || !email || !message) {
          showToast('Please complete all required fields.', 'error');
          return;
        }
        showToast('Message sent! We\'ll reply by email soon.', 'success');
        contact.reset();
      });
    }
  }

  // Simple analytics opt-in placeholder (no tracking by default)
  function setupAnalyticsToggle() {
    const toggle = $('#analytics-optin');
    if (!toggle) return;
    const saved = localStorage.getItem('aurasat.analytics.optin') === 'true';
    toggle.checked = saved;
    toggle.addEventListener('change', () => {
      const on = toggle.checked;
      localStorage.setItem('aurasat.analytics.optin', String(on));
      if (on) {
        console.log('[AuraSAT] Analytics enabled (placeholder, no tracking by default).');
      } else {
        console.log('[AuraSAT] Analytics disabled.');
      }
    });
  }

  // Register Service Worker
  function registerSW() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(() => {});
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    setupHeaderShadow();
    setupForms();
    setupAnalyticsToggle();
    registerSW();
  });
})();