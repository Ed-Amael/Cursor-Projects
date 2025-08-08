(function govFilter(){
  const sel = document.getElementById('regionSel');
  const cards = Array.from(document.querySelectorAll('#govGrid .card'));
  if (!sel || !cards.length) return;
  function apply() {
    const region = sel.value;
    cards.forEach(c => {
      const r = c.getAttribute('data-region');
      const show = region === 'global' ? (r === 'global') : (r === region);
      c.style.display = show ? '' : 'none';
    });
  }
  sel.addEventListener('change', apply);
  apply();
})();