(function auth() {
  const STORAGE_KEY = 'orb_user';
  const mainNav = document.getElementById('mainNav');
  const loginLink = document.getElementById('loginLink');

  function getUser() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; }
  }
  function setUser(user) { localStorage.setItem(STORAGE_KEY, JSON.stringify(user)); }
  function clearUser() { localStorage.removeItem(STORAGE_KEY); }

  function ensureLogoutLink() {
    if (!mainNav) return; 
    const existing = document.getElementById('logoutLink');
    const user = getUser();
    if (user) {
      if (loginLink) loginLink.style.display = 'none';
      if (!existing) {
        const a = document.createElement('a');
        a.id = 'logoutLink';
        a.href = '/login.html?logout=1';
        a.className = 'btn btn-outline';
        a.textContent = 'Logout';
        mainNav.appendChild(a);
      }
    } else {
      if (loginLink) loginLink.style.display = '';
      if (existing) existing.remove();
    }
  }

  // Handle logout via query param
  const params = new URLSearchParams(location.search);
  if (params.get('logout') === '1') {
    clearUser();
    if (location.pathname.endsWith('/login.html')) {
      // stay and display message
      const msg = document.getElementById('loginMsg');
      if (msg) msg.textContent = 'You have been logged out.';
    } else {
      location.replace('/login.html');
    }
  }

  // Login form
  const form = document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const email = String(data.get('email') || '').trim();
      const password = String(data.get('password') || '');
      const remember = data.get('remember') === 'on';
      const msg = document.getElementById('loginMsg');

      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        msg && (msg.textContent = 'Enter a valid email.');
        return;
      }
      if (!password || password.length < 6) {
        msg && (msg.textContent = 'Password must be at least 6 characters.');
        return;
      }

      setUser({ email, ts: Date.now(), remember });
      msg && (msg.textContent = 'Signed in successfully. Redirecting…');
      setTimeout(() => { window.location.replace('/index.html'); }, 600);
    });
  }

  ensureLogoutLink();
})();