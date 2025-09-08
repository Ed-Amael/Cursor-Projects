import { useEffect, useState } from 'react';

interface Faq { q: string; a: string }

export default function FaqPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);

  useEffect(() => {
    fetch('/api/faqs').then(r => r.json()).then(d => setFaqs(d.faqs || []));
  }, []);

  return (
    <div className="grid">
      {faqs.map((f, i) => (
        <div key={i} className="card">
          <strong>{f.q}</strong>
          <p className="muted">{f.a}</p>
        </div>
      ))}
    </div>
  );
}