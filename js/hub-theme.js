(() => {
  const key = 'shahin-hub-theme';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference;
  try { preference = localStorage.getItem(key); } catch {}
  if (!['dark', 'light'].includes(preference)) preference = null;
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    update();
  }
  function update() {
    const button = document.getElementById('theme-toggle');
    if (!button) return;
    const dark = document.documentElement.dataset.theme === 'dark';
    const bn = document.documentElement.lang === 'bn';
    button.setAttribute('aria-pressed', String(dark));
    document.getElementById('theme-label').textContent = bn ? (dark ? 'দিনের মোড' : 'নাইট মোড') : (dark ? 'Day mode' : 'Night mode');
    button.setAttribute('aria-label', bn ? (dark ? 'দিনের মোড চালু করুন' : 'নাইট মোড চালু করুন') : (dark ? 'Switch to day mode' : 'Switch to night mode'));
  }
  apply(preference || (system.matches ? 'dark' : 'light'));
  document.addEventListener('DOMContentLoaded', () => {
    update();
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, preference); } catch {}
      apply(preference);
    });
  });
  document.addEventListener('language', update);
  system.addEventListener('change', event => { if (!preference) apply(event.matches ? 'dark' : 'light'); });
})();
