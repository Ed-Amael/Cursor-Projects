import { useState } from 'react';

export default function HomePage() {
  const [newsletterStatus, setNewsletterStatus] = useState<string | null>(null);
  const [coverage, setCoverage] = useState<string | null>(null);

  async function subscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email') })
      });
      if (!res.ok) throw new Error('Subscribe failed');
      setNewsletterStatus('Subscribed!');
      e.currentTarget.reset();
    } catch { setNewsletterStatus('Unable to subscribe.'); }
  }

  async function checkCoverage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const address = String(form.get('address') || '');
    setCoverage('Checking…');
    try {
      const res = await fetch('/api/coverage/check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      const data = await res.json();
      setCoverage(data.covered ? `Covered ✓ — Suggested plan: ${data.planSuggestion}` : 'Not yet covered — Join waitlist');
    } catch { setCoverage('Unable to check coverage.'); }
  }

  return (
    <div className="grid">
      <section className="hero">
        <h1 className="headline">Connecting rural communities with satellite internet</h1>
        <p className="sub">Affordable plans, reliable performance, and support for programs that help remote households get online.</p>
        <div className="actions">
          <a className="button" href="/plans">View plans</a>
          <a className="button" href="/resources">Government resources</a>
        </div>
      </section>

      <section className="grid cols-2">
        <div className="card">
          <h3>Check coverage</h3>
          <form onSubmit={checkCoverage}>
            <div className="row"><input name="address" className="input" placeholder="Enter your address" required /></div>
            <div className="row"><button className="button" type="submit">Check</button></div>
            {coverage && <p className="muted">{coverage}</p>}
          </form>
        </div>
        <div className="card">
          <h3>Join our newsletter</h3>
          <form onSubmit={subscribe}>
            <div className="row"><input name="email" className="input" type="email" placeholder="you@example.com" required /></div>
            <div className="row"><button className="button" type="submit">Subscribe</button></div>
            {newsletterStatus && <p className="muted">{newsletterStatus}</p>}
          </form>
        </div>
      </section>
    </div>
  );
}