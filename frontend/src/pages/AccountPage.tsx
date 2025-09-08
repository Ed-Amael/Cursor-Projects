import { useEffect, useState } from 'react';

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/account', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setUser(d.user))
      .catch(() => setUser(null));
  }, []);

  async function logout() {
    setStatus('Logging out…');
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setStatus('Logged out');
    setUser(null);
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Account</h2>
        {user ? (
          <div>
            <p><strong>{user.name}</strong> <span className="muted">({user.email})</span></p>
            <p className="muted">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            <button className="button" onClick={logout}>Log out</button>
            {status && <p className="muted">{status}</p>}
          </div>
        ) : (
          <p className="muted">Please log in to view your account.</p>
        )}
      </section>
    </div>
  );
}