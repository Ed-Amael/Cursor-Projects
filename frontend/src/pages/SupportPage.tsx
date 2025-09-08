import { useEffect, useState } from 'react';

export default function SupportPage() {
  const [options, setOptions] = useState<any>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/support/options').then(r => r.json()).then(setOptions).catch(() => setOptions(null));
  }, []);

  async function submitTicket(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus('Submitting…');
    try {
      const res = await fetch('/api/support/ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.get('email'),
          subject: form.get('subject'),
          message: form.get('message')
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');
      setStatus('Ticket submitted: ' + data.ticket.id);
      e.currentTarget.reset();
    } catch (err: any) {
      setStatus('Error: ' + (err.message || 'Unable to submit'));
    }
  }

  return (
    <div className="grid cols-2">
      <section className="card">
        <h2 className="section-title">Open a support ticket</h2>
        <form onSubmit={submitTicket}>
          <div className="row"><input name="email" className="input" type="email" placeholder="Email" required /></div>
          <div className="row"><input name="subject" className="input" placeholder="Subject" required /></div>
          <div className="row"><textarea name="message" className="textarea" placeholder="Describe your issue" rows={6} required /></div>
          <div className="row"><button className="button" type="submit">Submit</button></div>
          {status && <p className="muted">{status}</p>}
        </form>
      </section>
      <section className="card">
        <h2 className="section-title">Contact options</h2>
        {options ? (
          <ul>
            <li>Phone: {options.phone}</li>
            <li>Chat hours: {options.chatHours}</li>
            <li>Knowledge base: <a href={options.knowledgeBase} target="_blank" rel="noreferrer">link</a></li>
            <li>Status: {options.status}</li>
          </ul>
        ) : (
          <p className="muted">Loading…</p>
        )}
      </section>
    </div>
  );
}