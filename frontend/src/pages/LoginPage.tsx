import { useState } from 'react';

export default function LoginPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus('Signing in…');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: form.get('email'),
          password: form.get('password')
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setStatus('Welcome, ' + data.user.name);
      e.currentTarget.reset();
    } catch (err: any) {
      setStatus('Error: ' + (err.message || 'Unable to login'));
    }
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Login</h2>
        <form onSubmit={onSubmit}>
          <div className="row"><input name="email" className="input" type="email" placeholder="Email" required /></div>
          <div className="row"><input name="password" className="input" type="password" placeholder="Password" required /></div>
          <div className="row"><button className="button" type="submit">Sign in</button></div>
          {status && <p className="muted">{status}</p>}
        </form>
      </section>
    </div>
  );
}