import { useEffect, useRef, useState } from 'react';

export default function SpeedTestPage() {
  const controllerRef = useRef<AbortController | null>(null);
  const [running, setRunning] = useState(false);
  const [mbps, setMbps] = useState<number | null>(null);

  async function runTest() {
    if (running) return;
    setRunning(true);
    setMbps(null);
    const controller = new AbortController();
    controllerRef.current = controller;
    const sizeMb = 50;
    const url = `/api/speedtest/download?sizeMb=${sizeMb}&_=${Date.now()}`;
    const start = performance.now();
    let bytes = 0;
    try {
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) bytes += value.length;
        const elapsedSec = (performance.now() - start) / 1000;
        if (elapsedSec > 0) setMbps(((bytes * 8) / 1_000_000) / elapsedSec);
      }
      const totalSec = (performance.now() - start) / 1000;
      setMbps(((bytes * 8) / 1_000_000) / totalSec);
    } catch (e) {
      // aborted or failed
    } finally {
      setRunning(false);
    }
  }

  useEffect(() => () => controllerRef.current?.abort(), []);

  return (
    <div className="grid">
      <section className="card">
        <h2 className="section-title">Download speed test</h2>
        <p className="muted">Starts a {50} MB download from the AuraSAT server and estimates throughput.</p>
        <div className="row">
          <button className="button" onClick={runTest} disabled={running}>{running ? 'Running…' : 'Run test'}</button>
          {mbps !== null && <strong>{mbps.toFixed(1)} Mbps</strong>}
        </div>
      </section>
    </div>
  );
}