(function () {
  'use strict';

  function initEmbed() {
    const container = document.getElementById('speedtest-embed');
    const fallback = document.getElementById('speedtest-fallback');
    if (!container || !fallback) return;

    try {
      // Attempt to embed Ookla Speedtest in an iframe
      const frame = document.createElement('iframe');
      frame.title = 'Ookla Speedtest';
      frame.width = '100%';
      frame.height = '100%';
      frame.style.border = '0';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      frame.loading = 'lazy';
      frame.src = 'https://www.speedtest.net/embed';

      let loaded = false;
      const timer = setTimeout(() => {
        if (!loaded) showFallback();
      }, 5000);

      frame.addEventListener('load', () => {
        loaded = true;
        clearTimeout(timer);
      });

      container.appendChild(frame);
    } catch (e) {
      showFallback();
    }

    function showFallback() {
      fallback.hidden = false;
      container.innerHTML = '';
    }
  }

  document.addEventListener('DOMContentLoaded', initEmbed);
})();