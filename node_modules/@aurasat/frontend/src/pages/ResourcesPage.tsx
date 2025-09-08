import { useEffect, useState } from 'react';

interface Resource { id: string; title: string; url: string; summary: string; }

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/resources').then(r => r.json()).then(d => setResources(d.resources || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="muted">Loading resources…</p>;

  return (
    <div className="grid cols-2">
      {resources.map(r => (
        <div key={r.id} className="card">
          <h3>{r.title}</h3>
          <p className="muted">{r.summary}</p>
          <a className="button" href={r.url} target="_blank" rel="noreferrer">Learn more</a>
        </div>
      ))}
    </div>
  );
}