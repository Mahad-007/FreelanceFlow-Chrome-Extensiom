chrome.storage.local.get('settings').then(r => {
  if (!r.settings || r.settings.theme === 'dark') document.documentElement.classList.add('dark');
});
