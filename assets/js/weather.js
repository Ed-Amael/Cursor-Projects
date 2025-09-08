(function () {
  'use strict';

  const sampleAreas = [
    { name: 'Kolhapur Rural, MH', lat: 16.85, lon: 74.68 },
    { name: 'Anantapur Block, AP', lat: 14.65, lon: 77.55 },
    { name: 'Samastipur, BR', lat: 25.85, lon: 85.00 },
    { name: 'Mahbubnagar, TS', lat: 16.74, lon: 78.00 }
  ];

  let chartTemp, chartWind;

  function initSelector() {
    const sel = document.getElementById('weather-location');
    if (!sel) return null;
    sel.innerHTML = sampleAreas.map((a, i) => `<option value="${i}">${a.name}</option>`).join('');
    sel.value = '0';
    return sel;
  }

  function getApiKey() {
    return (window.AuraSAT_CONFIG && window.AuraSAT_CONFIG.OPENWEATHERMAP_API_KEY) || '';
  }

  function kelvinToC(k) { return Math.round((k - 273.15) * 10) / 10; }

  function setCurrent(data) {
    const c = data.current || {};
    setText('current-temp', c.temp != null ? `${kelvinToC(c.temp)} °C` : '—');
    setText('current-humidity', c.humidity != null ? `${c.humidity} %` : '—');
    setText('current-wind', c.wind_speed != null ? `${c.wind_speed} m/s` : '—');
    const rain = (c.rain && (c.rain['1h'] || c.rain['3h'])) || 0;
    setText('current-rain', `${rain} mm`);
    setText('current-pressure', c.pressure != null ? `${c.pressure} hPa` : '—');
  }

  function setText(id, text) { const el = document.getElementById(id); if (el) el.textContent = String(text); }

  function setForecast(data) {
    const el = document.getElementById('forecast');
    if (!el) return;
    const daily = (data.daily || []).slice(0, 7);
    el.innerHTML = daily.map(d => {
      const dt = new Date((d.dt || 0) * 1000);
      const label = dt.toLocaleDateString(undefined, { weekday: 'short' });
      const min = d.temp && d.temp.min != null ? kelvinToC(d.temp.min) : '—';
      const max = d.temp && d.temp.max != null ? kelvinToC(d.temp.max) : '—';
      const desc = (d.weather && d.weather[0] && d.weather[0].description) || '';
      return `<div class="card"><strong>${label}</strong><p class="muted">${min}° / ${max}° · ${desc}</p></div>`;
    }).join('');
  }

  function updateCharts(data) {
    const daily = (data.daily || []).slice(0, 7);
    const labels = daily.map(d => new Date(d.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' }));
    const temps = daily.map(d => kelvinToC(d.temp && d.temp.day));
    const winds = daily.map(d => d.wind_speed || 0);

    const ctxT = document.getElementById('chart-temp');
    const ctxW = document.getElementById('chart-wind');
    if (window.Chart && ctxT && ctxW) {
      if (chartTemp) chartTemp.destroy();
      if (chartWind) chartWind.destroy();
      chartTemp = new Chart(ctxT.getContext('2d'), {
        type: 'line',
        data: { labels: labels, datasets: [{ label: '°C', data: temps, borderColor: '#28A745', backgroundColor: 'rgba(40,167,69,0.15)', tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
      chartWind = new Chart(ctxW.getContext('2d'), {
        type: 'line',
        data: { labels: labels, datasets: [{ label: 'm/s', data: winds, borderColor: '#0B1B3F', backgroundColor: 'rgba(11,27,63,0.15)', tension: 0.3 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
      });
    }
  }

  async function fetchWeather(lat, lon) {
    const key = getApiKey();
    if (!key) {
      if (window.AuraToast) window.AuraToast.show('Add your OpenWeatherMap API key in assets/js/config.js', 'error');
      return null;
    }
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${key}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather fetch failed');
    return res.json();
  }

  let refreshTimer;

  async function loadFor(area) {
    try {
      const data = await fetchWeather(area.lat, area.lon);
      if (!data) return;
      setCurrent(data);
      setForecast(data);
      updateCharts(data);
    } catch (e) {
      console.error(e);
      if (window.AuraToast) window.AuraToast.show('Unable to load weather. Check your API key.', 'error');
    }
  }

  function scheduleRefresh(area) {
    if (refreshTimer) window.clearInterval(refreshTimer);
    refreshTimer = window.setInterval(() => loadFor(area), 15 * 60 * 1000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const sel = initSelector();
    if (!sel) return;
    let current = sampleAreas[parseInt(sel.value, 10)];
    loadFor(current);
    scheduleRefresh(current);
    sel.addEventListener('change', () => {
      current = sampleAreas[parseInt(sel.value, 10)];
      loadFor(current);
      scheduleRefresh(current);
    });
  });
})();