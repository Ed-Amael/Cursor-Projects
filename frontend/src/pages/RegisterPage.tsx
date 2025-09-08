import { useState } from 'react';

export default function RegisterPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus('Creating account…');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          password: form.get('password')
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      setStatus('Welcome, ' + data.user.name);
      e.currentTarget.reset();
    } catch (err: any) {
      setStatus('Error: ' + (err.message || 'Unable to register'));
    }
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Create an account</h2>
        <form onSubmit={onSubmit}>
          <div className="row"><input name="name" className="input" placeholder="Full name" required /></div>
          <div className="row"><input name="email" className="input" type="email" placeholder="Email" required /></div>
          <div className="row"><input name="password" className="input" type="password" placeholder="Password (min 8 chars)" required /></div>
          <div className="row"><button className="button" type="submit">Register</button></div>
          {status && <p className="muted">{status}</p>}
        </form>
      </section>
    </div>
  );
}