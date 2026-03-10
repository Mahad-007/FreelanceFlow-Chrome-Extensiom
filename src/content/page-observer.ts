export function observePageChanges(callback: (url: string) => void) {
  let lastUrl = window.location.href;

  // Watch for URL changes (SPA navigation)
  const urlObserver = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      callback(currentUrl);
    }
  });

  urlObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Also listen for popstate (back/forward navigation)
  window.addEventListener("popstate", () => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      callback(currentUrl);
    }
  });

  // Intercept pushState and replaceState
  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = function (...args) {
    originalPushState(...args);
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      callback(currentUrl);
    }
  };

  history.replaceState = function (...args) {
    originalReplaceState(...args);
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      callback(currentUrl);
    }
  };

  return () => urlObserver.disconnect();
}
