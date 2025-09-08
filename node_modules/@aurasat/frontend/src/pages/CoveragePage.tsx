import { useState } from 'react';

export default function CoveragePage() {
  const [result, setResult] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const address = String(form.get('address') || '');
    setResult('Checking…');
    try {
      const res = await fetch('/api/coverage/check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      const data = await res.json();
      setResult(data.covered ? `Covered ✓ — Suggested plan: ${data.planSuggestion}` : 'Not yet covered — Join waitlist');
    } catch { setResult('Unable to check coverage.'); }
  }

  return (
    <div className="grid">
      <section className="card">
        <h2>Coverage checker</h2>
        <form onSubmit={onSubmit}>
          <div className="row"><input name="address" className="input" placeholder="Enter your address" required /></div>
          <div className="row"><button className="button" type="submit">Check</button></div>
          {result && <p className="muted">{result}</p>}
        </form>
      </section>
    </div>
  );
}