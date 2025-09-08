import { useEffect, useState } from 'react';

interface Plan {
  id: string;
  name: string;
  priceMonthlyUsd: number;
  priceYearlyUsd?: number;
  downMbps: number;
  upMbps: number;
  dataCapGb: number;
  description: string;
  features?: string[];
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearly, setYearly] = useState(false);

  useEffect(() => {
    fetch('/api/plans').then(r => r.json()).then(d => {
      setPlans(d.plans || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading plans…</p>;

  return (
    <div className="grid">
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <label className="row" style={{ gap: 8 }}>
          <input type="checkbox" checked={yearly} onChange={e => setYearly(e.target.checked)} />
          <span>Bill yearly and save 15%</span>
        </label>
      </div>
      <div className="grid cols-3">
        {plans.map(p => (
          <div key={p.id} className="card">
            <h3>{p.name}</h3>
            <p className="muted">{p.description}</p>
            {yearly ? (
              <p><strong>${p.priceYearlyUsd?.toFixed(2)}</strong>/yr</p>
            ) : (
              <p><strong>${p.priceMonthlyUsd.toFixed(2)}</strong>/mo</p>
            )}
            <p>{p.downMbps}↓ / {p.upMbps}↑ Mbps</p>
            <p>{p.dataCapGb} GB monthly data</p>
            <ul>
              {(p.features || []).map((f, i) => <li key={i} className="muted">• {f}</li>)}
            </ul>
            <button className="button">Get started</button>
          </div>
        ))}
      </div>
    </div>
  );
}