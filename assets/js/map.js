(function () {
  'use strict';

  // Minimal point-in-polygon (ray casting). point: {lat, lon}; polygon: [[lon,lat], ...]
  function pointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];
      const intersect = ((yi > point.lat) !== (yj > point.lat)) &&
        (point.lon < (xj - xi) * (point.lat - yi) / (yj - yi + 0.0000001) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  const sampleAreas = [
    { name: 'Kolhapur Rural, MH', lat: 16.85, lon: 74.68 },
    { name: 'Anantapur Block, AP', lat: 14.65, lon: 77.55 },
    { name: 'Samastipur, BR', lat: 25.85, lon: 85.00 },
    { name: 'Mahbubnagar, TS', lat: 16.74, lon: 78.00 }
  ];

  // Demo coverage polygons (rectangles for simplicity). Coordinates are [lon, lat].
  const coverage = {
    available: {
      name: 'Available',
      color: '#28A745',
      polygon: [
        [74.20, 16.60], [74.90, 16.60], [74.90, 17.10], [74.20, 17.10], [74.20, 16.60]
      ]
    },
    beta: {
      name: 'Beta',
      color: '#FFC107',
      polygon: [
        [77.20, 14.30], [78.00, 14.30], [78.00, 14.90], [77.20, 14.90], [77.20, 14.30]
      ]
    },
    soon: {
      name: 'Coming Soon',
      color: '#0B5ED7',
      polygon: [
        [84.60, 25.70], [85.40, 25.70], [85.40, 26.30], [84.60, 26.30], [84.60, 25.70]
      ]
    }
  };

  function determineStatus(lat, lon) {
    const pt = { lat: lat, lon: lon };
    if (pointInPolygon(pt, coverage.available.polygon)) return 'Available';
    if (pointInPolygon(pt, coverage.beta.polygon)) return 'Beta';
    if (pointInPolygon(pt, coverage.soon.polygon)) return 'Coming Soon';
    return 'Coming Soon';
  }

  function badgeForStatus(status) {
    if (status === 'Available') return '<span class="badge badge-success">Likely Available</span>';
    if (status === 'Beta') return '<span class="badge badge-info">Beta Area</span>';
    if (status === 'Coming Soon') return '<span class="badge badge-warning">Coming Soon</span>';
    return '<span class="badge badge-warning">Coming Soon</span>';
  }

  function initMap() {
    const mapEl = document.getElementById('map');
    if (!mapEl || !window.L) return;

    const map = L.map('map', { scrollWheelZoom: true, attributionControl: true }).setView([21.15, 78.65], 5);
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    function polyToLeaflet(p, color) {
      return L.polygon(p.map(c => [c[1], c[0]]), { color: color, weight: 2, fillOpacity: 0.15 });
    }

    const layerAvailable = polyToLeaflet(coverage.available.polygon, '#28A745').addTo(map);
    const layerBeta = polyToLeaflet(coverage.beta.polygon, '#F0AD4E').addTo(map);
    const layerSoon = polyToLeaflet(coverage.soon.polygon, '#0B5ED7').addTo(map);

    const overlays = {
      'Available': layerAvailable,
      'Beta': layerBeta,
      'Coming Soon': layerSoon
    };
    L.control.layers({ 'OpenStreetMap': tiles }, overlays, { collapsed: false }).addTo(map);

    // Sidebar sample list with status badges
    const listEl = document.getElementById('sample-areas');
    if (listEl) {
      listEl.innerHTML = '';
      sampleAreas.forEach((a, idx) => {
        const status = determineStatus(a.lat, a.lon);
        const li = document.createElement('li');
        li.innerHTML = `<button class=\"btn btn-link\" data-idx=\"${idx}\">${a.name}</button> ${badgeForStatus(status)}`;
        listEl.appendChild(li);
      });
      listEl.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-idx]');
        if (!btn) return;
        const s = sampleAreas[parseInt(btn.dataset.idx, 10)];
        focusPoint(s.lat, s.lon, s.name);
      });
    }

    let marker;
    function focusPoint(lat, lon, label) {
      if (marker) marker.remove();
      marker = L.marker([lat, lon]).addTo(map);
      map.setView([lat, lon], 10);
      const status = determineStatus(lat, lon);
      marker.bindPopup(`<strong>${label || 'Selected Point'}</strong><br>${badgeForStatus(status)}`).openPopup();
      const statusEl = document.getElementById('status-badge');
      if (statusEl) statusEl.innerHTML = badgeForStatus(status);
    }

    // Search input
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (!q) return;
        // Try lat,lon
        const parts = q.split(',').map(s => s.trim());
        if (parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
          const lat = parseFloat(parts[0]);
          const lon = parseFloat(parts[1]);
          focusPoint(lat, lon, `Pinned ${lat.toFixed(3)}, ${lon.toFixed(3)}`);
          return;
        }
        // Try sample area name match
        const found = sampleAreas.find(a => a.name.toLowerCase().includes(q.toLowerCase()));
        if (found) {
          focusPoint(found.lat, found.lon, found.name);
          return;
        }
        // No geocoding in this prototype; prompt user
        if (window.AuraToast) window.AuraToast.show('Enter \"lat, lon\" (e.g., 16.85, 74.68) or pick a sample area.', 'error');
      });
    }

    // If a selector exists, tie it to map
    const selector = document.getElementById('area-select');
    if (selector) {
      selector.innerHTML = sampleAreas.map((a, i) => `<option value=\"${i}\">${a.name}</option>`).join('');
      selector.addEventListener('change', () => {
        const a = sampleAreas[parseInt(selector.value, 10)];
        if (a) focusPoint(a.lat, a.lon, a.name);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initMap);
})();