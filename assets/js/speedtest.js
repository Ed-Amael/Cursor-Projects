const downEndpoint = 'https://speed.cloudflare.com/__down';
const upEndpoint = 'https://speed.cloudflare.com/__up';
const ipEcho = 'https://1.1.1.1/cdn-cgi/trace';

const startBtn = document.getElementById('startTest');
const cancelBtn = document.getElementById('cancelTest');
const gaugeNeedle = document.getElementById('gaugeNeedle');
const gaugeValue = document.getElementById('gaugeValue');
const latencyVal = document.getElementById('latencyVal');
const downloadVal = document.getElementById('downloadVal');
const uploadVal = document.getElementById('uploadVal');
const ipVal = document.getElementById('ipVal');

let controller = null;

async function detectIP() {
  try {
    const res = await fetch(`${ipEcho}`, { cache: 'no-store' });
    const text = await res.text();
    // ip=1.2.3.4 lines
    const ipLine = text.split('\n').find(l => l.startsWith('ip='));
    if (ipLine) ipVal.textContent = ipLine.split('=')[1];
    else ipVal.textContent = '—';
  } catch (e) {
    ipVal.textContent = '—';
  }
}
if (ipVal) detectIP();

function rotateGauge(mbps) {
  // Map 0..500 Mbps -> -90deg..90deg
  const clamped = Math.max(0, Math.min(500, mbps));
  const deg = -90 + (clamped / 500) * 180;
  if (gaugeNeedle) gaugeNeedle.style.transform = `translateX(-50%) rotate(${deg}deg)`;
  if (gaugeValue) gaugeValue.textContent = mbps.toFixed(2);
}

function average(nums) {
  if (!nums.length) return 0;
  return nums.reduce((a,b)=>a+b,0) / nums.length;
}

async function measureLatency(signal) {
  const runs = 6;
  const times = [];
  for (let i = 0; i < runs; i++) {
    const url = `${downEndpoint}?bytes=1&r=${Math.random()}`;
    const t0 = performance.now();
    try {
      await fetch(url, { cache: 'no-store', signal });
      const t = performance.now() - t0;
      times.push(t);
    } catch (e) {
      if (signal.aborted) throw e;
    }
  }
  // Ignore first run (warm-up)
  const filtered = times.slice(1);
  return average(filtered);
}

async function measureDownload(signal, onProgress) {
  const bytes = 30 * 1024 * 1024; // 30 MB
  const url = `${downEndpoint}?bytes=${bytes}&r=${Math.random()}`;
  const t0 = performance.now();
  const res = await fetch(url, { cache: 'no-store', signal });
  const reader = res.body.getReader();
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    onProgress?.(received);
  }
  const dt = (performance.now() - t0) / 1000;
  const mbps = (received * 8) / dt / 1e6;
  return { mbps, bytes: received, seconds: dt };
}

async function measureUpload(signal, onProgress) {
  const bytes = 10 * 1024 * 1024; // 10 MB
  const payload = new Uint8Array(bytes);
  // Fill with pseudo-random
  for (let i = 0; i < bytes; i += 4096) payload[i] = i % 256;
  const t0 = performance.now();
  await fetch(`${upEndpoint}?r=${Math.random()}`, {
    method: 'POST',
    body: payload,
    headers: { 'Content-Type': 'application/octet-stream' },
    signal,
  });
  const dt = (performance.now() - t0) / 1000;
  const mbps = (bytes * 8) / dt / 1e6;
  onProgress?.(bytes);
  return { mbps, bytes, seconds: dt };
}

if (startBtn && cancelBtn) {
  startBtn.addEventListener('click', async () => {
    // full run with staged gauge progress
    controller = new AbortController();
    const { signal } = controller;
    startBtn.disabled = true;
    cancelBtn.disabled = false;
    latencyVal.textContent = '…';
    downloadVal.textContent = '…';
    uploadVal.textContent = '…';
    rotateGauge(0);

    try {
      const pingMs = await measureLatency(signal);
      latencyVal.textContent = Math.round(pingMs).toString();

      // Download
      const t0 = performance.now();
      const dlRes = await measureDownload(signal, (received) => {
        const dt = (performance.now() - t0) / 1000;
        const mbps = (received * 8) / Math.max(dt, 0.001) / 1e6;
        rotateGauge(mbps);
      });
      downloadVal.textContent = dlRes.mbps.toFixed(2);

      // Upload
      const t1 = performance.now();
      const ulRes = await measureUpload(signal, (sent) => {
        const dt = (performance.now() - t1) / 1000;
        const mbps = (sent * 8) / Math.max(dt, 0.001) / 1e6;
        rotateGauge(mbps);
      });
      uploadVal.textContent = ulRes.mbps.toFixed(2);

      // Settle gauge to download as headline
      rotateGauge(parseFloat(downloadVal.textContent));

    } catch (err) {
      if (signal.aborted) {
        // canceled
      } else {
        console.error(err);
        alert('Speed test failed. Please try again later.');
      }
    } finally {
      startBtn.disabled = false;
      cancelBtn.disabled = true;
    }
  });

  cancelBtn.addEventListener('click', () => {
    if (controller) controller.abort();
    startBtn.disabled = false;
    cancelBtn.disabled = true;
  });
}