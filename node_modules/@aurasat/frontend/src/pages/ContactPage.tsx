import { useState } from 'react';

export default function ContactPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus('Sending…');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          message: form.get('message')
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setStatus('Message sent');
      e.currentTarget.reset();
    } catch (err: any) {
      setStatus('Error: ' + (err.message || 'Unable to send'));
    }
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Contact us</h2>
        <form onSubmit={onSubmit}>
          <div className="row"><input name="name" className="input" placeholder="Full name" required /></div>
          <div className="row"><input name="email" className="input" type="email" placeholder="Email" required /></div>
          <div className="row"><textarea name="message" className="textarea" placeholder="Message" rows={6} required /></div>
          <div className="row"><button className="button" type="submit">Send</button></div>
          {status && <p className="muted">{status}</p>}
        </form>
      </section>
    </div>
  );
}